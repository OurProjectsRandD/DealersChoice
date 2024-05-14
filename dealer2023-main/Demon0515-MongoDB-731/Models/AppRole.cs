using AspNetCore.Identity.MongoDbCore.Models;
using MongoDbGenericRepository.Attributes;

namespace PersonalizedCardGame.Models
{
    [CollectionName("Roles")]
    public class AppRole : MongoIdentityRole<Guid>
    {

    }
}
