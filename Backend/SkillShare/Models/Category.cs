using System.Text.Json.Serialization;

namespace SkillShare.Models
{
    public class Category
    {
        public int CategoryId { get; set; }

        public string Name { get; set; }

        [JsonIgnore]
        public ICollection<Skill> Skills { get; set; }

    }
}
