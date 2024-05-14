using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PersonalizedCardGame.Models;
using PersonalizedCardGame.Models.GameState;

namespace PersonalizedCardGame.Services
{
    public class GameHashTempService
    {
        private readonly IMongoCollection<GameHashTemp> mongoCollection;

        public GameHashTempService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            mongoCollection = mongoDatabase.GetCollection<GameHashTemp>("GameHashs");
        }

        public IMongoCollection<GameHashTemp> GetCollection() => mongoCollection;

        public async Task<List<GameHashTemp>> GetAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task<GameHashTemp> GetAsync(string id) =>
            await mongoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(GameHashTemp gameHash) =>
            await mongoCollection.InsertOneAsync(gameHash);

        public async Task UpdateAsync(string id, GameHashTemp gameHash) =>
            await mongoCollection.ReplaceOneAsync(x => x.Id == id, gameHash);

        public async Task RemoveAsync(string id) =>
            await mongoCollection.DeleteOneAsync(x => x.Id == id);
    }
}
