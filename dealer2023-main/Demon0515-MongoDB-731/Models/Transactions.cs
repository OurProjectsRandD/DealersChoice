using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace PersonalizedCardGame.Models
{
    public class Transactions
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }

        public string Description { get; set; } = string.Empty;

        //if positive, you get new token and if negative, you used token.
        public int Tokens { get; set; } = 0;

        //if positive, you used minutes, if negative, you used video minutes.
        public int VideoMinutes { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
