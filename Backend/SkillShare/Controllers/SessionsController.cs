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

        [HttpPost("sessions/book")]
        public async Task<IActionResult> BookSession([FromBody] BookSessionDto dto)
        {
            var student = await dbContext.Users.FindAsync(dto.StudentId);
            var teacher = await dbContext.Users.FindAsync(dto.TeacherId);

            if (student == null || teacher == null)
                return NotFound("User not found");

            if (student.Points < 5)
                return BadRequest("Not enough points to book the session.");

            student.Points -= 5;

            var session = new Session
            {
                SkillId = dto.SkillId,
                TeacherId = dto.TeacherId,
                StudentId = dto.StudentId,
                Duration = dto.Duration,
                Status = SessionStatus.scheduled,
                ScheduledAt = (DateTime)dto.ScheduledAt,
            };
             
            dbContext.Sessions.Add(session);

            dbContext.PointsHistories.Add(new PointsHistory
            {
                UserId = student.Id,
                Change = -10,
                Reason = $"Booked session with {teacher.UserName}"
            });

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Session booked successfully", sessionId = session.SessionId });
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
