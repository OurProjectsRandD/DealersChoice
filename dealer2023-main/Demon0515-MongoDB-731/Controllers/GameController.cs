using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Data.SqlClient;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using MongoDB.Driver.Core.Connections;
using PersonalizedCardGame.Hubs;
using PersonalizedCardGame.Models;
using PersonalizedCardGame.Models.GameState;
using PersonalizedCardGame.Services;
using System.Linq;
using System.Numerics;

namespace PersonalizedCardGame.Controllers
{
    public class DraggingCard : Card
    {
        public int Index { get; set; } = 0;
        /*
            Type = 0, Player's Card
            Type = 2, Community's Card
        */
        public int Type { get; set; } = 0;

    }

    public class GameControllerRequestModel {
        public string? HostName { get; set; } = string.Empty;
        public string? MeetingId { get; set; } = string.Empty;
        public string? UserId { get; set; } = string.Empty;
        public string? DisplayName { get; set; } = string.Empty;
        public string? GameCode { get; set; } = string.Empty;
        public string? InviteeEmail { get; set; } = string.Empty;
        public bool? IsRecurring { get; set; } = false;
        public bool? IsInvitesOnly { get; set; } = false;
        public bool? VideoChatAllowed { get; set; } = false;
        public bool Status { get; set; } = true;


        public string? ConnectionId { get; set; } = string.Empty;

        public List<DraggingCard> DraggingCards { get; set; } = new List<DraggingCard>();

        public int Index { get; set; } = -1;

        public int Type { get; set; } = 0;

        public int Amount { get; set; } = 0;

        public int DealType { get; set; } = 0;
        public string? DealerId { get; set; } = string.Empty;
    }

