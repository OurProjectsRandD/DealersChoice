using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PersonalizedCardGame.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Reflection;
using PersonalizedCardGame.Constants;
using Microsoft.EntityFrameworkCore;
using PersonalizedCardGame.Services;
using MongoDB.Driver;
using Microsoft.Extensions.Hosting.Internal;
using System.Linq;

namespace PersonalizedCardGame.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly AssetService _assetService;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _config;
        private readonly int MAX_FILE_SIZE = 200 * 1024;
        private readonly IWebHostEnvironment _env;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly UserService _userService;
        private readonly SignInHistoryService _signInHistoryService;

        public AuthController(SignInHistoryService signInHistoryService, UserService userService, RoleManager<AppRole> roleManager, IWebHostEnvironment env, UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration config,AssetService assetService)
        {
            _userService = userService;
            _roleManager = roleManager;
            _env = env;
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
            _assetService = assetService;
            _signInHistoryService = signInHistoryService;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp(RegisterVM register)
        {
            if (!ModelState.IsValid) return BadRequest(new { field = "", message="Invalid Model" });

            AppUser newUser = new AppUser
            {
                Email = register.Email,
                UserName = register.Username,
                DisplayName = register.DisplayName,
                FirstName = register.FirstName,
                LastName = register.LastName,
                ImageFileName = register.ImageFileName,
            };

            IdentityResult result = await _userManager.CreateAsync(newUser, register.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new { field = "", message = result.Errors.First().Description });
            }
            
            await _assetService.CreateAsync(new Asset() { UserId = newUser.Id.ToString() });

            return Ok();
        }

        [HttpPost("change-user-info")]
        [Authorize]
        public async Task<IActionResult> ChangeUserInfo(ChangeUserInfoVM register)
        {
            if(!ModelState.IsValid) return BadRequest(new { field = "", message = "Invalid Model" });

            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return BadRequest(new { field = "", message = "Authorization Error" });

            IdentityResult result = await _userManager.ChangePasswordAsync(user, register.PrevPassword, register.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new { field = "", message = result.Errors.First().Description });
            }

            user.FirstName = register.FirstName;
            user.LastName = register.LastName;
            user.UserName = register.Username;
            user.DisplayName = register.DisplayName;
            await _userManager.UpdateAsync(user);

            return Ok(user);
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please provide a valid file.");
            if (file.Length > MAX_FILE_SIZE)
                return BadRequest("The file size exceeds the maximum 200KB");
            string extension = Path.GetExtension(file.FileName);
            if (!(extension == ".jpg" || extension == ".jpeg" || extension == ".png" || extension == ".gif"))
            {
                return BadRequest("Only Accept .jpg, .jpeg, .png and .gif");
            }
            string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            string path;
            if (_env.IsDevelopment())
                path = "ClientApp/public/";
            else
                path = "wwwroot/";

            using (var stream = new FileStream(path + fileName, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(fileName);
        }

        [Authorize]
        [HttpPost("change-image")]
        public async Task<IActionResult> ChangeImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please provide a valid file.");
            if (file.Length > MAX_FILE_SIZE)
                return BadRequest("The file size exceeds the maximum 200KB");
            string extension = Path.GetExtension(file.FileName);
            if (!(extension == ".jpg" || extension == ".jpeg" || extension == ".png" || extension == ".gif"))
            {
                return BadRequest("Only Accept .jpg, .jpeg, .png and .gif");
            }

            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return BadRequest("Authorizatino Error");
            if (user.ImageFileName.Length == 0)
            {
                user.ImageFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            }
            string path;
            if (_env.IsDevelopment())
                path = "ClientApp/public/";
            else
                path = "wwwroot/";

            using (var stream = new FileStream(path + user.ImageFileName, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            await _userManager.UpdateAsync(user);

            return Ok("Succed");
        }

        private string generateJwtToken(AppUser user)
        {
            // generate token that is valid for 7 days
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["AppSettings:Secret"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim("id", user.Id.ToString()) }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn(SignInVM signIn)
        {
            var user = await _userManager.FindByEmailAsync(signIn.Email);
            if (user == null)
                return BadRequest(new { field = "email", message = "Email doesn't exist." });

            var result = await _signInManager.PasswordSignInAsync(user, signIn.Password, signIn.RememberMe, true);
            if (!result.Succeeded)
                return BadRequest(new { field = "password", message = "Password is incorrect." });
            user.LoggedInCnt = user.LoggedInCnt + 1;
            user.LastActive = DateTime.Now;
            await _signInHistoryService.CreateAsync(new SignInHistory()
            {
                Name = user.UserName,
                Email = user.Email,
                Time = DateTime.Now,
            });
             var asset = await _assetService.GetAsyncByUserId(user.Id.ToString());

            var token = generateJwtToken(user);

            var roles = await _userManager.GetRolesAsync(user);
            await _userManager.UpdateAsync(user);

            return Ok(new { token = token, user = user, asset = asset, roles = roles });
        }

        [Authorize]
        [HttpPost("get-user")]
        public async Task<UserAndAssetDTO> GetUser()
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return null!;
            var roles = await _userManager.GetRolesAsync(user);
            var asset = await _assetService.GetCollection().Find(x => x.UserId == userId).FirstOrDefaultAsync();
            UserAndAssetDTO userAndAssetDTO = new UserAndAssetDTO()
            {
                User = user,
                Asset = asset,
                Roles = roles.ToList<string>(),
            };
            return userAndAssetDTO;
        }

        [Authorize]
        [HttpPost("sign-out")]
        public async Task<bool> SignOut()
        {
            var user = await _userManager.GetUserAsync(User);
            await _signInManager.SignOutAsync();
            return true;
        }


        [HttpGet("add-role")]
        public async Task<string> AddRole(string role)
        {
            AppRole newRole = new AppRole
            {
                Name = role
            };
            IdentityResult result = await _roleManager.CreateAsync(newRole);
            
            if (result.Succeeded)
                return "Success";
            else
                return "Failed";
        }
    }
}
