using System.ComponentModel.DataAnnotations;

namespace PersonalizedCardGame.Models
{
    public class ChangeUserInfoVM
    {
        [Required, MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required, DataType(DataType.Password)]
        public string PrevPassword { get; set; } = string.Empty;

        [Required, DataType(DataType.Password)]
        /*[RegularExpression(@"^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?/~_+-=|\]).{8,32}$")]*/
        public string Password { get; set; } = string.Empty;

        [Required, MaxLength(15)]
        public string DisplayName { get; set; } = string.Empty;
    }
}
