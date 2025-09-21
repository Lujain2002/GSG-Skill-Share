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
    public class ProfilesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly UserManager<AppUser> userManager;

        public ProfilesController(ApplicationDbContext dbContext, UserManager<AppUser> userManager)
        {
            this.dbContext = dbContext;
            this.userManager = userManager;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserProfileDto>> GetProfile(string id)
        {
            var user = await dbContext.Users
                .Include(u => u.TeachingSessions)
                .Include(u => u.LearningSessions)
                .Include(u => u.UserSkills)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            var dto = new UserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                Location = user.Location,
                Bio = user.Bio,
                TeachingSessionsCount = user.TeachingSessions?.Count ?? 0,
                LearningSessionsCount = user.LearningSessions?.Count ?? 0,
                CanTeachSkillsCount = user.UserSkills?.Count(s => s.Type == SkillType.CanTeach) ?? 0,
                WantToLearnSkillsCount = user.UserSkills?.Count(s => s.Type == SkillType.WantToLearn) ?? 0
            };

            return dto;
        }
        
        [HttpPost("updateAvatar/{id}")]
        public async Task<IActionResult> UpdateAvatar(string id, [FromForm] UpdateAvatarDto dto)
        {
            var user = await userManager.FindByIdAsync(id);
            if (user == null) return NotFound("User not found");

            // في حال ما أرسل صورة
            if (dto.Avatar == null || dto.Avatar.Length == 0)
                return BadRequest("No avatar file uploaded");

            // حذف الصورة القديمة إذا موجودة
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);
            }

            // إنشاء فولدر AvatarImages إذا ما كان موجود
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "AvatarImages");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            // رفع الصورة الجديدة
            var fileName = Guid.NewGuid() + Path.GetExtension(dto.Avatar.FileName);
            var path = Path.Combine(folder, fileName);
            using var stream = new FileStream(path, FileMode.Create);
            await dto.Avatar.CopyToAsync(stream);

            // حفظ المسار الجديد
            user.AvatarUrl = $"/AvatarImages/{fileName}";
            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { avatarUrl = user.AvatarUrl });
        }


        [HttpDelete("{id}/avatar")]
        public async Task<IActionResult> DeleteAvatar(string id)
        {
            var user = await userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);

                user.AvatarUrl = null;
                await userManager.UpdateAsync(user);
            }

            return NoContent();
        }

        
        [HttpPut("updateInfo/{id}")]
        public async Task<IActionResult> UpdateProfileInfo(string id, [FromBody] UpdateProfileDto dto)
        {
            if (id != dto.Id)
                return BadRequest("User ID mismatch");

            var user = await userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            user.Bio = dto.Bio;
            user.Location = dto.Location;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }

    }
}

