using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace PersonalizedCardGame.Models
{
    public class Membership
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        /*This is number id
        1: Free
        2: Basic
        3: Premium
        4: Deluxe
         */
        public int PlanId { get; set; }
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        public double Month_Value_In_Cash { get; set; }
        public int Month_Value_In_Token { get; set; }
        public double Annual_Value_In_Cash { get; set; }
        public int Annual_Value_In_Token { get; set; }
    }
}
