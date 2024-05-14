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

namespace PersonalizedCardGame.Hubs
{
    public class GameClass : Hub
    {
        public static List<string> ConnectionIds = new List<string>();
        public static bool IsBusy = false;
        private static readonly ConcurrentDictionary<string, string> Users = new ConcurrentDictionary<string, string>();
        private readonly DBCardGameContext _dbCardGameContext;
        private readonly GameStateService _GameStateService;
        public GameClass(DBCardGameContext dbCardGameContext, GameStateService gameStateService)
        {
            _dbCardGameContext = dbCardGameContext;
            _GameStateService = gameStateService;
        }

        /*
            Send "ReceiveMessage" to all clients.
        */
        public int SendMessage(string user, string message)
        {
            try
            {
                if (IsBusy == false)
                {
                    IsBusy = true;
                    var val1 = Context.ConnectionId;
                    var val2 = Context.User;
                    var val3 = Clients.Caller;

                    ConnectionIds.Add(user + "===" + message);

                    Clients.All.SendAsync("ReceiveMessage", user, message);
                    return 1;
                }
                else
                {
                    return 0;
                }
            }
            catch (Exception ex)
            {
                return -1;
            }
        }

        /*
        Send "ReciveNotification" to all Clients.
        @param
        gamecode: GameCode that will receive notfication.
        playerid: PlayerId that send notficiation.
        notificationmessage: message
        */
        public async Task SendNotification(string gamecode, string playerid, string notificationmessage)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // ConnectionIds.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveNotification", gamecode, playerid, notificationmessage);
        }

        public async Task GameLog(string GameCode, string ActionName, string PlayerUniqueId, string PlayerName)
        {

        }

        /*
         SendRemoveNotification
         */
        public async Task SendRemoveNotification(string GameCode, string UserId)
        {
            var player = await _dbCardGameContext.Player.Where(x => x.GameCode == GameCode && x.PlayerUniqueId == UserId).FirstOrDefaultAsync();
            var val1 = Context.ConnectionId;
            await Clients.Client(player.SignalRconnectionId).SendAsync("RemovedNotification");
        }

        /*
        Send "ReceiveEndGameSummary"
        @param
        gamecode: GameCode that send notification
        */
        public async Task SendEndGameSummary(string gamecode)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // ConnectionIds.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveEndGameSummary", gamecode);
        }

        /*
        Send "ReceiveEndHandSummary"
        @param
        gamecode: GameCode that send notification
        */
        public async Task SendEndHandSummary(string gamecode)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // ConnectionIds.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveEndHandSummary", gamecode);
        }

        //same as SendMessage
        public async Task SendMessage2(string user, string message, string test)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            ConnectionIds.Add(user + "===" + message);

            JavaScriptSerializer js = new JavaScriptSerializer();
            string jsonData = js.Serialize(ConnectionIds); // {"Name":"C-

            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        //same as SendMessage    
        public async Task ReceiveOnLoad(string user, string message)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // string val1 = "";
            JavaScriptSerializer js = new JavaScriptSerializer();
            string jsonData = js.Serialize(ConnectionIds); // {"Name":"C-

            await Clients.All.SendAsync("ReceiveMessage", user, jsonData);
        }

        // when you connect to GameClass Hub, this function invoked.
        public async override Task OnConnectedAsync()
        {
            HttpContext httpContext = Context.GetHttpContext();
            Console.Write(Context.ConnectionId);

            var customQuerystring = httpContext!.Request.QueryString.Value;

            string[] keyValuePairs = customQuerystring.Split('&');

            // Loop through each key=value pair and split it into its separate key and value components
            string gameCode = null;
            string userIdentity = null;

            foreach (string keyValuePair in keyValuePairs)
            {
                string[] parts = keyValuePair.Split('=');

                if (parts.Length == 2)
                {
                    if (parts[0] == "GameCode")
                    {
                        gameCode = parts[1];
                    }
                    else if (parts[0] == "UserIdentity")
                    {
                        userIdentity = parts[1];
                    }
                }
            }

            GameHash gameHash = await _GameStateService.GetByGameCodeAsync(gameCode);
            if (gameHash != null)
            {
                ActivePlayer player = gameHash.ActivePlayers.Find(x => x.PlayerId == userIdentity);
                if (player != null)
                {
                    GameHash updatedGameHash = await _GameStateService.SetPlayerConnection(gameCode, userIdentity!, Context.ConnectionId, false);
                    updatedGameHash.ActivePlayers.ForEach(async Player =>
                    {
                        if (Player.PlayerId != userIdentity!)
                            await this.Clients.Client(Player.ConnectionId).SendAsync("Other_Connected", userIdentity!, Context.ConnectionId);
                    });
                }
            }
            await base.OnConnectedAsync();
        }

        //when you close connection, this function invokes.
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            try
            {
                /*GameHash gameHash = _GameStateService.FindByConnectionId(Context.ConnectionId);
                if (gameHash == null)
                    return;
                int index = gameHash.ActivePlayers.FindIndex(x => x.ConnectionId == Context.ConnectionId);
                if (index != -1)
                {
                    ActivePlayer player = gameHash.ActivePlayers[index];
                    player.IsDisconnected = true;
                    if (player.PlayerId == gameHash.DealerId)
                        gameHash.DealerId = gameHash.FindNextCurrentId(index);
                    if (player.PlayerId == gameHash.CurrentId)
                        gameHash.CurrentId = gameHash.FindNextCurrentId(index);
                }
                await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
                gameHash.ActivePlayers.ForEach(async Player =>
                {
                    await this.Clients.Client(Player.ConnectionId).SendAsync("Player_Disconnected", index);
                });*/
            }
            catch (Exception ex)
            {
            }
        }
        public async Task AlertNotifictionVideo(string message)
        {
            // You can send the message to all clients, or to specific ones, depending on your needs.
            await Clients.All.SendAsync("ReceiveAlertNotifictionVideo", message);
        }
       
    }
}