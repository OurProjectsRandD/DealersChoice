using Microsoft.Identity.Client;

namespace PersonalizedCardGame.Models.GameState
{
    public class GameStateDTO
    {
        public int CurrentIndex { get; set; } = 0;

        public int DealerIndex { get; set; } = 0;

        public string BetStatus { get; set; } = string.Empty;

        public int BetStatusIndex { get; set; } = 0;

        public int CurrentBet { get; set; } = 0;

        public int GameHand { get; set; } = 0;

        public bool IsRoundSettlement { get; set; } = false;

        public List<ActivePlayer> ActivePlayers { get; set; } = new List<ActivePlayer>();

        public List<Card> CommunityCards { get; set; } = new List<Card>();

        public List<HandStep> HandSteps { get; set; } = new List<HandStep>();
    }

}
