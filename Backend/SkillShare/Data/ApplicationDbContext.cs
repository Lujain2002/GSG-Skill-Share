using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SkillShare.Models;

namespace SkillShare.Data
{
    public class ApplicationDbContext: IdentityDbContext<AppUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
     : base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

           
            builder.Entity<Session>()
                .HasOne(s => s.Teacher)
                .WithMany(u => u.TeachingSessions)
                .HasForeignKey(s => s.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

           
            builder.Entity<Session>()
                .HasOne(s => s.Student)
                .WithMany(u => u.LearningSessions)
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Match>()
       .HasOne(m => m.User)
       .WithMany(u => u.Matches) 
       .HasForeignKey(m => m.UserId)
       .OnDelete(DeleteBehavior.Restrict);

            // Match - MatchedUser
            builder.Entity<Match>()
                .HasOne(m => m.MatchedUser)
                .WithMany() 
                .HasForeignKey(m => m.MatchedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Category>().HasData(
            new Category { CategoryId = 1, Name = "Academic Subjects" },
            new Category { CategoryId = 2, Name = "Languages" },
            new Category { CategoryId = 3, Name = "Arts & Crafts" },
            new Category { CategoryId = 4, Name = "Professional Skills" },
            new Category { CategoryId = 5, Name = "Technology & Programming" },
            new Category { CategoryId = 6, Name = "Life Skills" },
            new Category { CategoryId = 7, Name = "General" }
        );

        }

        public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<PointsHistory> PointsHistories { get; set; }

        public DbSet<Session> Sessions { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<UserSkill> UserSkills { get; set; }






    }
}
