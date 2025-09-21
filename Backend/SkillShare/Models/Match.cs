public enum MatchType { Teach, Learn }
namespace SkillShare.Models
{
    public class Match
    {
        public int MatchId { get; set; }

        
        public string UserId { get; set; }
        public AppUser User { get; set; }

        public string MatchedUserId { get; set; }
        public AppUser MatchedUser { get; set; }

        public int SkillId { get; set; }
        public Skill Skill { get; set; }

        public MatchType MatchType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
