using AspNetCore.Identity.MongoDbCore.Models;
using Microsoft.AspNetCore.Identity;
using MongoDbGenericRepository.Attributes;
using System.ComponentModel.DataAnnotations;

namespace PersonalizedCardGame.Models
{
    [CollectionName("Users")]
    public class AppUser: MongoIdentityUser<Guid>
    {
        public string DisplayName { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string ImageFileName { get; set; } = string.Empty;

        public int LoggedInCnt { get; set; } = 0;

        public DateTime LastActive { get; set; } = DateTime.Now;
    }
}
