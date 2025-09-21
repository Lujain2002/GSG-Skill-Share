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
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly UserManager<AppUser> userManager;

        public CategoriesController(ApplicationDbContext dbContext, UserManager<AppUser> userManager)
        {
            this.dbContext = dbContext;
            this.userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await dbContext.Categories.ToListAsync();
            return Ok(categories);
        }

        [HttpGet("categories/{categoryId}/skills")]
        public async Task<IActionResult> GetSkillsByCategory(int categoryId)
        {
            var skills = await dbContext.Skills
                .Where(s => s.CategoryId == categoryId)
                .Select(s => new { s.SkillId, s.Name })
                .ToListAsync();

            return Ok(skills);
        }

    }
}
