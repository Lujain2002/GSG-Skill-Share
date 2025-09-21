using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillShare.Data;
using SkillShare.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SkillShare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly UserManager<AppUser> userManager;

        public DashboardController(ApplicationDbContext dbContext, UserManager<AppUser> userManager)
        {
            this.dbContext = dbContext;
            this.userManager = userManager;
        }


        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            return Ok(new
            {
                id = user.Id,
                username = user.UserName,
                email = user.Email,
                points = user.Points,
                location = user.Location,
                bio = user.Bio,
                avatarUrl = user.AvatarUrl
            });
        }

        [HttpGet("sessions/summary/{id}")]
        public async Task<IActionResult> GetSessionSummary(string id)
        {
            var user = await userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            var teachingCount = await dbContext.Sessions
                .CountAsync(s => s.TeacherId == user.Id);

            var learningCount = await dbContext.Sessions
                .CountAsync(s => s.StudentId == user.Id);

            return Ok(new
            {
                teachingSessions = teachingCount,
                learningSessions = learningCount
            });
        }

        [HttpGet("community/summary")]
        public async Task<IActionResult> GetCommunitySummary()
        {
            var userCount = await userManager.Users.CountAsync();

            var activeSessions = await dbContext.Sessions
                .CountAsync(s => s.Status == SessionStatus.scheduled);

            return Ok(new
            {
                userCount,
                activeSessions
            });
        }




    }
}