    [Route("[controller]/[action]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private IHubContext<GameClass> _HubContext;
        private UserManager<AppUser> _UserManager;
        private readonly GameStateService _GameStateService;
        private readonly GameInviteService _GameInviteService;
        private readonly MembershipService _MembershipService;
        private readonly PlayerService _PlayerService;
        private readonly RecurringGameService _RecurringGameService;

        public GameController(IHubContext<GameClass> hubcontext, UserManager<AppUser> userManager,
            GameStateService gameStateService, GameInviteService gameInviteService, MembershipService membershipService, PlayerService playerService, RecurringGameService recurringGameService)
        {
            if (_HubContext == null)
            {
                _HubContext = hubcontext;
            }

            _UserManager = userManager;
            _GameStateService = gameStateService;
            _GameInviteService = gameInviteService;
            _MembershipService = membershipService;
            _PlayerService = playerService;
            _RecurringGameService = recurringGameService;
        }

        private async Task<AppUser?> GetUser(HttpContext httpContext)
        {
            string? UserId = HttpContext.Items["UserId"] as string;
            if (UserId != null) {
                var user = await _UserManager.FindByIdAsync(UserId);
                return user;
            }
            return null;
        }

        [HttpPost]
        public async Task<bool> CreateGame([FromBody] GameControllerRequestModel model)
        {
            try
            {
                var user = await GetUser(HttpContext);
                if (user == null)
                {
                    user = new AppUser()
                    {
                        Id = Guid.Parse(model.UserId!),
                        UserName = model.DisplayName,
                        DisplayName = model.DisplayName!
                    };
                }

                //Create Game and initialize Deck as 52 cards
                GameHash gameHash = new GameHash()
                {
                    GameCreatorId = user.Id.ToString(),
                    HostName = model.HostName,
                    MeetingId = model.MeetingId,
                    GameCode = model.GameCode,
                    IsInvitesOnly = model.IsInvitesOnly == true ? true : false,
                    VideoChatAllowed = model.VideoChatAllowed == true ? true : false,
                    DealerId = user.Id.ToString()
                };
                gameHash.SetInitialDeck();

                if (model.IsRecurring == true && user != null)
                {
                    await _RecurringGameService.CreateAsync(new RecurringGames()
                    {
                        Name = model.HostName!,
                        CreatorId = user.Id.ToString(),
                    });
                }

                await _GameStateService.CreateAsync(gameHash);

                return true;
            } catch (Exception ex)
            {
                return false;
            }

        }

        [HttpPost]
        public async Task<string?> GetMeetinId([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                return gameHash.MeetingId;
            } catch(Exception ex)
            {
                return null;
            }
        }

        [HttpPost]
        [HttpPost]
        public async Task<GameHash?> JoinGame([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);

                // Check for game restrictions.
                if (gameHash.IsLocked && gameHash.GameCreatorId != model.UserId)
                    return null;

                if (gameHash.IsInvitesOnly && gameHash.GameCreatorId != model.UserId)
                {
                    var user = await _UserManager.FindByIdAsync(model.UserId!);
                    if (user == null || await _GameInviteService.GetByUserIdAndGameAsync(model.GameCode, user.Email!) == null)
                        return null;
                }

                var activePlayer = gameHash.ActivePlayers.FirstOrDefault(x => x.PlayerId == model.UserId);
                var notificationTasks = new List<Task>();

                if (activePlayer != null)
                {
                    //activePlayer.IsRealTimeChat = true;
                    //activePlayer.IsRealTimeChatForMic = true;

                    await _GameStateService.SetPlayerConnection(model.GameCode!, model.UserId!, model.ConnectionId!, false);

                    foreach (var player in gameHash.ActivePlayers)
                    {
                        if (player.PlayerId != model.UserId)
                        {
                            notificationTasks.Add(_HubContext.Clients.Client(player.ConnectionId).SendAsync("Other_Connected", model.UserId!, model.ConnectionId!));
                        }
                        if (player.PlayerId == model.UserId)
                        {
                            notificationTasks.Add(_HubContext.Clients.Client(player.ConnectionId).SendAsync("Other_Disconnected", model.UserId!, model.ConnectionId!));
                        }
                    }
                }
                else
                {
                    if (gameHash.ActivePlayers.Count == 6)
                    {
                        return null;
                    }

                    var user = await _UserManager.FindByIdAsync(model.UserId!);
                    var playerImage = user?.ImageFileName ?? string.Empty;

                    var newPlayer = new ActivePlayer()
                    {
                        PlayerId = model.UserId!,
                        PlayerImage = playerImage,
                        PlayerName = model.DisplayName!,
                        ConnectionId = model.ConnectionId!,
                        IsRealTimeChatForMic = true,
                        IsRealTimeChat = true,

                    };

                    if (gameHash.ActivePlayers.Count == 1)
                        gameHash.CurrentId = model.UserId!;

                    gameHash.ActivePlayers.Add(newPlayer);
                    await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);

                    foreach (var player in gameHash.ActivePlayers)
                    {
                        if (player.PlayerId != model.UserId)
                        {
                            notificationTasks.Add(_HubContext.Clients.Client(player.ConnectionId).SendAsync("Other_Joined", model.UserId!, playerImage, model.DisplayName!, model.ConnectionId!));
                        }
                    }
                }

                await Task.WhenAll(notificationTasks);

                return gameHash;
            }
            catch (Exception ex)
            {
                // Ideally, log the exception here for troubleshooting purposes.
                return null;
            }
        }


