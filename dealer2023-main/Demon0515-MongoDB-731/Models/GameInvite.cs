using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace PersonalizedCardGame.Models
{
    public class GameInvite
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string GameCode { get; set; } = "";
        public string CreatorId { get; set; } = "";

        public string InviteeEmail { get; set; } = "";

        public bool IsJoined { get; set; } = false;
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
