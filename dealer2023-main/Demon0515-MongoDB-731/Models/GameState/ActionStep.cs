namespace PersonalizedCardGame.Models.GameState
{
    public class ActionStep
    {
        public string PlayerId { get; set; } = string.Empty;

        public string PlayerName { get; set; } = string.Empty;

        public string Action { get; set; } = string.Empty;

        public int Amount { get; set; } = 0;

        public string Description { get; set; } = string.Empty;
    }
}
