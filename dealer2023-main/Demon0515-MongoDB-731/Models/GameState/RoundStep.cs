namespace PersonalizedCardGame.Models.GameState
{
    public class RoundStep
    {
        public int RoundId { get; set; } = 0;

        public List<ActionStep> BeforeRoundSteps { get; set; } = new List<ActionStep>();

        public List<ActionStep> AfterRoundSteps { get; set; } = new List<ActionStep>();
    }
}
