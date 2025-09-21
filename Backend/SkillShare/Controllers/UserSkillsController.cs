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
    public class UserSkillsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly UserManager<AppUser> userManager;

        public UserSkillsController(ApplicationDbContext dbContext, UserManager<AppUser> userManager)
        {
            this.dbContext = dbContext;
            this.userManager = userManager;
        }

        [HttpGet("{userId}")]
     
        public async Task<IActionResult> GetUserSkills(string userId)
        {
            var userSkills = await dbContext.UserSkills
                .Include(us => us.Skill)
                .ThenInclude(s => s.Category) // إذا تريد اسم الكاتيجوري
                .Where(us => us.UserId == userId)
                .ToListAsync();

            // تحويل الـ Entities إلى DTO
            var response = userSkills.Select(us => new UserSkillResponseDto
            {
                UserSkillId = us.UserSkillId,
                UserId = us.UserId,
                SkillId = us.Skill.SkillId,
                SkillName = us.Skill.Name,
                CategoryId = us.Skill.Category.CategoryId,
                CategoryName = us.Skill.Category.Name,
                Type = us.Type,
                Level = us.Level
            }).ToList();

            return Ok(response);
        }


        [HttpPost]

        public async Task<IActionResult> AddUserSkill([FromBody] UserSkillInputDto dto)
        {
            // التحقق من وجود الكاتيجوري
            var category = await dbContext.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                return BadRequest("Category not found");

            // البحث عن المهارة الموجودة مسبقاً بنفس الاسم والكاتيجوري
            var skill = await dbContext.Skills
                .FirstOrDefaultAsync(s => s.Name.ToLower() == dto.SkillName.ToLower()
                                          && s.CategoryId == dto.CategoryId);

            // إنشاء المهارة إذا لم توجد
            if (skill == null)
            {
                skill = new Skill
                {
                    Name = dto.SkillName,
                    CategoryId = dto.CategoryId
                };
                dbContext.Skills.Add(skill);
                await dbContext.SaveChangesAsync();
            }

            // إنشاء UserSkill
            var userSkill = new UserSkill
            {
                UserId = dto.UserId,
                SkillId = skill.SkillId,
                Type = dto.Type,
                Level = dto.Level
            };

            dbContext.UserSkills.Add(userSkill);
            await dbContext.SaveChangesAsync();

            // تجهيز Output DTO لتجنب الحلقات الدائرية
            var response = new UserSkillResponseDto
            {
                UserSkillId = userSkill.UserSkillId,
                UserId = userSkill.UserId,
                SkillId = skill.SkillId,
                SkillName = skill.Name,
                CategoryId = category.CategoryId,
                CategoryName = category.Name,
                Type = userSkill.Type,
                Level = userSkill.Level
            };

            return Ok(response);
        }

    }
}
