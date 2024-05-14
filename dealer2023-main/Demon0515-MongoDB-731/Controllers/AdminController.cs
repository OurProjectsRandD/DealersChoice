using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PersonalizedCardGame.Models;
using PersonalizedCardGame.Services;

namespace PersonalizedCardGame.Controllers
{

    public class AdminControllRequestModel
    {
        public int Type { get; set; }
    }

    public class RegisteredUserDTO
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime LastActive { get; set; }
    }

    public class GameDTO
    {
        public string? GameCode { get; set; }
        public string? HostName { get; set; }
        public DateTime CreatedOn { get; set; }
        public int DurationSeconds { get; set; }
    }

    [ApiController]
    [Route("[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly SignInHistoryService _signInHistoryService;
        private readonly UserManager<AppUser> _userManager;
        private readonly GameStateService _gameStateService;
        private readonly TransactionService _transactionService;

        public AdminController(TransactionService transactionService, GameStateService gameStateService, UserManager<AppUser> userManager, UserService userService, SignInHistoryService signInHistoryService)
        {
            _userService = userService;
            _userManager = userManager;
            _signInHistoryService = signInHistoryService;
            _gameStateService = gameStateService;
            _transactionService = transactionService;
        }

        [Authorize]
        [HttpPost("get-registered-user-count")]
        public async Task<List<long>> GetRegisteredUserCount()
        {
            List<long> counts = new List<long>();
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return counts;
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return counts;
            long val1, val2, val3;
            val1 = await _userService.GetRegisteredNumber(0);
            val2 = await _userService.GetRegisteredNumber(1);
            val3 = await _userService.GetRegisteredNumber(2);
            counts.Add(val1);
            counts.Add(val2);
            counts.Add(val3);
            return counts;
        }

        [Authorize]
        [HttpPost("get-registered-users")]
        public async Task<List<RegisteredUserDTO>> GetRegisteredUsers([FromBody] AdminControllRequestModel model)
        {
            List<RegisteredUserDTO> users = new List<RegisteredUserDTO>();
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return users;
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return users;
            var results = await _userService.GetRegisteredUser(model.Type);
            results.ForEach(result =>
            {
                users.Add(new RegisteredUserDTO()
                {
                    Name = result!.UserName!,
                    Email = result!.Email!,
                    CreatedOn = result!.CreatedOn,
                    LastActive = result!.LastActive
                });
            });
            return users;
        }

        [Authorize]
        [HttpPost("get-loggedIn-count")]
        public async Task<List<long>> GetLoggedInCount()
        {
            List<long> counts = new List<long>();
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return counts;
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return counts;
            long val1, val2, val3;
            val1 = await _signInHistoryService.GetLoggedInCount(0);
            val2 = await _signInHistoryService.GetLoggedInCount(1);
            val3 = await _signInHistoryService.GetLoggedInCount(2);
            counts.Add(val1);
            counts.Add(val2);
            counts.Add(val3);
            return counts;
        }

        [Authorize]
        [HttpPost("get-loggedIn-users")]
        public async Task<List<SignInHistory>> GetLoggedInUsers([FromBody] AdminControllRequestModel model)
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return new List<SignInHistory>();
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return new List<SignInHistory>();
            var results = await _signInHistoryService.GetSignInHistoriesAsync(model.Type);
            return results;
        }

        [Authorize]
        [HttpPost("get-game-count")]
        public async Task<List<long>> GetGameCount()
        {
            List<long> counts = new List<long>();
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return counts;
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return counts;
            long val1, val2, val3, val4;
            val1 = await _gameStateService.GetGameCount(0);
            val2 = await _gameStateService.GetGameCount(1);
            val3 = await _gameStateService.GetGameCount(2);
            val4 = await _gameStateService.GetGameCount(3);
            counts.Add(val1);
            counts.Add(val2);
            counts.Add(val3);
            counts.Add(val4);
            return counts;
        }

        [Authorize]
        [HttpPost("get-games-by-period")]
        public async Task<List<GameDTO>> GetGamesByPeriod([FromBody] AdminControllRequestModel model)
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return new List<GameDTO>();
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return new List<GameDTO>();
            var results = await _gameStateService.GetGamesByPeriod(model.Type);
            List<GameDTO> games = new List<GameDTO>();
            foreach (var item in results)
            {
                TimeSpan elapsedTime;
                elapsedTime = item.EndDate - item.CreatedDate;
                games.Add(new GameDTO()
                {
                    GameCode = item.GameCode,
                    HostName = item.HostName,
                    CreatedOn = item.CreatedDate,
                    DurationSeconds = item.IsEnded ? (int)Math.Floor(elapsedTime.TotalSeconds) : -1
                });
            }
            return games;
        }

        [Authorize]
        [HttpPost("get-transaction-count")]
        public async Task<List<long>> GetTransactionCount()
        {
            List<long> counts = new List<long>();
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return counts;
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return counts;
            long val1, val2, val3;
            val1 = await _transactionService.GetTransactionCounts(0);
            val2 = await _transactionService.GetTransactionCounts(1);
            val3 = await _transactionService.GetTransactionCounts(2);
            counts.Add(val1);
            counts.Add(val2);
            counts.Add(val3);
            return counts;
        }

        [Authorize]
        [HttpPost("get-avenue")]
        public async Task<List<long>> GetAvenue()
        {
            List<long> counts = new List<long>();
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return counts;
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return counts;
            long val1, val2, val3;
            val1 = await _transactionService.GetRevenue(0);
            val2 = await _transactionService.GetRevenue(1);
            val3 = await _transactionService.GetRevenue(2);
            counts.Add(val1);
            counts.Add(val2);
            counts.Add(val3);
            return counts;
        }

        [Authorize]
        [HttpPost("get-transactions")]
        public async Task<List<Transactions>> GetTranactionsByPeriod([FromBody] AdminControllRequestModel model)
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null)
                return new List<Transactions>();
            bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin)
                return new List<Transactions>();
            var results = await _transactionService.GetTranscationsByPeriod(model.Type);
            return results;
        }
    }
}
