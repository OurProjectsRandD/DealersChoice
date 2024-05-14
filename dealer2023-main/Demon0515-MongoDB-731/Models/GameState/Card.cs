using Microsoft.CodeAnalysis.CSharp.Syntax;
using PersonalizedCardGame.Controllers;

namespace PersonalizedCardGame.Models.GameState
{
    public class Card
    {
        // card's value
        public string Value { get; set; } = string.Empty;

        // 0: visible to everyone, 1: visitle to only you, 
        public int Presentation { get; set; } = 0;

        // community card index
        public int CommunityIndex { get; set; } = -1;

        public Card() { }
        public Card(DraggingCard t)
        {
            Value = t.Value;
            Presentation = t.Presentation; 
            CommunityIndex = t.CommunityIndex;
        }
    }
}
