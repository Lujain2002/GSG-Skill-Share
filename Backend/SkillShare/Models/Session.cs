public enum SessionStatus {scheduled, Cancelled, Completed }


namespace SkillShare.Models
{
    public class Session
    {
        public int SessionId { get; set; }

        public int SkillId { get; set; }
        public Skill Skill { get; set; }

        public string TeacherId { get; set; }
        public AppUser Teacher { get; set; }

        public string StudentId { get; set; }
        public AppUser Student { get; set; }

        public int Duration { get; set; } 
        public SessionStatus Status { get; set; }
        public DateTime ScheduledAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
