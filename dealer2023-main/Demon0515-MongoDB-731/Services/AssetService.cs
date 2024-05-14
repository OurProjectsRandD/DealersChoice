using MongoDB.Driver;
using Microsoft.Extensions.Options;
using PersonalizedCardGame.Models;

namespace PersonalizedCardGame.Services
{
    public class AssetService
    {
        private readonly IMongoCollection<Asset> _assetsCollection;

        public AssetService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            _assetsCollection = mongoDatabase.GetCollection<Asset>("Assets");
        }

        public IMongoCollection<Asset> GetCollection() => _assetsCollection;

        public async Task<List<Asset>> GetAllAsync() => await _assetsCollection.Find(_ => true).ToListAsync();


        public async Task<Asset> GetAsync(string id) =>
            await _assetsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<Asset> GetAsyncByUserId(string userId) =>
            await _assetsCollection.Find(x => x.UserId == userId).FirstOrDefaultAsync();

        public async Task CreateAsync(Asset newBook) =>
            await _assetsCollection.InsertOneAsync(newBook);

        public async Task UpdateAsync(string id, Asset updatedBook) =>
            await _assetsCollection.ReplaceOneAsync(x => x.Id == id, updatedBook);

        public async Task RemoveAsync(string id) =>
            await _assetsCollection.DeleteOneAsync(x => x.Id == id);
    }
}
