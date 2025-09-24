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

        // Update an existing user skill (skill name, level, category). If skill name/category combo changes, reuse existing Skill or create new.
        [HttpPut("{userSkillId}")]
        public async Task<IActionResult> UpdateUserSkill(int userSkillId, [FromBody] UserSkillInputDto dto)
        {
            var userSkill = await dbContext.UserSkills.Include(us => us.Skill).FirstOrDefaultAsync(us => us.UserSkillId == userSkillId);
            if (userSkill == null) return NotFound("UserSkill not found");
            if (userSkill.UserId != dto.UserId) return BadRequest("User mismatch");

            // Update level & type (type rarely changes, but allow if provided)
            userSkill.Level = dto.Level;
            userSkill.Type = dto.Type;

            // Handle skill (name/category) modifications
            var needsSkillChange = false;
            if (!string.Equals(userSkill.Skill.Name, dto.SkillName, StringComparison.OrdinalIgnoreCase)) needsSkillChange = true;
            if (userSkill.Skill.CategoryId != dto.CategoryId) needsSkillChange = true;

            if (needsSkillChange)
            {
                // Look for existing skill
                var existingSkill = await dbContext.Skills.FirstOrDefaultAsync(s => s.Name.ToLower() == dto.SkillName.ToLower() && s.CategoryId == dto.CategoryId);
                if (existingSkill == null)
                {
                    existingSkill = new Skill { Name = dto.SkillName, CategoryId = dto.CategoryId };
                    dbContext.Skills.Add(existingSkill);
                    await dbContext.SaveChangesAsync();
                }
                userSkill.SkillId = existingSkill.SkillId;
            }

            await dbContext.SaveChangesAsync();

            // Return updated
            var category = await dbContext.Categories.FindAsync(dto.CategoryId);
            return Ok(new UserSkillResponseDto
            {
                UserSkillId = userSkill.UserSkillId,
                UserId = userSkill.UserId,
                SkillId = userSkill.SkillId,
                SkillName = (await dbContext.Skills.FindAsync(userSkill.SkillId))!.Name,
                CategoryId = category?.CategoryId ?? dto.CategoryId,
                CategoryName = category?.Name ?? string.Empty,
                Type = userSkill.Type,
                Level = userSkill.Level
            });
        }

        [HttpDelete("{userSkillId}")]
        public async Task<IActionResult> DeleteUserSkill(int userSkillId)
        {
            var userSkill = await dbContext.UserSkills.FindAsync(userSkillId);
            if (userSkill == null) return NotFound();
            dbContext.UserSkills.Remove(userSkill);
            await dbContext.SaveChangesAsync();
            return NoContent();
        }

    }
}
