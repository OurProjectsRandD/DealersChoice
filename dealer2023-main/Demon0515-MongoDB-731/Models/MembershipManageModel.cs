namespace PersonalizedCardGame.Models
{
    public class MembershipManageModel
    {
        public int MembershipPlanId { get; set; }
        public int BillingPeriod { get; set; }

        public int Tokens { get; set; }
        public int VideoMinutes { get; set; }

        public string GameCode { get; set; } = "";

        public string MeetingId { get; set; } = "";
    }
}
