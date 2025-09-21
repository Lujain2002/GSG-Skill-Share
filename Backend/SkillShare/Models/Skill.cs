using System.Text.RegularExpressions;

namespace SkillShare.Models
{
    public class Skill
    {
        public int SkillId { get; set; }

        public string Name { get; set; }

        public string? Description { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; }

        public ICollection<UserSkill> UserSkills { get; set; }

        public ICollection<Session> Sessions { get; set; }
        public ICollection<Match> Matches { get; set; }
    }
}
