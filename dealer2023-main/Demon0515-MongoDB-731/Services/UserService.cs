using MongoDB.Driver;
using Microsoft.Extensions.Options;
using PersonalizedCardGame.Models;
using Elmah.ContentSyndication;
using PersonalizedCardGame.Controllers;
using System.Collections.Generic;

namespace PersonalizedCardGame.Services
{
    public class UserService
    {
        private readonly IMongoCollection<AppUser> _userCollection;

        public UserService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            _userCollection = mongoDatabase.GetCollection<AppUser>("Users");
        }

        public IMongoCollection<AppUser> GetCollection() => _userCollection;

        public async Task<List<AppUser>> GetAllAsync() => await _userCollection.Find(_ => true).ToListAsync();

        /*
            type: 0 24 hours
            type: 1 This week
            type: 2 This month
        */
        public async Task<long> GetRegisteredNumber(int type){
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
            var filter = Builders<AppUser>.Filter.Gte(u => u.CreatedOn, startTime);
            long numberOfUsers = await _userCollection.CountDocumentsAsync(filter);
            return numberOfUsers;
        }

        /*
            type: 0 24 hours
            type: 1 This week
            type: 2 This month
        */
        public async Task<List<AppUser>> GetRegisteredUser(int type)
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
            var filter = Builders<AppUser>.Filter.Gte(u => u.CreatedOn, startTime);
            List<AppUser> results = await _userCollection.Find(filter).ToListAsync();
            return results;
        }
    }
}
