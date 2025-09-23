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
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly UserManager<AppUser> userManager;

        public UsersController(ApplicationDbContext dbContext, UserManager<AppUser> userManager)
        {
            this.dbContext = dbContext;
            this.userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await dbContext.Users
                .Include(u => u.UserSkills)
                    .ThenInclude(us => us.Skill)
                        .ThenInclude(s => s.Category)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.UserName,
                    email = u.Email,
                    points = u.Points,
                    location = u.Location,
                    bio = u.Bio,
                    avatarUrl = u.AvatarUrl,
                    canTeach = u.UserSkills
                        .Where(us => us.Type == SkillType.CanTeach)
                        .Select(us => new
                        {
                            skill = us.Skill.Name,
                            level = us.Level.ToString(),
                            category = us.Skill.Category.Name
                        }),
                    wantLearn = u.UserSkills
                        .Where(us => us.Type == SkillType.WantToLearn)
                        .Select(us => new
                        {
                            skill = us.Skill.Name,
                            category = us.Skill.Category.Name
                        })
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await dbContext.Users
                .Include(u => u.UserSkills)
                    .ThenInclude(us => us.Skill)
                        .ThenInclude(s => s.Category)
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.UserName,
                    email = u.Email,
                    points = u.Points,
                    location = u.Location,
                    bio = u.Bio,
                    avatarUrl = u.AvatarUrl,
                    canTeach = u.UserSkills
                        .Where(us => us.Type == SkillType.CanTeach)
                        .Select(us => new
                        {
                            skill = us.Skill.Name,
                            level = us.Level.ToString(),
                            category = us.Skill.Category.Name
                        }),
                    wantLearn = u.UserSkills
                        .Where(us => us.Type == SkillType.WantToLearn)
                        .Select(us => new
                        {
                            skill = us.Skill.Name,
                            category = us.Skill.Category.Name
                        })
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }
    }
}