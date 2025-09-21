namespace SkillShare.DTO
{
    public class BookSessionDto
    {
        public int SkillId { get; set; }
        public string TeacherId { get; set; }
        public string StudentId { get; set; }
        public int Duration { get; set; }
        public DateTime? ScheduledAt { get; set; }
    }
}
