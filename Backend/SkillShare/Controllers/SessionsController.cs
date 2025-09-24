using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillShare.Data;
using SkillShare.DTO;
using SkillShare.Models;

namespace SkillShare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly UserManager<AppUser> userManager;

        public SessionsController(ApplicationDbContext dbContext, UserManager<AppUser> userManager)
        {
            this.dbContext = dbContext;
            this.userManager = userManager;
        }

        // Pairing limits (could be moved to config later)
        private const int MAX_CONCURRENT_SCHEDULED_PER_PAIR = 1; // only one outstanding scheduled session between the same two users (any direction)
        private const int MAX_DAILY_SESSIONS_PER_PAIR = 2;        // in last 24h (completed or scheduled)
        private const int MAX_WEEKLY_SESSIONS_PER_PAIR = 5;       // in last 7 days
        private const int COOLDOWN_DAYS_AFTER_MUTUAL_EXCHANGE = 14; // cooldown before same pair can book again (unless new skill)
        private const bool ALLOW_NEW_UNTAUGHT_SKILL_DURING_COOLDOWN = true; // exemption flag

        [HttpPost("sessions/book")]
        public async Task<IActionResult> BookSession([FromBody] BookSessionDto dto)
        {
            var student = await dbContext.Users.FindAsync(dto.StudentId);
            var teacher = await dbContext.Users.FindAsync(dto.TeacherId);

            if (student == null || teacher == null)
                return NotFound("User not found");

            // Enforce anti-spam pairing limits (count sessions in either direction of pair)
            var now = DateTime.UtcNow;
            var dayWindow = now.AddDays(-1);
            var weekWindow = now.AddDays(-7);

            var pairQuery = dbContext.Sessions.Where(s =>
                (s.TeacherId == dto.TeacherId && s.StudentId == dto.StudentId) ||
                (s.TeacherId == dto.StudentId && s.StudentId == dto.TeacherId));

            // Mutual exchange logic with cooldown & skill exemption
            var completedPairSessions = await pairQuery
                .Where(s => s.Status == SessionStatus.Completed)
                .Select(s => new { s.TeacherId, s.StudentId, s.SkillId, s.CreatedAt })
                .ToListAsync();

            var aTaughtB = completedPairSessions.Any(s => s.TeacherId == dto.TeacherId && s.StudentId == dto.StudentId);
            var bTaughtA = completedPairSessions.Any(s => s.TeacherId == dto.StudentId && s.StudentId == dto.TeacherId);
            var mutualExchange = aTaughtB && bTaughtA;
            if (mutualExchange)
            {
                var lastCompleted = completedPairSessions.Max(s => s.CreatedAt);
                var cooldownEnds = lastCompleted.AddDays(COOLDOWN_DAYS_AFTER_MUTUAL_EXCHANGE);
                var nowUtc = now;
                var inCooldown = nowUtc < cooldownEnds;
                if (inCooldown)
                {
                    bool allow = false;
                    if (ALLOW_NEW_UNTAUGHT_SKILL_DURING_COOLDOWN)
                    {
                        // Determine if this skill was already taught in *this* direction
                        var alreadyTaughtThisSkillDirection = completedPairSessions.Any(s => s.TeacherId == dto.TeacherId && s.StudentId == dto.StudentId && s.SkillId == dto.SkillId);
                        if (!alreadyTaughtThisSkillDirection)
                        {
                            allow = true; // skill-specific exemption
                        }
                    }
                    if (!allow)
                    {
                        var remaining = cooldownEnds - nowUtc;
                        return Conflict($"Mutual exchange completed. Cooldown active {remaining.Days}d {remaining.Hours}h left. New bookings blocked unless a new skill (not yet exchanged in this direction).");
                    }
                }
            }

            var concurrentScheduled = await pairQuery.CountAsync(s => s.Status == SessionStatus.scheduled);
            if (concurrentScheduled >= MAX_CONCURRENT_SCHEDULED_PER_PAIR)
                return StatusCode(StatusCodes.Status429TooManyRequests, $"Pair already has {concurrentScheduled} scheduled session. Complete or cancel it before booking another.");

            var dailyCount = await pairQuery.CountAsync(s => s.CreatedAt >= dayWindow);
            if (dailyCount >= MAX_DAILY_SESSIONS_PER_PAIR)
                return StatusCode(StatusCodes.Status429TooManyRequests, $"Pair limit reached: max {MAX_DAILY_SESSIONS_PER_PAIR} sessions per 24h.");

            var weeklyCount = await pairQuery.CountAsync(s => s.CreatedAt >= weekWindow);
            if (weeklyCount >= MAX_WEEKLY_SESSIONS_PER_PAIR)
                return StatusCode(StatusCodes.Status429TooManyRequests, $"Pair limit reached: max {MAX_WEEKLY_SESSIONS_PER_PAIR} sessions per 7 days.");

            // Deduct points (align history change amount with deduction)
            const int sessionCost = 5;
            if (student.Points < sessionCost)
                return BadRequest("Not enough points to book the session.");
            student.Points -= sessionCost;

            var session = new Session
            {
                SkillId = dto.SkillId,
                TeacherId = dto.TeacherId,
                StudentId = dto.StudentId,
                Duration = dto.Duration,
                Status = SessionStatus.scheduled,
                ScheduledAt = dto.ScheduledAt ?? now.AddMinutes(5), // default slight future if not provided
            };
             
            dbContext.Sessions.Add(session);

            dbContext.PointsHistories.Add(new PointsHistory
            {
                UserId = student.Id,
                Change = -sessionCost,
                Reason = $"Booked session with {teacher.UserName}"
            });

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Session booked successfully", sessionId = session.SessionId, cost = sessionCost });
        }

        [HttpGet("sessions/user/{userId}")]
        public async Task<IActionResult> GetUserSessions(string userId)
        {
            var sessions = await dbContext.Sessions
                .Include(s => s.Skill)
                .Include(s => s.Teacher)
                .Include(s => s.Student)
                .Where(s => s.TeacherId == userId || s.StudentId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    s.SessionId,
                    Skill = s.Skill.Name,
                    Teacher = s.Teacher.UserName,
                    Learner = s.Student.UserName,
                    s.Duration,
                    Status = s.Status.ToString(),
                    s.ScheduledAt
                })
                .ToListAsync();

            return Ok(sessions);
        }
        [HttpPost("sessions/{sessionId}/cancel")]
        public async Task<IActionResult> CancelSession(int sessionId)
        {
            var session = await dbContext.Sessions
                .Include(s => s.Student)
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null)
                return NotFound();

            if (session.Status != SessionStatus.scheduled)
                return BadRequest("Session cannot be cancelled.");

            session.Status = SessionStatus.Cancelled;

            session.Student.Points += 5;

            dbContext.PointsHistories.Add(new PointsHistory
            {
                UserId = session.Student.Id,
                Change = +5,
                Reason = $"Session {sessionId} cancelled"
            });

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Session cancelled and points refunded." });
        }



    }
}
