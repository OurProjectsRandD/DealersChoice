namespace PersonalizedCardGame.Models.GameState
{
    public class HandStep
    {
        public int HandId { get; set; } = 0;

        public List<RoundStep> BettingRounds { get; set; } = new List<RoundStep>();

    }
}
