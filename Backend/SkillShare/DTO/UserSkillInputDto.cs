namespace SkillShare.DTO
{
    public class UserSkillInputDto
    {
        public string UserId { get; set; }
        public int CategoryId { get; set; }
        public string SkillName { get; set; }      
        
        public SkillType Type { get; set; }
        public SkillLevel Level { get; set; }
    }
}
