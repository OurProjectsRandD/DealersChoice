using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PersonalizedCardGame.Models.GameState
{
    public class GameHash
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string? HostName { get; set; } = string.Empty;

        public string? GameCreatorId { get; set; } = string.Empty;

        public string? GameCode { get; set; } = string.Empty;

        public bool IsLocked { get; set; } = false;
        public bool IsEnded { get; set; } = false;

        public bool IsInvitesOnly { get; set; } = false;

        public bool VideoChatAllowed { get; set; } = false;

        public string? MeetingId { get; set; } = null;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public DateTime EndDate { get; set; } = DateTime.Now;

        public int NumberOfCommunities { get; set; } = 5;

        //on-game states
        public string CurrentId { get; set; } = "";

        public string DealerId { get; set; } = "";

        public string BetStatus { get; set; } = "New hand. No bet yet.";

        public int BetStatusIndex { get; set; } = 0;

        public int CurrentBet { get; set; } = 0;

        public int PotSize { get; set; } = 0;

        //current hand number
        public int GameHand { get; set; } = 0;

        // current round number
        public int Round { get; set; } = 0;
        // Store VideoMinutes Of The Meething For Deduction the credits
        public int MeetingMinutes { get; set; } = 0;
        public bool IsRoundSettlement { get; set; } = false;
        public List<ActivePlayer> ActivePlayers { get; set; } = new List<ActivePlayer>();

        public List<Card> CommunityCards { get; set; } = new List<Card>();

        public List<HandStep> HandSteps { get; set; } = new List<HandStep>();

        public List<string> Deck { get; set; } = new List<string>() { };

        public void SetInitialDeck()
        {
            string[] suits = { "C", "D", "H", "S" };
            string[] ranks = { "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" };
            Deck = new List<string>();
            foreach (var suit in suits)
                foreach (var rank in ranks)
                    Deck.Add(rank + suit);
        }

        public string SelectFromDeck()
        {
            Random random = new Random();
            int index = random.Next(0, Deck.Count - 1);
            string card = Deck[index];
            Deck.RemoveAt(index);
            return card;
        }


        public bool isNewHand()
        {
            return Deck.Count == 52 ? true : false;
        }
        public int GetDealerIndex()
        {
            return ActivePlayers.FindIndex(x => x.PlayerId == DealerId);
        }
        public ActivePlayer GetDealer()
        {
            return ActivePlayers.Find(x => x.PlayerId == DealerId);
        }

        public int FindNextActivePlayerIndex(int index)
        {
            int newIndex = index, cnt = 0;
            do
            {
                newIndex = (newIndex + 1) % this.ActivePlayers.Count;
                if (this.ActivePlayers[newIndex].IsFolded == false && this.ActivePlayers[newIndex].IsDisconnected == false)
                    return newIndex;
            } while (cnt++ < this.ActivePlayers.Count);
            return -1;
        }

        public string FindNextActivePlayerId(int index)
        {
            int newIndex = this.FindNextActivePlayerIndex(index);
            if (newIndex == -1)
                return "";
            return this.ActivePlayers[newIndex].PlayerId;
        }

        public void AddStep(int index, string actionMessage, string action)
        {
            if (index == -1)
            {
                index = GetDealerIndex();
            }

            if (HandSteps.Count <= GameHand)
            {
                HandSteps.Add(new HandStep()
                {
                    HandId = GameHand,
                });
            }
            if (HandSteps[GameHand].BettingRounds.Count <= Round)
            {
                HandSteps[GameHand].BettingRounds.Add(new RoundStep()
                {
                    RoundId = Round,
                });
            }
            switch (action)
            {
                case "Deal":
                case "Ante":
                    HandSteps[GameHand].BettingRounds[Round].BeforeRoundSteps.Add(new ActionStep()
                    {
                        PlayerId = ActivePlayers[index].PlayerId,
                        PlayerName = ActivePlayers[index].PlayerName,
                        Action = action,
                        Amount = 0,
                        Description = actionMessage
                    });
                    break;
                default:
                    HandSteps[GameHand].BettingRounds[Round].AfterRoundSteps.Add(new ActionStep()
                    {
                        PlayerId = ActivePlayers[index].PlayerId,
                        PlayerName = ActivePlayers[index].PlayerName,
                        Action = action,
                        Amount = 0,
                        Description = actionMessage
                    });
                    break;
            }
        }
    }
}
