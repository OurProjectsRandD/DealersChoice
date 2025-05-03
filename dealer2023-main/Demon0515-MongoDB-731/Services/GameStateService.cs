using log4net;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Core.Connections;
using Nancy.Routing.Trie;
using PersonalizedCardGame.Controllers;
using PersonalizedCardGame.Models;
using PersonalizedCardGame.Models.GameState;

namespace PersonalizedCardGame.Services
{
    public class GameStateService
    {
        private readonly IMongoCollection<GameHash> mongoCollection;
        private readonly ILogger<GameStateService> _logger;
        private static readonly ILog _log = LogManager.GetLogger(typeof(GameStateService));

        public GameStateService(IOptions<MongoDBSetting> options, ILogger<GameStateService> logger, ILog log)
        {
            var mongoClient = new MongoClient(
            options.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                options.Value.DatabaseName);

            mongoCollection = mongoDatabase.GetCollection<GameHash>("GameStates");
            _logger = logger;
        }

        public IMongoCollection<GameHash> GetCollection() => mongoCollection;

        public async Task<List<GameHash>> GetAllAsync() => await mongoCollection.Find(_ => true).ToListAsync();

        public async Task<GameHash> GetAsync(string id) =>
            await mongoCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        
        public async Task<GameHash> GetByGameCodeAsync(string gameCode) =>
            await mongoCollection.Find(x => x.GameCode == gameCode).FirstOrDefaultAsync();


        public async Task<GameHash?> GetByGameCodeActivePlayerAsync(string gameCode)
        {
            try
            {
                var data = await mongoCollection.Find(x => x.GameCode == gameCode).FirstOrDefaultAsync();
                if (data == null || data.ActivePlayers == null)
                    return null;
                data.ActivePlayers = data.ActivePlayers.Where(player => player.IsFolded == false).ToList();
                return data;
            }
            catch (Exception ex)
            {

                throw new Exception(ex.Message);
            }
        }

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

        public async Task<List<ActivePlayer>> GetActivePlayers(string gameCode)
        {
            var filter = Builders<GameHash>.Filter.Eq("GameCode", gameCode);
            var gameHash = await mongoCollection.Find(filter).FirstOrDefaultAsync();

            return gameHash?.ActivePlayers ?? new List<ActivePlayer>();
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
                _logger.LogError("RemoveActiveplayer"+ ex.Message + ex.InnerException + ex.StackTrace);
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
                _logger.LogError("FindByConnectionId on GameStateService" + ConnectionId +  ex.Message + ex.InnerException + ex.StackTrace);
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

        //public async Task UpdateAsync(string id, GameHash gameHash) =>
        //    await mongoCollection.ReplaceOneAsync(x => x.Id == id, gameHash);


        public async Task UpdateAsync(string id, GameHash gameHash)
        {
            try
            {
                var result = await mongoCollection.ReplaceOneAsync(x => x.Id == id, gameHash);

                if (result.MatchedCount == 0)
                {
                    _log.Warn($"No document found with ID: {id}. Update operation did not modify any documents.");
                }
                else
                {
                    _log.Debug($"Successfully updated document with ID: {id}. Modified count: {result.ModifiedCount}");
                }
            }
            catch (MongoException mongoEx)
            {
                _log.Error($"[MongoDB Update Failed] Document ID: {id} | GameHash: {gameHash?.ToString()} | " +
                          $"Error Type: {mongoEx.GetType().Name} | " +
                          $"Message: {mongoEx.Message} | " +
                          $"Stack: {mongoEx.StackTrace}");
                throw; // Re-throw to let caller handle
            }
            catch (Exception ex)
            {
                _log.Error($"[Update Operation Failed] Document ID: {id} | " +
                          $"Unexpected error: {ex.GetType().Name} | " +
                          $"Message: {ex.Message} | " +
                          $"Stack: {ex.StackTrace}");
                throw new ApplicationException($"Failed to update document {id}", ex);
            }
        }




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
            try
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
                _logger.LogInformation("GetGamesByPeriod" + "Count" + results.Count);
                return results;
            }
            catch (Exception ex)
            {
               _logger.LogError("GetGamesByPeriod on GameStateService" + type + ex.Message + ex.InnerException + ex.StackTrace);
                throw;
            }
            
        }
    }
}
