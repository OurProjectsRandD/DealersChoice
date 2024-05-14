using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PersonalizedCardGame.Models;

namespace PersonalizedCardGame.Services
{
    public class MembershipService
    {
        private readonly IMongoCollection<Membership> mongoCollection;
        public MembershipService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            mongoCollection = mongoDatabase.GetCollection<Membership>("Memberships");
        }

        public IMongoCollection<Membership> GetCollection() => mongoCollection;

        public async Task<List<Membership>> GetAllAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task<Membership> GetAsync(string id) =>
            await mongoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<Membership> GetMembershipByPlanIdAsync(int planId) => 
            await mongoCollection.Find(x => x.PlanId == planId).FirstOrDefaultAsync();

        public async Task CreateAsync(Membership newBook) =>
            await mongoCollection.InsertOneAsync(newBook);

        public async Task UpdateAsync(string id, Membership updatedBook) =>
            await mongoCollection.ReplaceOneAsync(x => x.Id == id, updatedBook);

        public async Task RemoveAsync(string id) =>
            await mongoCollection.DeleteOneAsync(x => x.Id == id);
    }
}
