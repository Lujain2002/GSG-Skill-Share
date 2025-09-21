using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillShare.Data;
using SkillShare.Models;

namespace SkillShare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MatchesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly UserManager<AppUser> userManager;

        public MatchesController(ApplicationDbContext dbContext,UserManager<AppUser> userManager)
        {
            this.dbContext = dbContext;
            this.userManager = userManager;
        }

        [HttpGet("matches/by-category/{categoryId}")]
        public async Task<IActionResult> GetMatchesByCategory(int categoryId)
        {
            var result = await dbContext.Users
                .Include(u => u.UserSkills)
                    .ThenInclude(us => us.Skill)
                .Where(u => u.UserSkills.Any(us =>
                    us.Type == SkillType.CanTeach &&
                    us.Skill.CategoryId == categoryId))
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.AvatarUrl,
                    Score = u.Points, 
                    Teaches = u.UserSkills
                                .Where(us => us.Type == SkillType.CanTeach &&
                                             us.Skill.CategoryId == categoryId)
                                .Select(us => new {
                                    Skill = us.Skill.Name,
                                    Level = us.Level.ToString()
                                }),
                    Wants = u.UserSkills
                                .Where(us => us.Type == SkillType.WantToLearn)
                                .Select(us => new {
                                    Skill = us.Skill.Name,
                                    Category = us.Skill.Category.Name
                                })
                })
                .ToListAsync();

            return Ok(result);
        }

    }
}
