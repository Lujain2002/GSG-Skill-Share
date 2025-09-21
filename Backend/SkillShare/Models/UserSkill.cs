public enum SkillType { CanTeach, WantToLearn }
public enum SkillLevel { Beginner, Intermediate, Advanced }

namespace SkillShare.Models
{
    public class UserSkill
    {
        public int UserSkillId { get; set; }

        public string UserId { get; set; }
        public AppUser User { get; set; }

        public int SkillId { get; set; }
        public Skill Skill { get; set; }

        public SkillType Type { get; set; }
        public SkillLevel Level { get; set; }

    }
}
