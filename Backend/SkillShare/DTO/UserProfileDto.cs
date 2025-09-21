namespace SkillShare.DTO
{
    public class UserProfileDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string AvatarUrl { get; set; }
        public string Location { get; set; }
        public string Bio { get; set; }

        public int TeachingSessionsCount { get; set; }
        public int LearningSessionsCount { get; set; }

        public int CanTeachSkillsCount { get; set; }
        public int WantToLearnSkillsCount { get; set; }
    }
}
