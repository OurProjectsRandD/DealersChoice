using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using PersonalizedCardGame.Constants;

namespace PersonalizedCardGame.Models
{
    public class Asset
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        //Unique Id for user.
        public string? UserId { get; set; }

        //Native Token Count
        public int Tokens { get; set; } = AssetConstant.Initial_Token_Count;

        public int VideoTime { get; set; } = AssetConstant.Initial_Video_Time;

        public int MembershipPlanId { get; set; } = 1;

        public string MembershipName { get; set; } = "Free";

        public DateTime LastMembershipBillDate { get; set; } = DateTime.Now;

        //0: Month, 1: Annual
        public int BillingPeriod { get; set; } = 0;
    }
}