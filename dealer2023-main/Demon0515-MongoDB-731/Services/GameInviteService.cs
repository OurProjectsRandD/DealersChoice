using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PersonalizedCardGame.Models;

namespace PersonalizedCardGame.Services
{
    public class GameInviteService
    {
        private readonly IMongoCollection<GameInvite> mongoCollection;
        public GameInviteService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            mongoCollection = mongoDatabase.GetCollection<GameInvite>("GameInvites");
        }

        public IMongoCollection<GameInvite> GetCollection() => mongoCollection;

        public async Task<List<GameInvite>> GetAllAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task<GameInvite> GetAsync(string id) =>
            await mongoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<GameInvite> GetByUserIdAndGameAsync(string gameCode, string email) =>
            await mongoCollection.Find(x => x.GameCode == gameCode && x.InviteeEmail == email).FirstOrDefaultAsync();

        public async Task CreateAsync(GameInvite newBook) =>
            await mongoCollection.InsertOneAsync(newBook);

        public async Task UpdateAsync(string id, GameInvite updatedBook) =>
            await mongoCollection.ReplaceOneAsync(x => x.Id == id, updatedBook);

        public async Task RemoveAsync(string id) =>
            await mongoCollection.DeleteOneAsync(x => x.Id == id);
    }
}
