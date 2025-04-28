using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;
using Nancy.Json;
using System;
using System.Linq;
using System.Collections.Concurrent;
using PersonalizedCardGame.Models;
using PersonalizedCardGame;
using System.Text;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using Microsoft.EntityFrameworkCore;
using PersonalizedCardGame.Models.GameState;
using PersonalizedCardGame.Services;
using PersonalizedCardGame.Controllers;

namespace PersonalizedCardGame.Hubs
{
    public class GameClass : Hub
    {
        private static readonly ConcurrentDictionary<string, string> ConnectionIds = new ConcurrentDictionary<string, string>();
        private static readonly object IsBusyLock = new object();
        private static bool IsBusy = false;
        private readonly DBCardGameContext _dbCardGameContext;
        private readonly GameStateService _GameStateService;
        private readonly ILogger<GameClass> _logger;

        public GameClass(DBCardGameContext dbCardGameContext, GameStateService gameStateService, ILogger<GameClass> logger)
        {
            _dbCardGameContext = dbCardGameContext;
            _GameStateService = gameStateService;
            _logger = logger;
        }

        public async Task<int> SendMessage(string user, string message)
        {
            try
            {
                lock (IsBusyLock)
                {
                    if (IsBusy)
                        return 0;

                    IsBusy = true;
                }

                ConnectionIds.TryAdd(Context.ConnectionId, $"{user}==={message}");
                await Clients.All.SendAsync("ReceiveMessage", user, message);
                return 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendMessage");
                return -1;
            }
            finally
            {
                lock (IsBusyLock)
                {
                    IsBusy = false;
                }
            }
        }

        public async Task SendNotification(string gameCode, string playerId, string notificationMessage)
        {
            try
            {
                await Clients.All.SendAsync("ReceiveNotification", gameCode, playerId, notificationMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendNotification");
            }
        }

        public async Task SendRemoveNotification(string gameCode, string userId)
        {
            try
            {
                var player = await _dbCardGameContext.Player
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.GameCode == gameCode && x.PlayerUniqueId == userId);

                if (player != null && !string.IsNullOrEmpty(player.SignalRconnectionId))
                {
                    await Clients.Client(player.SignalRconnectionId).SendAsync("RemovedNotification");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendRemoveNotification");
            }
        }

        public async Task SendEndGameSummary(string gameCode)
        {
            try
            {
                await Clients.All.SendAsync("ReceiveEndGameSummary", gameCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendEndGameSummary");
            }
        }

        public async Task SendEndHandSummary(string gameCode)
        {
            try
            {
                await Clients.All.SendAsync("ReceiveEndHandSummary", gameCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendEndHandSummary");
            }
        }

        public async Task SendMessage2(string user, string message, string test)
        {
            try
            {
                ConnectionIds.TryAdd(Context.ConnectionId, $"{user}==={message}");
                await Clients.All.SendAsync("ReceiveMessage", user, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendMessage2");
            }
        }

        public async Task ReceiveOnLoad(string user, string message)
        {
            try
            {
                var jsonData = System.Text.Json.JsonSerializer.Serialize(ConnectionIds);
                await Clients.All.SendAsync("ReceiveMessage", user, jsonData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ReceiveOnLoad");
            }
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var httpContext = Context.GetHttpContext();
                var query = httpContext?.Request.Query;

                string gameCode = query?["GameCode"];
                string userIdentity = query?["UserIdentity"];

                if (!string.IsNullOrEmpty(gameCode) && !string.IsNullOrEmpty(userIdentity))
                {
                    var gameHash = await _GameStateService.GetByGameCodeAsync(gameCode);
                    if (gameHash != null)
                    {
                        var player = gameHash.ActivePlayers.FirstOrDefault(x => x.PlayerId == userIdentity);
                        if (player != null)
                        {
                            await _GameStateService.SetPlayerConnection(gameCode, userIdentity, Context.ConnectionId, false);

                            foreach (var otherPlayer in gameHash.ActivePlayers.Where(p => p.PlayerId != userIdentity))
                            {
                                await Clients.Client(otherPlayer.ConnectionId).SendAsync("Other_Connected", userIdentity, Context.ConnectionId);
                            }
                        }
                    }
                }

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnConnectedAsync");
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            try
            {
                if (exception != null)
                {
                    _logger.LogWarning($"Disconnected due to: {exception.Message}");
                }

                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnDisconnectedAsync");
            }
        }

        public async Task AlertNotificationVideo(string message)
        {
            try
            {
                await Clients.All.SendAsync("ReceiveAlertNotificationVideo", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AlertNotificationVideo");
            }
        }
    }
}