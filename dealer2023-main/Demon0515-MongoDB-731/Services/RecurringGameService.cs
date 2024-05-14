using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PersonalizedCardGame.Models;

namespace PersonalizedCardGame.Services
{
    public class RecurringGameService
    {
        private readonly IMongoCollection<RecurringGames> mongoCollection;
        public RecurringGameService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            mongoCollection = mongoDatabase.GetCollection<RecurringGames>("RecurringGames");
        }

        public IMongoCollection<RecurringGames> GetCollection() => mongoCollection;

        public async Task<List<RecurringGames>> GetAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task<RecurringGames> GetAsync(string id) =>
            await mongoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(RecurringGames recurringGames) =>
            await mongoCollection.InsertOneAsync(recurringGames);

        public async Task UpdateAsync(string id, RecurringGames recurringGames) =>
            await mongoCollection.ReplaceOneAsync(x => x.Id == id, recurringGames);

        public async Task RemoveAsync(string id) =>
            await mongoCollection.DeleteOneAsync(x => x.Id == id);
    }
}
