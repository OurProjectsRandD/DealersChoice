using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using MongoDbGenericRepository.Attributes;

namespace PersonalizedCardGame.Models
{
    [CollectionName("SignInHistories")]
    public class SignInHistory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string? Name { get; set; }
        public string? Email { get; set; }
        public DateTime Time { get; set; }
    }
}
