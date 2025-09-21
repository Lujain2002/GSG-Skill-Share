namespace SkillShare.DTO
{
    public class UserSkillResponseDto
    {
        public int UserSkillId { get; set; }
        public string UserId { get; set; }

        public int SkillId { get; set; }
        public string SkillName { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; }

        public SkillType Type { get; set; }
        public SkillLevel Level { get; set; }
    }
}
