using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using Nancy.Routing.Trie;
using PersonalizedCardGame.Controllers;
using PersonalizedCardGame.Models;
using PersonalizedCardGame.Models.GameState;

namespace PersonalizedCardGame.Services
{
    public class GameStateService
    {
        private readonly IMongoCollection<GameHash> mongoCollection;

        public GameStateService(IOptions<MongoDBSetting> options)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            mongoCollection = mongoDatabase.GetCollection<GameHash>("GameStates");
        }

        public IMongoCollection<GameHash> GetCollection() => mongoCollection;

        public async Task<List<GameHash>> GetAllAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task<GameHash> GetAsync(string id) =>
            await mongoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        
        public async Task<GameHash> GetByGameCodeAsync(string gameCode) =>
            await mongoCollection.Find(x => x.GameCode == gameCode).FirstOrDefaultAsync();

        public async Task CreateAsync(GameHash gameHash) =>
            await mongoCollection.InsertOneAsync(gameHash);

        public async Task<GameHash> SetPlayerConnection(string gameCode, string playerId, string connectionId, bool IsDisconnected)
        {
            var filter = Builders<GameHash>.Filter.And(
                Builders<GameHash>.Filter.Eq("GameCode", gameCode)
            );

            var update = Builders<GameHash>.Update.Set("ActivePlayers.$[player].IsDisconnected", IsDisconnected)
                .Set("ActivePlayers.$[player].ConnectionId", connectionId);

            var arrayFilters = new List<ArrayFilterDefinition>
                {
                    new BsonDocumentArrayFilterDefinition<BsonDocument>(new BsonDocument("player.PlayerId", playerId))
                };

            // Call UpdateOneAsync with the filter, update and arrayFilters parameters
            GameHash updateResult = await mongoCollection.FindOneAndUpdateAsync(filter, update, new FindOneAndUpdateOptions<GameHash> { ArrayFilters = arrayFilters, ReturnDocument = ReturnDocument.After  });
            return updateResult;
        }

        public async Task<GameHash> AddActivePlayer(string gameCode, ActivePlayer activePlayer)
        {
            var filter = Builders<GameHash>.Filter.Eq("GameCode", gameCode);
            var update = Builders<GameHash>.Update.Push("ActivePlayers", activePlayer);
            var options = new FindOneAndUpdateOptions<GameHash>
            {
                ReturnDocument = ReturnDocument.After // specifies to return the updated document
            };
            GameHash gameHash = await mongoCollection.FindOneAndUpdateAsync(filter, update, options);
            return gameHash;
        }

        public async Task<bool> RemoveActivePlayer(string gameCode, string playerId)
        {
            try
            {
                var filter = Builders<GameHash>.Filter.Eq("GameCode", gameCode);
                var update = Builders<GameHash>.Update.PullFilter("ActivePlayers",
                    Builders<ActivePlayer>.Filter.Eq(player => player.PlayerId, playerId)
                );
                var options = new FindOneAndUpdateOptions<GameHash>
                {
                    ReturnDocument = ReturnDocument.After // specifies to return the updated document
                };
                await mongoCollection.FindOneAndUpdateAsync(filter, update, options);
                return true;
            } catch (Exception ex)
            {
                return false;
            }
        }

        public GameHash FindByConnectionId(string ConnectionId)
        {
            try
            {
                var filter = Builders<GameHash>.Filter.Eq("ActivePlayers.ConnectionId", ConnectionId);
                var result = mongoCollection.Find(filter).FirstOrDefault();
                return result;
            } catch(Exception ex)
            {
                return null;
            }
        }

