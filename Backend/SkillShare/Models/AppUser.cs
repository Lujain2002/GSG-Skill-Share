using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;

namespace SkillShare.Models
{
    public class AppUser : IdentityUser
    {
        public string ?Location { get; set; }
        public string? Bio { get; set; }

        public string? AvatarUrl { get; set; }

        public int Points { get; set; } = 10;

        public ICollection<UserSkill> UserSkills { get; set; }

        public ICollection<Session> TeachingSessions { get; set; }

        public ICollection<Session> LearningSessions { get; set; }

        public ICollection<Match> Matches { get; set; }
         
        public ICollection<PointsHistory> PointsHistories { get; set; }

    }
}
