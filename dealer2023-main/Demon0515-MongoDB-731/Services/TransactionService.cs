using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using PersonalizedCardGame.Models;

namespace PersonalizedCardGame.Services
{
    public class TransactionService
    {
        private readonly IMongoCollection<Transactions> mongoCollection;
        public TransactionService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            mongoCollection = mongoDatabase.GetCollection<Transactions>("Transactions");
        }

        public IMongoCollection<Transactions> GetCollection() => mongoCollection;

        public async Task<List<Transactions>> GetAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task<Transactions> GetAsync(string id) =>
            await mongoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Transactions transactions) =>
            await mongoCollection.InsertOneAsync(transactions);

        public async Task UpdateAsync(string id, Transactions transactions) =>
            await mongoCollection.ReplaceOneAsync(x => x.Id == id, transactions);

        public async Task RemoveAsync(string id) =>
            await mongoCollection.DeleteOneAsync(x => x.Id == id);

        /*
            type: 0 24 hours
            type: 1 This week
            type: 2 This month
        */
        public async Task<long> GetTransactionCounts(int type)
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
            var filter = Builders<Transactions>.Filter.Gte(u => u.CreatedAt, startTime);
            long numberOfUsers = await mongoCollection.CountDocumentsAsync(filter);
            return numberOfUsers;
        }

        /*
            type: 0 24 hours
            type: 1 This week
            type: 2 This month
        */
        public async Task<long> GetRevenue(int type)
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
            /*var filter = Builders<Transactions>.Filter.Gte(u => u.CreatedAt, startTime);
            var pipeline = new BsonDocument[]
            {
                new BsonDocument("$match", filter.ToBsonDocument()),
                new BsonDocument("$group",
                    new BsonDocument("_id", null)
                        .Add("totalTokens", new BsonDocument("$sum", "$Tokens"))
                )
            };*/
            var result = mongoCollection.Aggregate<Transactions>().Match(u => u.CreatedAt > startTime).Group(e => e.Id, g => new { totalTokens = g.Sum(e => e.Tokens) }).ToList();
            //var result = await mongoCollection.Aggregate<dynamic>(pipeline).FirstOrDefaultAsync();

            var totalTokensList = result.Select(r => r.totalTokens).ToList();
            return totalTokensList[0];
        }

        public async Task<List<Transactions>> GetTranscationsByPeriod(int type)
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
            var filter = Builders<Transactions>.Filter.Gte(u => u.CreatedAt, startTime);
            List<Transactions> transactions = await mongoCollection.Find(filter).ToListAsync();
            return transactions;
        }
    }
}
