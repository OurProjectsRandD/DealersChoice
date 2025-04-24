using System.Collections.Concurrent;

namespace PersonalizedCardGame.Services.Interface
{
    public interface IConnectionTracker
    {
        void AddConnection(string connectionId, string user, string message);
        List<string> GetAllMessages();
        void RemoveConnection(string connectionId);
    }

    public class ConnectionTracker : IConnectionTracker
    {
        private readonly ConcurrentDictionary<string, string> _connections = new();

        public void AddConnection(string connectionId, string user, string message)
        {
            _connections.TryAdd(connectionId, $"{user}==={message}");
        }

        public List<string> GetAllMessages() => _connections.Values.ToList();

        public void RemoveConnection(string connectionId)
        {
            _connections.TryRemove(connectionId, out _);
        }
    }
}
