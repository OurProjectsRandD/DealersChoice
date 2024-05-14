using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace PersonalizedCardGame.Models
{
    public class RegisterVM
    {
        [Required, MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required, DataType(DataType.EmailAddress)]
        public string Email { get; set; } = string.Empty;

        [Required, DataType(DataType.Password)]
        /*[RegularExpression(@"^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?/~_+-=|\]).{8,32}$")]*/
        public string Password { get; set; } = string.Empty;

        [Required, MaxLength(15)]
        public string DisplayName { get; set; } = string.Empty;

        public string ImageFileName { get; set; } = string.Empty;
/*
        [DataType(DataType.Password), Compare(nameof(Password))]
        public string ConfirmPassword { get; set; }*/
        
    }
}
