using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using PersonalizedCardGame.Constants;
using PersonalizedCardGame.Models;
using PersonalizedCardGame.Services;

namespace PersonalizedCardGame.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]/[action]")]
    public class MembershipManageController : ControllerBase
    {
        private readonly AssetService _AssetService;
        private readonly GameStateService _GameService;
        private readonly TransactionService _TransactionService;
        private readonly MembershipService _MembershipService;
        private UserManager<AppUser> _UserManager;
        public MembershipManageController(UserManager<AppUser> userManager, AssetService assetService, TransactionService transactionService, MembershipService membershipService,GameStateService gameStateService)
        {
            _TransactionService = transactionService;
            _UserManager = userManager;
            _AssetService = assetService;
            _MembershipService = membershipService;
            _GameService = gameStateService;
        }

        [HttpPost]
        public async Task<List<Membership>> _GetAllMemberShips()
        {
            var memberships = await _MembershipService.GetAllAsync();
            return memberships;
        }

        [HttpPost]
        public async Task<Membership> _GetCurrentMembership()
        {
            var asset = await _AssetService.GetCollection().Find(x => x.UserId == HttpContext.Items["UserId"] as string).FirstOrDefaultAsync();
            var membership = await _MembershipService.GetMembershipByPlanIdAsync(asset.MembershipPlanId);
            return membership!;
        }

        [HttpPost]
        public async Task<Asset> _GetAsset()
        {
            var asset = await _AssetService.GetCollection().Find(x => x.UserId == HttpContext.Items["UserId"] as string).FirstOrDefaultAsync();
            return asset;
        }

        [HttpPost]
        public async Task<bool> _UpdateMembership([FromBody] MembershipManageModel model)
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var asset = await _AssetService.GetCollection().Find(x => x.UserId == userId).FirstOrDefaultAsync();
            var user = await _UserManager.FindByIdAsync(userId!);
            var membership = await _MembershipService.GetMembershipByPlanIdAsync(model.MembershipPlanId);
            if (asset != null && membership != null)
            {
                asset.MembershipPlanId = model.MembershipPlanId;
                asset.Tokens += model.BillingPeriod == 0 ? membership.Month_Value_In_Token : membership.Annual_Value_In_Token;
                asset.BillingPeriod = model.BillingPeriod;
                Transactions transaction = new Transactions()
                {
                    UserId = asset.UserId,
                    UserName = user!.UserName,
                    UserEmail = user!.Email,
                    Tokens = model.BillingPeriod == 0 ? membership.Month_Value_In_Token : membership.Annual_Value_In_Token,
                    Description = "Updated Membership to " + membership.Name + " for a " + (model.BillingPeriod == 0 ? "month" : "year"),
                };
                await _AssetService.UpdateAsync(asset.Id!, asset);
                await _TransactionService.CreateAsync(transaction);
                return true;
            }
            return false;
        }

        [HttpPost]
        public async Task<bool> _PurchaseTokens([FromBody] MembershipManageModel model)
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var asset = await _AssetService.GetCollection().Find(x => x.UserId == userId).FirstOrDefaultAsync();
            var user = await _UserManager.FindByIdAsync(userId!);
            if (asset != null)
            {
                asset.Tokens += model.Tokens;
                Transactions transaction = new Transactions()
                {
                    UserId = asset.UserId,
                    UserName = user!.UserName,
                    UserEmail = user!.Email,
                    Tokens = model.Tokens,
                    Description = "Purchased " + model.Tokens + " tokens",
                };
                await _AssetService.UpdateAsync(asset.Id!, asset);
                await _TransactionService.CreateAsync(transaction);
                return true;
            }
            return false;
        }

        [HttpPost]
        public async Task<bool> _PurchaseVideoTime([FromBody] MembershipManageModel model)
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var asset = await _AssetService.GetCollection().Find(x => x.UserId == userId).FirstOrDefaultAsync();
            var user = await _UserManager.FindByIdAsync(userId!);
            if (asset != null)
            {
                var tokenRequired = model.VideoMinutes / AssetConstant.VideoMinutesPerToken;
                if (tokenRequired > asset.Tokens)
                    return false;
                asset.Tokens -= tokenRequired;
                asset.VideoTime += model.VideoMinutes;

                await _AssetService.UpdateAsync(asset.Id!, asset);
                await _TransactionService.CreateAsync(new Transactions()
                {
                    UserId = asset.UserId,
                    UserEmail = user!.Email,
                    UserName = user!.UserName,
                    Tokens = -tokenRequired,
                    VideoMinutes = model.VideoMinutes,
                    Description = "Purchased " + model.VideoMinutes + " video minutes with " + tokenRequired + " tokens"
                });
                return true;
            }
            return false;
        }

        [HttpPost]
        public async Task<Dictionary<string, int>> _DecreaseVideoTime([FromBody] MembershipManageModel model)
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var asset = await _AssetService.GetCollection().Find(x => x.UserId == userId).FirstOrDefaultAsync();
            var user = await _UserManager.FindByIdAsync(userId!);
            if (asset != null)
            {
                asset.VideoTime -= model.VideoMinutes;
                asset.Tokens -= model.VideoMinutes;
                await _AssetService.UpdateAsync(asset.Id!, asset);
                await _TransactionService.CreateAsync(new Transactions()
                {
                    UserId = asset.UserId,
                    UserEmail = user!.Email,
                    UserName = user!.UserName,
                    Tokens = 0,
                    VideoMinutes = -model.VideoMinutes,
                    Description = "Used " + model.VideoMinutes + " in the Game " + model.GameCode + " , the meetingId is " + model.MeetingId
                });

                return new Dictionary<string, int>
                  {
                      { "VideoTime", asset.VideoTime },
                      { "Tokens", asset.Tokens }
                  };
            }
            return new Dictionary<string, int>
              {
                  { "VideoTime", -1 },
                  { "Tokens", -1 }
              };
        }
        [HttpPost]
        public async Task<Dictionary<string, int>> _DecreaseVideoTimeRuntime([FromBody] MembershipManageModel model)
        {
            string? userId = HttpContext.Items["UserId"] as string;
            var gamestate = await _GameService.GetByGameCodeAsync(model.GameCode);
            var actualminutes=model.VideoMinutes-gamestate.MeetingMinutes;
            var asset = await _AssetService.GetCollection().Find(x => x.UserId == userId).FirstOrDefaultAsync();
            var user = await _UserManager.FindByIdAsync(userId!);
            if (asset != null)
            {
                asset.VideoTime -= actualminutes;
                asset.Tokens -= actualminutes;
                gamestate.MeetingMinutes = model.VideoMinutes;
                await _AssetService.UpdateAsync(asset.Id!, asset);
                await _GameService.UpdateAsync(gamestate.Id!, gamestate);
                await _TransactionService.CreateAsync(new Transactions()
                {
                    UserId = asset.UserId,
                    UserEmail = user!.Email,
                    UserName = user!.UserName,
                    Tokens = 0,
                    VideoMinutes = -model.VideoMinutes,
                    Description = "Used " + model.VideoMinutes + " in the Game " + model.GameCode + " , the meetingId is " + model.MeetingId
                });

                return new Dictionary<string, int>
                  {
                      { "VideoTime", asset.VideoTime },
                      { "Tokens", asset.Tokens }
                  };
            }
            return new Dictionary<string, int>
              {
                  { "VideoTime", -1 },
                  { "Tokens", -1 }
              };
        }
    
}
}
