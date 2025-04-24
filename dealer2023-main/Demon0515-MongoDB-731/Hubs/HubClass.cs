using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;
using Nancy.Json;
using System;
using System.Collections.Concurrent;

namespace SignalRChat.Hubs
{
    public class MyHub : Hub
    {
        public static List<string> lst = new List<string>();

        public async Task SendMessage(string user, string message)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            lst.Add(user + "===" + message);

            try
            {
                await Clients.All.SendAsync("ReceiveMessage", user, message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw; // Re-throw to notify the client
            }
        }

        public async Task SendMessage2(string user, string message, string test)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            lst.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task ReceiveOnLoad(string user, string message)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            JavaScriptSerializer js = new JavaScriptSerializer();
            string jsonData = js.Serialize(lst);

            await Clients.All.SendAsync("ReceiveMessage", user, jsonData);
        }

        public override Task OnConnectedAsync()
        {
            var xx = Context.GetHttpContext();

            // Use TryAdd instead of Add for ConcurrentDictionary
            UserHandler.ConnectedIds.TryAdd(Context.ConnectionId, true);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception) // Fix for CS8765: Allow nullable exception
        {
            // Use TryRemove instead of Remove for ConcurrentDictionary
            UserHandler.ConnectedIds.TryRemove(Context.ConnectionId, out _);
            return base.OnDisconnectedAsync(exception);
        }
    }

    public static class UserHandler
    {
        public static ConcurrentDictionary<string, bool> ConnectedIds = new();
    }



    public class UserConnection
    {
        public required string UserName { get; set; } // Fix for CS8618: Add 'required' modifier
        public required string UserUniqueId { get; set; } // Fix for CS8618: Add 'required' modifier
        public required string ConnectionId { get; set; } // Fix for CS8618: Add 'required' modifier
    }


}