        public async Task<bool> RemoveCards(string gameCode, List<DraggingCard> draggingCards)
        {
            try
            {
                List<UpdateDefinition<GameHash>> pullFilter_updates = new List<UpdateDefinition<GameHash>>();

                var filter = Builders<GameHash>.Filter.Eq("GameCode", gameCode);
                draggingCards.ForEach(draggingCard =>
                {
                    if(draggingCard.Type == 0)
                    {
                        pullFilter_updates.Add(Builders<GameHash>.Update.PullFilter($"ActivePlayers.{draggingCard.Index}.PlayerCards",
                        Builders<Card>.Filter.Eq(card => card.Value, draggingCard.Value)));
                    }
                    else
                    {
                        pullFilter_updates.Add(Builders<GameHash>.Update.PullFilter("CommunityCards",
                            Builders<Card>.Filter.Eq(card => card.Value, draggingCard.Value)
                        ));
                    }
                });
                

                var result = await mongoCollection.FindOneAndUpdateAsync(filter, Builders<GameHash>.Update.Combine(pullFilter_updates.ToArray()));
                return true;
            } catch(Exception ex)
            {
                return false;
            }
            
        }
        public async Task<bool> AddCards(String gameCode, List<DraggingCard> draggingCards, int Index, int type)
        {
            try
            {
                List<UpdateDefinition<GameHash>> push_updates = new List<UpdateDefinition<GameHash>>();
                var filter = Builders<GameHash>.Filter.Eq("GameCode", gameCode);
                draggingCards.ForEach(draggingCard =>
                {
                    if (type == 0)
                        push_updates.Add(Builders<GameHash>.Update.Push($"ActivePlayers.{Index}.PlayerCards", new Card(draggingCard)));
                    else
                    {
                        Card card = new Card(draggingCard);
                        card.Presentation = 0;
                        card.CommunityIndex = Index;
                        push_updates.Add(Builders<GameHash>.Update.Push("CommunityCards", card));
                    }    
                });

                var result = await mongoCollection.FindOneAndUpdateAsync(filter, Builders<GameHash>.Update.Combine(push_updates.ToArray()));
                return true;
            } catch(Exception ex)
            {
                return false;
            }
            
        }

        public async Task UpdateAsync(string id, GameHash gameHash) =>
            await mongoCollection.ReplaceOneAsync(x => x.Id == id, gameHash);

        public async Task RemoveAsync(string id) =>
            await mongoCollection.DeleteOneAsync(x => x.Id == id);

        public async Task<long> GetGameCount(int type)
        {
            var currentTime = DateTime.Now;
            DateTime startTime = currentTime;
            switch (type)
            {
                case 1:
                    startTime = currentTime.Subtract(TimeSpan.FromHours(24));
                    break;
                case 2:
                    int daysUntilMonday = ((int)currentTime.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
                    startTime = currentTime.AddDays(-daysUntilMonday);
                    break;
                case 3:
                    startTime = new DateTime(currentTime.Year, currentTime.Month, 1);
                    break;
                default:
                    break;
            }
            FilterDefinition<GameHash> filter;
            if (type == 0)
            {
                filter = Builders<GameHash>.Filter.Eq(u => u.IsEnded, false);
            }
            else
                filter = Builders<GameHash>.Filter.Gte(u => u.CreatedDate, startTime);
            long numberOfUsers = await mongoCollection.CountDocumentsAsync(filter);
            return numberOfUsers;
        }

        public async Task<List<GameHash>> GetGamesByPeriod(int type)
        {
            var currentTime = DateTime.Now;
            DateTime startTime = currentTime;
            switch (type)
            {
                case 1:
                    startTime = currentTime.Subtract(TimeSpan.FromHours(24));
                    break;
                case 2:
                    int daysUntilMonday = ((int)currentTime.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
                    startTime = currentTime.AddDays(-daysUntilMonday);
                    break;
                case 3:
                    startTime = new DateTime(currentTime.Year, currentTime.Month, 1);
                    break;
                default:
                    break;
            }
            FilterDefinition<GameHash> filter;
            if (type == 0)
            {
                filter = Builders<GameHash>.Filter.Eq(u => u.IsEnded, false);
            }
            else
                filter = Builders<GameHash>.Filter.Gte(u => u.CreatedDate, startTime);
            var results = await mongoCollection.Find(filter).ToListAsync();
            return results;
        }
    }
}
