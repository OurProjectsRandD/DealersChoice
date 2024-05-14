namespace PersonalizedCardGame.Models.GameState
{
    public class ActivePlayer
    {
        // player unique id in asp.net user collection
        public string PlayerId { get; set; } = string.Empty;

        public string PlayerImage { get; set; } = string.Empty;

        // player name
        public string PlayerName { get; set; } = string.Empty;
        
        // player's current bank account
        public int PlayerNetStatusFinal { get; set; } = 0;

        // player's card
        public List<Card> PlayerCards { get; set; } = new List<Card>();

        // ?
        public int PlayerAmount { get; set; } = 0;

        // true: you have sit out(IsFolded is also true), false: you have rejoined
        public bool IsSitOut { get; set; } = false;

        // true: you have folded for the current hand, false: not folded and continue to play
        public bool IsFolded { get; set; } = false;

        // true: you turned on real-time chat, false: you turned off real-time chat
        public bool IsRealTimeChat { get; set; } = true;
        public bool IsRealTimeChatForMic { get; set; } = true;
        // true: you disconnected from the SingalR, false: you connected to SignalR
        public bool IsDisconnected { get; set; } = false;

        public string ConnectionId { get; set; } = string.Empty;

        public int CurrentRoundStatus { get; set; } = 0;

        public int Balance { get; set; } = 0;

        public string LastActionPerformed { get; set; } = string.Empty;
    }
}
