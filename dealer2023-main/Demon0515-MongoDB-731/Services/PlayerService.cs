using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PersonalizedCardGame.Models;

namespace PersonalizedCardGame.Services
{
    public class PlayerService
    {
        private readonly IMongoCollection<Player> mongoCollection;
        public PlayerService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            mongoCollection = mongoDatabase.GetCollection<Player>("Players");
        }

        public IMongoCollection<Player> GetCollection() => mongoCollection;

        public async Task<List<Player>> GetAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task<Player> GetAsync(string id) =>
            await mongoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Player player) =>
            await mongoCollection.InsertOneAsync(player);

        public async Task UpdateAsync(string id, Player player) =>
            await mongoCollection.ReplaceOneAsync(x => x.Id == id, player);

        public async Task RemoveAsync(string id) =>
            await mongoCollection.DeleteOneAsync(x => x.Id == id);
    }
}
