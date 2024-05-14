using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace PersonalizedCardGame.Models
{
    public partial class Player
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string? PlayerUniqueId { get; set; }
        public string? UserName { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Modified { get; set; }
        public bool? IsActive { get; set; }
        public string? SignalRconnectionId { get; set; }
        public bool? IsConnected { get; set; }
        public string? GameCode { get; set; }
        public long? CurrentGameId { get; set; }
        public int? PlayerSno { get; set; }
        public bool? IsDealer { get; set; }
        public bool? IsCurrent { get; set; }
        public DateTime? LastActionTime { get; set; }
        public bool? IsFolded { get; set; }
        public bool? IsSitOut { get; set; }
    }
}
