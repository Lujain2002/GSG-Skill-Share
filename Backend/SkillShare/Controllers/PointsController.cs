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
    public class PointsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly UserManager<AppUser> userManager;

        public PointsController(ApplicationDbContext dbContext, UserManager<AppUser> userManager)
        {
            this.dbContext = dbContext;
            this.userManager = userManager;
        }

        [HttpGet("ledger/{userId}")]
        public async Task<IActionResult> GetLedger(string userId)
        {
            var entries = await dbContext.PointsHistories
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new {
                    p.Id,
                    p.Change,
                    p.Reason,
                    Date = p.CreatedAt,
                    Type = p.Change >= 0 ? "Earned" : "Deducted"
                })
                .ToListAsync();

            var currentBalance = entries.Sum(e => e.Change);

            var earnRatePer30 = 5;

            return Ok(new
            {
                currentBalance,
                earnRatePer30,
                entries
            });
        }

    }
}
