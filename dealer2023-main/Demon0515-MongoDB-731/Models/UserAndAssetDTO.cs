namespace PersonalizedCardGame.Models
{
    public class UserAndAssetDTO
    {
        public AppUser User { get; set; } = new AppUser();

        public Asset Asset { get; set; } = new Asset();

        public List<string> Roles { get; set; } = new List<string>();
    }
}
