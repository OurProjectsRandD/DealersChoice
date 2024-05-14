using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PersonalizedCardGame.Models;

namespace PersonalizedCardGame.Services
{
    public class SignInHistoryService
    {
        private readonly IMongoCollection<SignInHistory> _historiesCollection;

        public SignInHistoryService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            _historiesCollection = mongoDatabase.GetCollection<SignInHistory>("SignInHistories");
        }

        public IMongoCollection<SignInHistory> GetCollection() => _historiesCollection;

        public async Task<List<SignInHistory>> GetAllAsync() => await _historiesCollection.Find(_ => true).ToListAsync();


        public async Task<SignInHistory> GetAsync(string id) =>
            await _historiesCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(SignInHistory history) =>
            await _historiesCollection.InsertOneAsync(history);

        public async Task UpdateAsync(string id, SignInHistory history) =>
            await _historiesCollection.ReplaceOneAsync(x => x.Id == id, history);

        public async Task RemoveAsync(string id) =>
            await _historiesCollection.DeleteOneAsync(x => x.Id == id);

        public async Task<long> GetLoggedInCount(int type)
        {
            var currentTime = DateTime.Now;
            DateTime startTime = currentTime;
            switch (type)
            {
                case 0:
                    startTime = currentTime.Subtract(TimeSpan.FromHours(24));
                    break;
                case 1:
                    int daysUntilMonday = ((int)currentTime.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
                    startTime = currentTime.AddDays(-daysUntilMonday);
                    break;
                case 2:
                    startTime = new DateTime(currentTime.Year, currentTime.Month, 1);
                    break;
                default:
                    break;
            }
            var filter = Builders<SignInHistory>.Filter.Gte(u => u.Time, startTime);
            long numberOfUsers = await _historiesCollection.CountDocumentsAsync(filter);
            return numberOfUsers;
        }

        public async Task<List<SignInHistory>> GetSignInHistoriesAsync(int type)
        {
            var currentTime = DateTime.Now;
            DateTime startTime = currentTime;
            switch (type)
            {
                case 0:
                    startTime = currentTime.Subtract(TimeSpan.FromHours(24));
                    break;
                case 1:
                    int daysUntilMonday = ((int)currentTime.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
                    startTime = currentTime.AddDays(-daysUntilMonday);
                    break;
                case 2:
                    startTime = new DateTime(currentTime.Year, currentTime.Month, 1);
                    break;
                default:
                    break;
            }
            var filter = Builders<SignInHistory>.Filter.Gte(u => u.Time, startTime);
            var results = await _historiesCollection.Find(filter).ToListAsync();
            return results;
        }
    }
}