        [HttpPost]
        public async Task<bool> PassCards([FromBody] GameControllerRequestModel model)
        {
            try
            {
                var gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                var removeResult = await _GameStateService.RemoveCards(model.GameCode!, model.DraggingCards);
                var addResult = await _GameStateService.AddCards(model.GameCode!, model.DraggingCards, (int)model.Index!, (int)model.Type!);
                if (removeResult && addResult)
                {
                    gameHash.ActivePlayers.ForEach(async Player =>
                    {
                        if (Player.PlayerId != model.UserId)
                            await _HubContext.Clients.Client(Player.ConnectionId).SendAsync("PassCard", model.DraggingCards, model.Index!, model.Type!);
                    });
                    return true;
                }
                return false;
            } catch (Exception ex) {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<bool> KickPlayer([FromBody] GameControllerRequestModel model)
        {
            try
            {
                var user = await GetUser(HttpContext);
                var gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                if (gameHash.GameCreatorId != user!.Id.ToString())
                    return false;
                
                //current player is left
                if (gameHash.CurrentId == gameHash.ActivePlayers[model.Index!].PlayerId)
                    gameHash.CurrentId = gameHash.FindNextActivePlayerId(model.Index!);
                
                //dealer player is kicked out
                else if (gameHash.DealerId == gameHash.ActivePlayers[model.Index!].PlayerId)
                    gameHash.DealerId = gameHash.FindNextActivePlayerId(model.Index!);
                ActivePlayer player = gameHash.ActivePlayers[model.Index];
                gameHash.ActivePlayers.RemoveAt(model.Index!);

                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async Player =>
                {
                    if (Player.PlayerId != user.Id.ToString())
                        await _HubContext.Clients.Client(Player.ConnectionId).SendAsync("Player_Left", model.Index!);
                });
                await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Kicked_Out", model.Index!);
                return true;
            } catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> LeftGame([FromBody] GameControllerRequestModel model)
        {
            try
            {
                var gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                //current player is left
                if (gameHash.CurrentId == gameHash.ActivePlayers[model.Index!].PlayerId)
                    gameHash.CurrentId = gameHash.FindNextActivePlayerId(model.Index!);
                else if (gameHash.DealerId == gameHash.ActivePlayers[model.Index!].PlayerId)
                    gameHash.DealerId = gameHash.FindNextActivePlayerId(model.Index!);
                gameHash.ActivePlayers.RemoveAt(model.Index!);
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);

                gameHash.ActivePlayers.ForEach(async Player =>
                {
                    if (Player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(Player.ConnectionId).SendAsync("Player_Left", model.Index!);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private GameHash OnPlayerAction(GameHash gameHash, int currentIndex)
        {
            int HighestBet = gameHash.ActivePlayers.Max(player => player.CurrentRoundStatus);
            gameHash.IsRoundSettlement = false;
            gameHash.CurrentBet = HighestBet;
            int newIndex = gameHash.FindNextActivePlayerIndex(currentIndex);
            gameHash.CurrentId = gameHash.ActivePlayers[newIndex].PlayerId;
            int currentPlayerbet = gameHash.CurrentBet - gameHash.ActivePlayers[newIndex].CurrentRoundStatus;
            gameHash.BetStatusIndex = newIndex;
            gameHash.BetStatus = "The bet is " +
                    currentPlayerbet +
                    " to " +
                    gameHash.ActivePlayers[newIndex].PlayerName;
            if (gameHash.ActivePlayers.FindAll(x => x.IsFolded == false && x.CurrentRoundStatus == gameHash.CurrentBet).Count
                == gameHash.ActivePlayers.FindAll(x => x.IsFolded == false).Count)
            {
                gameHash.CurrentBet = 0;
                gameHash.ActivePlayers.ForEach(player =>
                    player.CurrentRoundStatus = 0
                );
                gameHash.Round++;

                if(gameHash.HandSteps.Count == gameHash.GameHand)
                {
                    gameHash.HandSteps.Add(new HandStep()
                    {
                        HandId = gameHash.GameHand
                    });
                }
                gameHash.HandSteps[gameHash.GameHand].BettingRounds.Add(new RoundStep()
                {
                    RoundId = gameHash.Round,
                });
            }

            return gameHash;
        }

        [HttpPost]
        public async Task<bool> Bet([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);

                gameHash.ActivePlayers[model.Index].PlayerAmount -= model.Amount;
                gameHash.ActivePlayers[model.Index].CurrentRoundStatus += model.Amount;

                string actionMsg = " bet: " + model.Amount;
                if (gameHash.CurrentBet < model.Amount)
                {
                    actionMsg = " raised by:" + (model.Amount - gameHash.CurrentBet) + "- bet: " + model.Amount;
                    gameHash.CurrentBet = model.Amount;
                }
                gameHash.ActivePlayers[model.Index].LastActionPerformed = actionMsg;
                gameHash.AddStep(model.Index, actionMsg, "Bet");

                //gameHash.HandSteps.Add()

                gameHash.PotSize += model.Amount;
                gameHash = OnPlayerAction(gameHash, model.Index);
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async player =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Bet", model.Index!, model.Amount);
                });
                return true;
            } catch(Exception ex) {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Call([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                int currentPlayerBet = gameHash.CurrentBet - gameHash.ActivePlayers[model.Index].CurrentRoundStatus;
                gameHash.ActivePlayers[model.Index].CurrentRoundStatus = gameHash.CurrentBet;

                gameHash.ActivePlayers[model.Index].PlayerAmount -= currentPlayerBet;
                gameHash.PotSize += currentPlayerBet;

                string actionMsg = " called with " + currentPlayerBet;
                gameHash.ActivePlayers[model.Index].LastActionPerformed = actionMsg;
                gameHash.AddStep(model.Index, actionMsg, "Call");

                //gameHash.HandSteps.Add()

                gameHash = OnPlayerAction(gameHash, model.Index);
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async player =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Call", model.Index!);
                });
                return true;
            } catch(Exception ex) {
                return false;
            }
            
        }

        [HttpPost]
        public async Task<bool> AddToPot([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);

                gameHash.ActivePlayers[model.Index].PlayerAmount -= model.Amount;
                gameHash.PotSize += model.Amount;

                string actionMsg = " added " + model.Amount + "$ to pot";
                gameHash.ActivePlayers[model.Index].LastActionPerformed = actionMsg;
                gameHash.AddStep(model.Index, actionMsg, "AddToPot");

                //gameHash.HandSteps.Add()
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);

                gameHash.ActivePlayers.ForEach(async player =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("AddToPot", model.Index!, model.Amount);
                });
                return true;
            } catch(Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Ante([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);

                gameHash.ActivePlayers.ForEach(player =>
                {
                    if (!player.IsDisconnected && !player.IsFolded)
                    {
                        player.PlayerAmount -= model.Amount;
                        gameHash.PotSize += model.Amount;
                    }
                });

                string actionMsg = "Ante " + model.Amount;
                gameHash.ActivePlayers[model.Index].LastActionPerformed = actionMsg;
                gameHash.AddStep(model.Index, "anted " + model.Amount + "$", "Ante");

                //gameHash.HandSteps.Add()
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);

                gameHash.ActivePlayers.ForEach(async player =>
                {
                    if(player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Ante", model.Index!, model.Amount);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> CancelHand([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers.ForEach(player =>
                {
                    if (player.PlayerAmount < 0)
                        gameHash.PotSize += player.PlayerAmount;
                    player.PlayerAmount = 0;
                    player.Balance = 0;
                    player.CurrentRoundStatus = 0;
                    player.LastActionPerformed = "";
                    player.PlayerCards = new List<Card>();
                    if (!player.IsSitOut) player.IsFolded = false;
                });
                gameHash.BetStatus = "New Hand. No bet yet.";
                gameHash.CurrentBet = 0;
                gameHash.CommunityCards = new List<Card>();
                gameHash.SetInitialDeck();
                gameHash.AddStep(gameHash.GetDealerIndex(), "cancelled hand", "Cancel_Hand");

                gameHash.GameHand += 1;
                gameHash.Round = 0;
                gameHash.HandSteps.Add(new HandStep()
                {
                    HandId = gameHash.GameHand
                });
                gameHash.CurrentId = gameHash.FindNextActivePlayerId(gameHash.GetDealerIndex());

                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (Player) =>
                {
                    if (Player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(Player.ConnectionId).SendAsync("Cancel_Hand");
                });
                return true;
            } catch(Exception ex) {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Check([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index].LastActionPerformed = " Pass";
                gameHash = OnPlayerAction(gameHash, model.Index);
                gameHash.AddStep(model.Index, " pass", "Check");
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Check", model.Index!);
                });
                return true;
            } catch(Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Discard([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index].LastActionPerformed = " Discarded " + model.DraggingCards.Count + " cards";
                model.DraggingCards.ForEach(draggingCard =>
                {
                    if (draggingCard.Type == 0)
                        gameHash.ActivePlayers[model.Index].PlayerCards.RemoveAll(x => x.Value == draggingCard.Value);
                    else
                        gameHash.CommunityCards.RemoveAll(x => x.Value == draggingCard.Value);
                });
                gameHash.AddStep(model.Index, gameHash.ActivePlayers[model.Index].LastActionPerformed, "Discard");
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Discard", model.DraggingCards, model.Index!);
                });
                return true;
            } catch(Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Show([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                
                model.DraggingCards.ForEach(draggingCard =>
                {
                    if (draggingCard.Type == 0)
                        gameHash.ActivePlayers[model.Index].PlayerCards.Find(x => x.Value == draggingCard.Value).Presentation = 0;
                    else
                        gameHash.CommunityCards.Find(x => x.Value == draggingCard.Value).Presentation = 0;
                });

                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Show", model.DraggingCards, model.Index!);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> ReturnToDeck([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index].LastActionPerformed = " Returned " + model.DraggingCards.Count + " cards";
                model.DraggingCards.ForEach(draggingCard =>
                {
                    if (draggingCard.Type == 0)
                    {
                        gameHash.ActivePlayers[model.Index].PlayerCards.RemoveAll(x => x.Value == draggingCard.Value);
                    }
                    else
                        gameHash.CommunityCards.RemoveAll(x => x.Value == draggingCard.Value);

                    gameHash.Deck.Add(draggingCard.Value);
                });
                gameHash.AddStep(model.Index, gameHash.ActivePlayers[model.Index].LastActionPerformed, "ReturnToDeck");
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("ReturnToDeck", model.DraggingCards, model.Index!);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> DealCards([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                List<ActivePlayer> activePlayers = gameHash.ActivePlayers.FindAll(x => x.IsFolded == false);

                int DealCardAmount = model.Type == 0 && model.Index == -1 ? model.Amount * activePlayers.Count : model.Amount;
                if (DealCardAmount > gameHash.Deck.Count)
                {
                    return false;
                }
                List<DraggingCard> draggingCards = new List<DraggingCard>();
                string action;
                //Deal to all players
                if (model.Index == -1 && model.Type == 0)
                {
                    action = "Deal " + model.Amount + " cards to all players";
                    int playerIndex = 0;
                    gameHash.ActivePlayers.ForEach(player =>
                    {
                        if (player.IsFolded == false)
                        {
                            for (int i = 0; i < model.Amount; i++)
                            {
                                string card_value = gameHash.SelectFromDeck();
                                player.PlayerCards.Add(new Card()
                                {
                                    Value = card_value,
                                    Presentation = model.DealType
                                });
                                draggingCards.Add(new DraggingCard()
                                {
                                    Value = card_value,
                                    Presentation = model.DealType,
                                    Index = playerIndex,
                                    Type = 0
                                });
                            }
                        }
                        playerIndex++;
                    });
                }
                else
                {
                    action = "Deal " + model.Amount + " cars to " + (model.Type == 0 ? activePlayers[model.Index!].PlayerName : "community " + (model.Index + 1));
                    for (int i = 0; i < model.Amount; i++)
                    {
                        string card_value = gameHash.SelectFromDeck();
                        if (model.Type == 0)
                        {
                            activePlayers[model.Index!].PlayerCards.Add(new Card()
                            {
                                Value = card_value,
                                Presentation = model.DealType
                            });
                            draggingCards.Add(new DraggingCard()
                            {
                                Value = card_value,
                                Presentation = model.DealType,
                                Type = 0,
                                Index = model.Index!
                            });
                        }
                        else
                        {
                            gameHash.CommunityCards.Add(new Card()
                            {
                                Value = card_value,
                                Presentation = model.DealType,
                                CommunityIndex = model.Index
                            });
                            draggingCards.Add(new DraggingCard()
                            {
                                Value = card_value,
                                Presentation = model.DealType,
                                Type = 1,
                                Index = model.Index!
                            });
                        }
                        
                    }
                }
                gameHash.GetDealer().LastActionPerformed = action;
                gameHash.AddStep(gameHash.GetDealerIndex(), action, "Deal");
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    await _HubContext.Clients.Client(player.ConnectionId).SendAsync("DealCards", draggingCards, action);
                });
                return true;
            } catch(Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> PassDeal([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.DealerId = model.DealerId!;
                if (gameHash.isNewHand())
                {
                    gameHash.CurrentId = gameHash.FindNextActivePlayerId(gameHash.GetDealerIndex());
                }
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("PassDeal", model.DealerId!);
                });
                return true;
            } catch(Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Take([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index!].LastActionPerformed = "Took " + model.Amount + "$";
                gameHash.ActivePlayers[model.Index!].PlayerAmount += model.Amount;
                gameHash.PotSize -= model.Amount;
                gameHash.AddStep(model.Index, gameHash.ActivePlayers[model.Index!].LastActionPerformed, "Take");
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Take", model.Index!, model.Amount);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Endhand([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.AddStep(-1, "ended hand", "EndHand");
                gameHash.IsRoundSettlement = true;
                gameHash.ActivePlayers.ForEach((player) =>
                {
                    player.PlayerNetStatusFinal += player.PlayerAmount;
                    player.PlayerAmount = 0;
                    player.Balance = 0;
                    player.CurrentRoundStatus = 0;
                    player.LastActionPerformed = "";
                    player.PlayerCards = new List<Card>();
                    if (!player.IsSitOut) player.IsFolded = false;
                });
                gameHash.CommunityCards = new List<Card>();
                gameHash.CurrentBet = 0;
                gameHash.SetInitialDeck();
                gameHash.GameHand += 1;
                gameHash.Round = 0;
                gameHash.HandSteps.Add(new HandStep()
                {
                    HandId = gameHash.GameHand
                });

                gameHash.BetStatus = "New Hand. No bet yet.";
                gameHash.CurrentId = gameHash.FindNextActivePlayerId(gameHash.GetDealerIndex());

                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("End_Hand", model.Index!, model.DealerId);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Endgame([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.IsEnded = true;
                gameHash.EndDate = DateTime.Now;
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Endgame");
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Sitout([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index].LastActionPerformed = " Sitout";
                gameHash.AddStep(model.Index, "sitout", "Sitout");
                gameHash.ActivePlayers[model.Index].IsSitOut = true;
                gameHash.ActivePlayers[model.Index].IsFolded = true;
                
                gameHash.ActivePlayers[model.Index].PlayerCards.ForEach(card =>
                {
                    card.Presentation = 1;
                });
                OnPlayerAction(gameHash, model.Index);
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Sitout", model.Index!);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Rejoin([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index].LastActionPerformed = " Rejoin";
                gameHash.AddStep(model.Index, "rejoined", "Rejoin");
                gameHash.ActivePlayers[model.Index].IsSitOut = false;
                OnPlayerAction(gameHash, model.Index);
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Rejoin", model.Index!);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<bool> Fold([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index].LastActionPerformed = " Fold";
                gameHash.AddStep(model.Index, " folded", "Fold");
                gameHash.ActivePlayers[model.Index].IsFolded = true;
                gameHash.ActivePlayers[model.Index].PlayerCards.ForEach(card =>
                {
                    card.Presentation = 1;
                });
                OnPlayerAction(gameHash, model.Index);
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async (player) =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Fold", model.Index!);
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<bool> ToggleLock([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.IsLocked = !gameHash.IsLocked;
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> ToggleCamera([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index].IsRealTimeChat = model.Status;

                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);

                //// Create a list to store the tasks
                //var notificationTasks = new List<Task>();

                //foreach (var player in gameHash.ActivePlayers)
                //{
                //    if (player.PlayerId != model.UserId)
                //    {
                //        // Add the task to send the notification to the list
                //        notificationTasks.Add(_HubContext.Clients.Client(player.ConnectionId).SendAsync("ToggleCamera", model.Index!, model.Status));
                //    }
                //}

                //// Await all notification tasks to ensure they all complete
                //await Task.WhenAll(notificationTasks);

                return true;
            }
            catch (Exception ex)
            {
                // Ideally, log the exception here for troubleshooting purposes
                return false;
            }
        }
        public async Task<bool> ToggleMic([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers[model.Index].IsRealTimeChatForMic = model.Status;
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);

                //// Create a list to store the tasks
                //var notificationTasks = new List<Task>();

                //foreach (var player in gameHash.ActivePlayers)
                //{
                //    if (player.PlayerId != model.UserId)
                //    {
                //        // Add the task to send the notification to the list
                //        notificationTasks.Add(_HubContext.Clients.Client(player.ConnectionId).SendAsync("ToggleMic", model.Index!, model.Status));
                //    }
                //}

                //// Await all notification tasks to ensure they all complete
                //await Task.WhenAll(notificationTasks);

                return true;
            }
            catch (Exception ex)
            {
                // Ideally, log the exception here for troubleshooting purposes
                return false;
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<bool> Invite([FromBody] GameControllerRequestModel model)
        {
            try
            {
                var user = await GetUser(HttpContext);
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                if (gameHash.GameCreatorId != user!.Id.ToString())
                    return false;
                await _GameInviteService.CreateAsync(new GameInvite()
                {
                    CreatorId = user.Id.ToString(),
                    InviteeEmail = model.InviteeEmail!,
                    GameCode = model.GameCode!
                });
                return true;
            } catch(Exception ex)
            {
                return false;
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<List<GameInvite>> GetInvitees([FromBody] GameControllerRequestModel model)
        {
            var invitees = await _GameInviteService.GetCollection().Find(x => x.GameCode == model.GameCode).ToListAsync();
            return invitees;
        }

        [Authorize]
        [HttpPost]
        public async Task<List<GameHash>> GetPastGames()
        {
            var user = await GetUser(HttpContext);
            var gameresp = await _GameStateService.GetCollection().Find(x => x.IsEnded == true && x.GameCreatorId == user!.Id.ToString()).ToListAsync();
            return gameresp;
        }

        [Authorize]
        [HttpPost]
        public async Task<List<RecurringGames>> GetRecurringGames()
        {
            var user = await GetUser(HttpContext);
            var gameresp = await _RecurringGameService.GetCollection().Find(x => x.CreatorId == user!.Id.ToString()).ToListAsync();
            return gameresp;
        }

        [Authorize]
        [HttpPost]
        public async Task<bool> StartVideoMeeting([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers.ForEach(async player =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Join_Meeting");
                });
                return true;
            } catch (Exception ex)
            {
                return false;
            }

        }

        [Authorize]
        [HttpPost]
        public async Task<bool> EndVideoMeeting([FromBody] GameControllerRequestModel model)
        {
            try
            {
                GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
                gameHash.ActivePlayers.ForEach(async player =>
                {
                    if (player.PlayerId != model.UserId)
                        await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Leave_Meeting");
                });
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }

        }
    }
}