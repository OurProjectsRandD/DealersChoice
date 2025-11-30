# DealersChoice Architecture Analysis Report

This report provides a comprehensive analysis of the DealersChoice web application codebase to support the migration from a legacy monolithic architecture to a new API-based backend.

---

## 1. High-Level Architecture Overview

### 1.1 Solution Structure

The solution is located at:
```
dealer2023-main/Demon0515-MongoDB-731/
```

**Main Project:**
- `PersonalizedCardGame.sln` - Single solution file
- `PersonalizedCardGame.csproj` - Main ASP.NET Core 7.0 web application

**Project Type:** ASP.NET Core 7.0 Web Application with React SPA (Single Page Application) frontend

### 1.2 Architecture Summary

| Component | Technology | Notes |
|-----------|------------|-------|
| Backend Framework | ASP.NET Core 7.0 | Web API controllers |
| Frontend Framework | React 18 + Redux | SPA served via SpaProxy |
| Database (Primary) | MongoDB | Game state, users, assets via MongoDB driver |
| Database (Secondary) | SQL Server | Legacy tables via Entity Framework Core |
| Real-time | SignalR | WebSocket-based game updates |
| Video | VideoSDK.live | Third-party video integration |
| Authentication | ASP.NET Core Identity + JWT | MongoDB-backed identity |

### 1.3 Key Directory Structure

```
Demon0515-MongoDB-731/
├── Controllers/          # API controllers (no MVC views)
├── Hubs/                 # SignalR hubs for real-time
├── Models/               # Domain models and DTOs
│   └── GameState/        # Game-related models
├── Services/             # Business logic services
├── Middleware/           # JWT authentication middleware
├── Attributes/           # Custom authorization attributes
├── Constants/            # Application constants
├── ClientApp/            # React SPA frontend
│   └── src/
│       ├── Pages/        # Page components
│       ├── components/   # Reusable components
│       ├── slice/        # Redux state management
│       ├── common/       # Shared utilities
│       └── util/         # Helper utilities
├── DBScripts/            # Database initialization scripts
└── Pages/                # Razor Pages (minimal usage)
```

### 1.4 Startup Configuration (`Program.cs`)

Key services registered:
```csharp
// Database contexts
builder.Services.AddDbContext<DBCardGameContext>(...); // SQL Server
builder.Services.Configure<MongoDBSetting>(...);       // MongoDB

// MongoDB-backed Identity
builder.Services.AddIdentity<AppUser, AppRole>()
    .AddMongoDbStores<AppUser, AppRole, Guid>(...);

// Service layer (all singletons)
builder.Services.AddSingleton<AssetService>();
builder.Services.AddSingleton<GameStateService>();
builder.Services.AddSingleton<UserService>();
// ... (9 services total)

// SignalR for real-time
builder.Services.AddSignalR();
```

---

## 2. MVC Structure: Controllers, Views, and View Models

### 2.1 Controllers Overview

All controllers are **API Controllers** (not MVC controllers with views). They are located in `/Controllers/`:

| Controller | Route | Purpose |
|------------|-------|---------|
| `AuthController` | `/Auth/*` | Authentication & user management |
| `GameController` | `/Game/*` | Game creation, joining, gameplay actions |
| `AdminController` | `/Admin/*` | Admin dashboard data |
| `MembershipManageController` | `/MembershipManage/*` | Subscription & tokens |
| `LandingPageController` | `/LandingPage/*` | Landing page (stub) |
| `WeatherForecastController` | `/WeatherForecast` | Template placeholder |

### 2.2 AuthController (`/Auth`)

**File:** `Controllers/AuthController.cs`

| Action | Route | Method | Purpose |
|--------|-------|--------|---------|
| `SignUp` | `/Auth/sign-up` | POST | User registration |
| `SignIn` | `/Auth/sign-in` | POST | User login, returns JWT |
| `SignOut` | `/Auth/sign-out` | POST | User logout |
| `GetUser` | `/Auth/get-user` | POST | Get current user info |
| `ChangeUserInfo` | `/Auth/change-user-info` | POST | Update profile |
| `UploadImage` | `/Auth/upload-image` | POST | Upload profile image |
| `ChangeImage` | `/Auth/change-image` | POST | Change profile image |
| `AddRole` | `/Auth/add-role` | GET | Add user role (admin) |

**Key Code Pattern:**
```csharp
[HttpPost("sign-in")]
public async Task<IActionResult> SignIn(SignInVM signIn)
{
    var user = await _userManager.FindByEmailAsync(signIn.Email);
    var result = await _signInManager.PasswordSignInAsync(...);
    var token = generateJwtToken(user);
    return Ok(new { token, user, asset, roles });
}
```

### 2.3 GameController (`/Game`)

**File:** `Controllers/GameController.cs`

This is the **core controller** with extensive game logic:

| Action | Method | Purpose |
|--------|--------|---------|
| `CreateGame` | POST | Create new game session |
| `JoinGame` | POST | Join existing game |
| `LeftGame` | POST | Leave game |
| `KickPlayer` | POST | Host kicks player |
| `DealCards` | POST | Deal cards to players |
| `PassCards` | POST | Pass cards between players |
| `PassDeal` | POST | Pass dealer button |
| `Bet` | POST | Place a bet |
| `Call` | POST | Call current bet |
| `Check` | POST | Check (pass) |
| `Fold` | POST | Fold hand |
| `Ante` | POST | Ante up |
| `AddToPot` | POST | Add chips to pot |
| `Take` | POST | Take chips from pot |
| `Discard` | POST | Discard cards |
| `ReturnToDeck` | POST | Return cards to deck |
| `Show` | POST | Show cards |
| `CancelHand` | POST | Cancel current hand |
| `Endhand` | POST | End current hand |
| `Endgame` | POST | End entire game |
| `Sitout` | POST | Sit out from game |
| `Rejoin` | POST | Rejoin after sitout |
| `ToggleLock` | POST | Lock/unlock game |
| `ToggleCamera` | POST | Toggle video camera |
| `ToggleMic` | POST | Toggle microphone |
| `Invite` | POST | Invite player to game |
| `GetInvitees` | POST | Get invited players |
| `GetPastGames` | POST | Get game history |
| `GetRecurringGames` | POST | Get recurring games |
| `StartVideoMeeting` | POST | Start video call |
| `EndVideoMeeting` | POST | End video call |

**Key Code Pattern - Game Action with SignalR Broadcast:**
```csharp
[HttpPost]
public async Task<bool> Bet([FromBody] GameControllerRequestModel model)
{
    GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
    
    // Update game state
    gameHash.ActivePlayers[model.Index].PlayerAmount -= model.Amount;
    gameHash.PotSize += model.Amount;
    
    // Persist to MongoDB
    await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
    
    // Broadcast to other players via SignalR
    gameHash.ActivePlayers.ForEach(async player =>
    {
        if (player.PlayerId != model.UserId)
            await _HubContext.Clients.Client(player.ConnectionId)
                .SendAsync("Bet", model.Index!, model.Amount);
    });
    
    return true;
}
```

### 2.4 AdminController (`/Admin`)

**File:** `Controllers/AdminController.cs`

| Action | Route | Purpose |
|--------|-------|---------|
| `GetRegisteredUserCount` | `/Admin/get-registered-user-count` | User counts by period |
| `GetRegisteredUsers` | `/Admin/get-registered-users` | List registered users |
| `GetLoggedInCount` | `/Admin/get-loggedIn-count` | Login counts |
| `GetLoggedInUsers` | `/Admin/get-loggedIn-users` | Login history |
| `GetGameCount` | `/Admin/get-game-count` | Game counts |
| `GetGamesByPeriod` | `/Admin/get-games-by-period` | Games by period |
| `GetTransactionCount` | `/Admin/get-transaction-count` | Transaction counts |
| `GetAvenue` | `/Admin/get-avenue` | Revenue data |
| `GetTranactionsByPeriod` | `/Admin/get-transactions` | Transaction list (NOTE: typo in source) |

### 2.5 MembershipManageController (`/MembershipManage`)

**File:** `Controllers/MembershipManageController.cs`

| Action | Route | Purpose |
|--------|-------|---------|
| `_GetAllMemberShips` | `/MembershipManage/_GetAllMemberShips` | List membership plans |
| `_GetCurrentMembership` | `/MembershipManage/_GetCurrentMembership` | User's current plan |
| `_GetAsset` | `/MembershipManage/_GetAsset` | User's asset (tokens) |
| `_UpdateMembership` | `/MembershipManage/_UpdateMembership` | Upgrade membership |
| `_PurchaseTokens` | `/MembershipManage/_PurchaseTokens` | Buy tokens |
| `_PurchaseVideoTime` | `/MembershipManage/_PurchaseVideoTime` | Buy video minutes |
| `_DecreaseVideoTime` | `/MembershipManage/_DecreaseVideoTime` | Deduct video time |
| `_DecreaseVideoTimeRuntime` | `/MembershipManage/_DecreaseVideoTimeRuntime` | Runtime deduction |

### 2.6 Views

**This application has virtually no traditional MVC views.** The only Razor pages are:

- `Pages/Error.cshtml` - Error page
- `Pages/_ViewImports.cshtml` - Tag helpers

The UI is entirely delivered via the React SPA.

### 2.7 View Models / DTOs

**Location:** `Models/` and `ViewModels/`

| Model | Purpose |
|-------|---------|
| `SignInVM` | Login request |
| `RegisterVM` | Registration request |
| `ChangeUserInfoVM` | Profile update request |
| `GameControllerRequestModel` | Game action request |
| `MembershipManageModel` | Membership/token operations |
| `UserAndAssetDTO` | Combined user + asset response |
| `GameDTO` | Game list item |
| `RegisteredUserDTO` | Admin user list item |

---

## 3. Client-Side Code & Front-End Behavior

### 3.1 Frontend Location

**Path:** `ClientApp/`

This is a **React 18 SPA** created with Create React App.

### 3.2 Key Dependencies (`package.json`)

```json
{
  "@microsoft/signalr": "^7.0.4",        // Real-time SignalR client
  "@reduxjs/toolkit": "^1.9.5",          // State management
  "@videosdk.live/react-sdk": "^0.1.70", // Video integration
  "@mui/material": "^5.11.15",           // UI components
  "axios": "^1.3.4",                      // HTTP client
  "react-router-dom": "^6.3.0",          // Routing
  "react-redux": "^8.0.5",               // React-Redux bindings
  "redux-persist": "^6.0.0"              // State persistence
}
```

### 3.3 Application Structure

```
ClientApp/src/
├── index.js              # Entry point
├── App.js                # Root component
├── AppRoutes.js          # Route definitions
├── store.js              # Redux store setup
├── API.js                # VideoSDK API helpers
├── Pages/
│   ├── Auth/             # Authentication pages
│   │   ├── SignIn.js
│   │   ├── SignUp.js
│   │   └── AccountSetting.js
│   ├── Game/             # Game-related pages
│   │   ├── Home.js       # Landing page (create/join)
│   │   ├── Main.js       # Main game table
│   │   ├── Games.js      # Recurring/past games
│   │   └── JoinGame.js
│   ├── AdminPages/       # Admin dashboard
│   └── LadningPages/     # Marketing pages (NOTE: typo in source)
├── components/
│   ├── MainGameComponents/  # Game table UI
│   │   ├── Player.js
│   │   ├── DealerPanel.js
│   │   ├── GameControlPanel.js
│   │   ├── Cards.js
│   │   ├── PotDiv.js
│   │   └── Logging.js
│   ├── Dialogs/          # Modal dialogs
│   ├── Settlements/      # End-game settlement
│   └── Tables/           # Data tables
├── slice/                # Redux slices
│   ├── authSlice.js      # Auth state
│   ├── gameStateSlice.js # Game state
│   ├── cardSlice.js
│   └── cameraStatusSlice.js
├── common/
│   └── game/
│       ├── GameControl.js   # Game API calls
│       ├── CommonGame.js    # Shared game logic
│       └── basic.js         # Utilities
└── util/
    ├── AxiosUtil.js      # HTTP client wrapper
    ├── VideoSDK.js       # Video SDK helpers
    └── LogRocketUtil.js  # Analytics
```

### 3.4 Routing (`AppRoutes.js`)

```javascript
const AppRoutes = [
  { path: "/auth/sign-in", element: <SignIn /> },
  { path: "/auth/sign-up", element: <SignUp /> },
  { path: "/game/games", element: <Games /> },
  { path: "/", element: <Home /> },
  { path: "/game/main-game", element: <MainGame /> },
  { path: "/landing/features", element: <Features /> },
  { path: "/landing/free-trial", element: <FreeTrial /> },
];
```

### 3.5 State Management (Redux)

**Game State Slice (`slice/gameStateSlice.js`):**
```javascript
export const gameStateSlice = createSlice({
  name: "gameState",
  initialState: {
    GameCode: "",
    ActivePlayers: [],
    CommunityCards: [],
    HandSteps: [],
    Deck: [],
    // ... 20+ properties
  },
  reducers: {
    setGameState, playerJoin, playerLeft, playerConnected,
    bet, call, check, fold, ante, addToPot, take,
    dealCards, passCard, discard, returnToDeck, show,
    endHand, endGame, sitout, rejoin, passDeal,
    toggleCamera, toggleMic, toggleLock,
    // ... total 25+ reducers
  },
});
```

### 3.6 API Communication (`util/AxiosUtil.js`)

All API calls go through a centralized Axios wrapper:
```javascript
export const SendRequest = (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token !== null) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return axios({
        method: "post",
        ...config,
        url: GetFullURL(config.url),
    });
};
```

**Key API Call Pattern (`common/game/GameControl.js`):**
```javascript
export const Bet = (UserId, GameCode, Index, BetAmount, feedback) => {
  SendRequest({
    url: "Game/Bet",
    method: "post",
    data: { UserId, GameCode, Index, Amount: BetAmount },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};
```

---

## 4. SignalR / Real-Time Features

### 4.1 SignalR Hubs

**Location:** `Hubs/`

| Hub | Route | Purpose |
|-----|-------|---------|
| `GameClass` | `/GameClass` | Main game real-time hub |
| `MyHub` | `/MyHub` | Generic messaging (unused?) |

### 4.2 GameClass Hub (`Hubs/GameClass.cs`)

**Hub Registration (`Program.cs`):**
```csharp
app.MapHub<GameClass>("/GameClass");
app.MapHub<MyHub>("/MyHub");
```

**Server Methods:**

| Method | Purpose |
|--------|---------|
| `SendMessage` | Broadcast message to all |
| `SendNotification` | Game-specific notification |
| `SendRemoveNotification` | Player removal notification |
| `SendEndGameSummary` | End game summary broadcast |
| `SendEndHandSummary` | End hand summary broadcast |
| `AlertNotifictionVideo` | Video credit warning |

**Connection Lifecycle:**

```csharp
public async override Task OnConnectedAsync()
{
    // Parse GameCode and UserIdentity from query string
    GameHash gameHash = await _GameStateService.GetByGameCodeAsync(gameCode);
    if (gameHash != null)
    {
        // Update player connection ID
        await _GameStateService.SetPlayerConnection(
            gameCode, userIdentity, Context.ConnectionId, false);
        
        // Notify other players
        updatedGameHash.ActivePlayers.ForEach(async Player =>
        {
            if (Player.PlayerId != userIdentity)
                await Clients.Client(Player.ConnectionId)
                    .SendAsync("Other_Connected", userIdentity, Context.ConnectionId);
        });
    }
}
```

### 4.3 Client-Side SignalR (`common/game/GameControl.js`)

**Connection Setup:**
```javascript
export const startConnectionWithGameCodeAndUserId = async (GameCode, UniqueId) => {
  const connection = new HubConnectionBuilder()
    .withUrl(GetFullURL(`GameClass?GameCode=${GameCode}&UserIdentity=${UniqueId}`))
    .withAutomaticReconnect()
    .build();
  await connection.start();
  return connection;
};
```

### 4.4 SignalR Events (Client-Side in `Main.js`)

| Event | Handler |
|-------|---------|
| `Other_Connected` | `playerConnected` |
| `Other_Disconnected` | Navigate away |
| `Other_Joined` | `playerJoin` |
| `Player_Left` | `playerLeft` |
| `Kicked_Out` | Navigate home |
| `Player_Disconnected` | `playerDisconnected` |
| `Bet` | `bet` |
| `Call` | `call` |
| `Check` | `check` |
| `Fold` | `fold` |
| `Ante` | `ante` |
| `AddToPot` | `addToPot` |
| `Take` | `take` |
| `Cancel_Hand` | `cancelHand` |
| `Discard` | `discard` |
| `ReturnToDeck` | `returnToDeck` |
| `Show` | `show` |
| `End_Hand` | `endHand` |
| `Sitout` | `sitout` |
| `Rejoin` | `rejoin` |
| `Endgame` | `endGame` |
| `DealCards` | `dealCards` |
| `PassDeal` | `passDeal` |
| `PassCard` | `passCard` |
| `Join_Meeting` | `meetingAPI.join()` |
| `Leave_Meeting` | `meetingAPI.leave()` |
| `ReceiveAlertNotifictionVideo` | Toast notification |

### 4.5 Real-Time Flow Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Player A   │         │   Server     │         │   Player B   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  POST /Game/Bet       │                        │
       │───────────────────────>│                        │
       │                        │                        │
       │                        │  Update MongoDB        │
       │                        │  ─────────────>        │
       │                        │                        │
       │                        │  SignalR "Bet"         │
       │                        │───────────────────────>│
       │                        │                        │
       │  HTTP 200 (true)       │                        │  Redux dispatch
       │<───────────────────────│                        │  bet(index, amount)
       │                        │                        │
       │  Redux dispatch        │                        │
       │  bet(index, amount)    │                        │
       │                        │                        │
```

---

## 5. Video / Meeting Integration

### 5.1 Video SDK Configuration

**Provider:** VideoSDK.live (https://api.videosdk.live)

**Configuration (`appsettings.json`):**

> ⚠️ **Security Note:** The values below are from the existing source code. These credentials should be rotated and moved to secure secret storage before production deployment.

```json
{
  "VideoSDK": {
    "API_Key": "<API_KEY_FROM_SOURCE>",
    "Secret_Key": "<SECRET_KEY_FROM_SOURCE>"
  }
}
```

### 5.2 Client-Side Video Integration

**SDK Setup (`util/VideoSDK.js` and `API.js`):**
```javascript
// Create meeting via VideoSDK API
export const createMeeting = async ({ token }) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
  });
  const { roomId } = await res.json();
  return roomId;
};
```

**Meeting Provider Wrapper (`Pages/Game/Main.js`):**
```javascript
import { MeetingProvider, MeetingConsumer, useMeeting } from "@videosdk.live/react-sdk";

const MeetingProviderWrappedMainGame = () => {
  const user = useSelector((state) => state.auth.user);
  const meetingId = searchParams.get("MeetingId");

  if (meetingId === null) {
    return <MainGame isVideoChatAllowed={false} />;
  }
  
  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: user.DisplayName,
        participantId: user.Id,
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => <MainGame isVideoChatAllowed={true} />}
      </MeetingConsumer>
    </MeetingProvider>
  );
};
```

### 5.3 Video Flow

1. **Game Creation with Video:**
   - User checks "Allow Video Chat" checkbox
   - Frontend calls `createMeeting()` to get `roomId` from VideoSDK
   - `roomId` is stored as `MeetingId` in `GameHash` document

2. **Joining Game with Video:**
   - User joins via `/game/main-game?GameCode=XXX&MeetingId=YYY`
   - `MeetingProvider` wraps the game component
   - Each participant joins the VideoSDK room

3. **Video Time Deduction:**
   - Host's video time is tracked per minute
   - Deducted from user's `Asset.VideoTime` balance
   - Controller endpoints: `_DecreaseVideoTime`, `_DecreaseVideoTimeRuntime`

4. **Error Handling & Edge Cases:**
   - If VideoSDK room creation fails, game creation aborts with alert
   - If user's video credits run low (< 10 minutes × player count), a warning toast is shown
   - SignalR broadcasts `AlertNotifictionVideo` to all participants
   - When credits expire, video meeting ends but game continues
   - No automatic fallback to audio-only or text-only mode

### 5.4 Video-Related API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /Game/StartVideoMeeting` | Signal all players to join meeting |
| `POST /Game/EndVideoMeeting` | Signal all players to leave meeting |
| `POST /Game/ToggleCamera` | Update camera state |
| `POST /Game/ToggleMic` | Update mic state |
| `POST /MembershipManage/_PurchaseVideoTime` | Buy video credits |
| `POST /MembershipManage/_DecreaseVideoTime` | Deduct video credits |

---

## 6. Domain Models, Game Logic, and Database Access

### 6.1 Core Domain Models

**Location:** `Models/GameState/`

#### GameHash (Main Game State)
```csharp
public class GameHash
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string? HostName { get; set; }
    public string? GameCreatorId { get; set; }
    public string? GameCode { get; set; }
    public bool IsLocked { get; set; }
    public bool IsEnded { get; set; }
    public bool IsInvitesOnly { get; set; }
    public bool VideoChatAllowed { get; set; }
    public string? MeetingId { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime EndDate { get; set; }
    
    // Game State
    public string CurrentId { get; set; }      // Current player's turn
    public string DealerId { get; set; }        // Current dealer
    public int CurrentBet { get; set; }
    public int PotSize { get; set; }
    public int GameHand { get; set; }           // Hand number
    public int Round { get; set; }              // Betting round
    public bool IsRoundSettlement { get; set; }
    
    // Collections
    public List<ActivePlayer> ActivePlayers { get; set; }
    public List<Card> CommunityCards { get; set; }
    public List<HandStep> HandSteps { get; set; }  // Action history
    public List<string> Deck { get; set; }         // Remaining cards
    
    // Methods
    public void SetInitialDeck() { /* ... */ }
    public string SelectFromDeck() { /* ... */ }
    public int FindNextActivePlayerIndex(int index) { /* ... */ }
    public void AddStep(int index, string actionMessage, string action) { /* ... */ }
}
```

#### ActivePlayer
```csharp
public class ActivePlayer
{
    public string PlayerId { get; set; }
    public string PlayerName { get; set; }
    public string PlayerImage { get; set; }
    public string ConnectionId { get; set; }       // SignalR connection
    public int PlayerNetStatusFinal { get; set; }  // Running balance
    public int PlayerAmount { get; set; }          // Current chips
    public int CurrentRoundStatus { get; set; }    // Bet this round
    public bool IsSitOut { get; set; }
    public bool IsFolded { get; set; }
    public bool IsDisconnected { get; set; }
    public bool IsRealTimeChat { get; set; }       // Camera on/off
    public bool IsRealTimeChatForMic { get; set; } // Mic on/off
    public List<Card> PlayerCards { get; set; }
    public string LastActionPerformed { get; set; }
}
```

#### Card
```csharp
public class Card
{
    public string Value { get; set; }      // e.g., "AS", "KH", "10D"
    public int Presentation { get; set; }  // 0=visible, 1=face-down
    public int CommunityIndex { get; set; }
}
```

### 6.2 User & Asset Models

#### AppUser (`Models/AppUser.cs`)
```csharp
[CollectionName("Users")]
public class AppUser : MongoIdentityUser<Guid>
{
    public string DisplayName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string ImageFileName { get; set; }
    public int LoggedInCnt { get; set; }
    public DateTime LastActive { get; set; }
}
```

#### Asset (`Models/Asset.cs`)
```csharp
public class Asset
{
    public string? Id { get; set; }
    public string? UserId { get; set; }
    public int Tokens { get; set; }           // In-app currency
    public int VideoTime { get; set; }        // Video minutes
    public int MembershipPlanId { get; set; } // 1=Free, 2=Basic, etc.
    public string MembershipName { get; set; }
    public DateTime LastMembershipBillDate { get; set; }
    public int BillingPeriod { get; set; }    // 0=Month, 1=Annual
}
```

### 6.3 Game Logic Location

**Game logic is distributed across:**

1. **Controllers (`Controllers/GameController.cs`):**
   - Direct manipulation of `GameHash` in controller actions
   - Business logic tightly coupled with HTTP handlers
   - Example: `OnPlayerAction()` method handles turn progression

2. **Client-Side Redux (`slice/gameStateSlice.js`):**
   - Duplicated game logic for optimistic updates
   - Same turn progression logic in JavaScript

3. **Service Layer (`Services/`):**
   - Services are primarily **data access layers**
   - No centralized game engine or state machine

**Critical Observation:** Game logic is **NOT isolated**. It's embedded in:
- `GameController.cs` - Server-side in action methods
- `gameStateSlice.js` - Client-side in Redux reducers
- `GameControl.js` - Client-side API call handlers

### 6.4 Database Access Patterns

#### MongoDB (Primary - Game Data)

**Services using MongoDB:**
- `GameStateService` - Game sessions
- `AssetService` - User tokens/credits
- `MembershipService` - Subscription plans
- `UserService` - User accounts
- `TransactionService` - Payment records
- `PlayerService` - Player data
- `RecurringGameService` - Saved games
- `GameInviteService` - Game invites
- `SignInHistoryService` - Login audit

**Example Service Pattern:**
```csharp
public class GameStateService
{
    private readonly IMongoCollection<GameHash> mongoCollection;
    
    public GameStateService(IOptions<MongoDBSetting> options)
    {
        var mongoClient = new MongoClient(options.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
        mongoCollection = mongoDatabase.GetCollection<GameHash>("GameStates");
    }
    
    public async Task<GameHash> GetByGameCodeAsync(string gameCode) =>
        await mongoCollection.Find(x => x.GameCode == gameCode).FirstOrDefaultAsync();
    
    public async Task UpdateAsync(string id, GameHash gameHash) =>
        await mongoCollection.ReplaceOneAsync(x => x.Id == id, gameHash);
}
```

#### SQL Server (Secondary - Legacy)

**DbContext:** `Models/DBCardGameContext.cs`

**Tables:**
- `ActionType` - Action type codes
- `ExceptionLog` - Error logging
- `GameHashTemp` - Temporary game data
- `GameLog` - Game action logging
- `LogEntryType` - Log type definitions
- `Player` - Player records
- `PlayerAction` - Player action history
- `PlayerCard` - Player card assignments
- `GameInvite` - Game invitations
- `RecurringGames` - Recurring game definitions
- `Memberships` - Membership plans
- `Assets` - User assets
- `Transactions` - Transaction records

**Current Usage:** The SQL Server context appears to be **legacy/unused** for primary operations. Most data flows through MongoDB services.

---

## 7. Routing, URLs, and Interaction Patterns

### 7.1 URL Structure

| URL Pattern | Controller/Component | Purpose |
|-------------|---------------------|---------|
| `/` | `Home.js` | Landing page, create/join game |
| `/auth/sign-in` | `SignIn.js` | User login |
| `/auth/sign-up` | `SignUp.js` | User registration |
| `/game/games` | `Games.js` | Recurring/past games list |
| `/game/main-game?GameCode=XXX` | `Main.js` | Active game table |
| `/game/main-game?GameCode=XXX&MeetingId=YYY` | `Main.js` | Game with video |
| `/landing/features` | `Features.js` | Marketing page |
| `/landing/free-trial` | `FreeTrial.js` | Marketing page |

### 7.2 API Route Structure

All API routes are prefixed based on controller name:

```
/Auth/*           - Authentication
/Game/*           - Game operations
/Admin/*          - Admin operations
/MembershipManage/* - Subscription management
```

### 7.3 Interaction Patterns

**All interactions are AJAX-based.** There are no full page reloads except navigation.

| Flow | Pattern |
|------|---------|
| Authentication | AJAX POST → Store JWT → Update Redux |
| Create Game | AJAX POST → Get GameCode → Navigate to game |
| Join Game | SignalR Connect → AJAX POST → Set Redux state |
| Game Actions | AJAX POST → SignalR broadcast → Redux update |
| Real-time Updates | SignalR event → Redux dispatch |

### 7.4 Authorization

**Middleware:** `Middleware/JwtMiddleware.cs`
- Extracts JWT from `Authorization` header
- Validates token and sets `HttpContext.Items["UserId"]`

**Custom Attribute:** `Attributes/AuthorizeAttribute.cs`
- Checks for `UserId` in HttpContext items
- Returns 401 if not present

**Usage:**
```csharp
[Authorize]  // Custom attribute, not ASP.NET's
[HttpPost]
public async Task<bool> KickPlayer([FromBody] GameControllerRequestModel model)
```

---

## 8. Build & Run Instructions

### 8.1 Prerequisites

- .NET 7.0 SDK
- Node.js 16+ (for React frontend)
- MongoDB instance
- SQL Server (LocalDB or full instance)

### 8.2 Configuration

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DbCoreConnectionString": "Server=(localdb)\\MSSQLLocalDB;Integrated Security=true;Database=CardGameDB;"
  },
  "MongoDBConfig": {
    "ConnectionString": "mongodb://localhost:27017/",
    "DatabaseName": "CardGame"
  },
  "AppSettings": {
    "Secret": "YOUR_JWT_SECRET_KEY"
  },
  "VideoSDK": {
    "API_Key": "your-api-key",
    "Secret_Key": "your-secret-key"
  }
}
```

### 8.3 Database Setup

**MongoDB:**
1. Start MongoDB server
2. Run initialization script: `DBScripts/CardGame.sql` (despite extension, it's MongoDB commands)
3. Run roles script: `DBScripts/Roles.js`

**SQL Server:**
1. Create database `CardGameDB`
2. Run migration script: `DBScripts/script.sql`

### 8.4 Build Commands

```bash
# Backend
cd dealer2023-main/Demon0515-MongoDB-731
dotnet restore
dotnet build

# Frontend (automatically run by csproj)
cd ClientApp
npm install
npm run build
```

### 8.5 Run Commands

**Development:**
```bash
# Terminal 1 - Backend
dotnet run

# Terminal 2 - Frontend (optional, for hot reload)
cd ClientApp
npm start
```

The backend serves the React app via SPA proxy in development mode.

**Production:**
```bash
dotnet publish -c Release
# Deploy to IIS or Kestrel
```

### 8.6 Environment Variables

Create `ClientApp/.env.development`:
```
REACT_APP_API_HOST=https://localhost:5001
```

---

## 9. Migration-Focused Notes

### 9.1 Tightly Coupled Areas

#### Controllers with Embedded Business Logic

| File | Issue | Migration Impact |
|------|-------|------------------|
| `GameController.cs` | All game logic in controller methods | Extract to domain service |
| `GameController.cs` | `OnPlayerAction()` calculates turn progression | Create game state machine |
| `AdminController.cs` | Direct MongoDB queries in actions | Move to repository layer |
| `MembershipManageController.cs` | Business rules in controller | Extract pricing/billing service |

#### Example: Tightly Coupled Code
```csharp
// GameController.cs - Logic that should be in a service
private GameHash OnPlayerAction(GameHash gameHash, int currentIndex)
{
    int HighestBet = gameHash.ActivePlayers.Max(player => player.CurrentRoundStatus);
    gameHash.IsRoundSettlement = false;
    gameHash.CurrentBet = HighestBet;
    
    int newIndex = gameHash.FindNextActivePlayerIndex(currentIndex);
    gameHash.CurrentId = gameHash.ActivePlayers[newIndex].PlayerId;
    
    // ... 30+ lines of game state manipulation
}
```

### 9.2 Duplicated Logic

**Client-server duplication in:**
- Turn progression logic
- Bet calculation logic
- Hand settlement logic
- Card dealing logic

**Files:**
- Server: `Controllers/GameController.cs`
- Client: `slice/gameStateSlice.js`, `common/game/GameControl.js`

### 9.3 Files Requiring API Adaptation

#### Controllers to Refactor

| Controller | Actions to Migrate | Notes |
|------------|-------------------|-------|
| `AuthController` | All (8 actions) | Replace Identity with API auth |
| `GameController` | All (35+ actions) | Extract game engine, add API facade |
| `AdminController` | All (9 actions) | Add proper authorization layer |
| `MembershipManageController` | All (7 actions) | Integrate payment gateway |

#### Frontend Files to Update

| File | Changes Needed |
|------|----------------|
| `util/AxiosUtil.js` | Update base URL for new API |
| `common/game/GameControl.js` | Update all 25+ API call URLs |
| `slice/gameStateSlice.js` | May need new action creators |
| `Pages/Game/Main.js` | SignalR connection to new hub |

### 9.4 Reusable JavaScript Components

**Can be extracted/reused:**
- `slice/gameStateSlice.js` - Redux state structure
- `slice/authSlice.js` - Auth state management
- `components/MainGameComponents/*` - UI components
- `util/VideoSDK.js` - Video integration helpers

### 9.5 Critical File Checklist

#### Authentication & Session
- [ ] `Controllers/AuthController.cs` - Auth endpoints
- [ ] `Middleware/JwtMiddleware.cs` - JWT validation
- [ ] `Attributes/AuthorizeAttribute.cs` - Authorization
- [ ] `Models/AppUser.cs` - User model
- [ ] `slice/authSlice.js` - Client auth state
- [ ] `util/AxiosUtil.js` - Token handling

#### Lobby & Game Creation
- [ ] `Controllers/GameController.cs` (CreateGame, GetPastGames, GetRecurringGames)
- [ ] `Services/GameStateService.cs` - Game CRUD
- [ ] `Services/RecurringGameService.cs` - Recurring games
- [ ] `Pages/Game/Home.js` - Create/join UI
- [ ] `Pages/Game/Games.js` - Game list UI

#### In-Game Table
- [ ] `Controllers/GameController.cs` (All game actions)
- [ ] `Models/GameState/GameHash.cs` - Game state model
- [ ] `Models/GameState/ActivePlayer.cs` - Player model
- [ ] `Hubs/GameClass.cs` - SignalR hub
- [ ] `Pages/Game/Main.js` - Game table UI
- [ ] `slice/gameStateSlice.js` - Game state management
- [ ] `common/game/GameControl.js` - API calls
- [ ] `components/MainGameComponents/*` - UI components

#### Real-Time Updates
- [ ] `Hubs/GameClass.cs` - SignalR hub
- [ ] `Program.cs` - Hub registration
- [ ] `common/game/GameControl.js` - SignalR client connection
- [ ] `Pages/Game/Main.js` - Event handlers

#### Video Integration
- [ ] `Controllers/GameController.cs` (Video endpoints)
- [ ] `Controllers/MembershipManageController.cs` (Video time)
- [ ] `API.js` - VideoSDK client
- [ ] `util/VideoSDK.js` - Video helpers
- [ ] `Pages/Game/Main.js` - MeetingProvider wrapper

---

## 10. Risks and Coupling Hotspots

### 10.1 High-Risk Areas

| Area | Risk Level | Issue |
|------|------------|-------|
| `GameController.cs` | 🔴 HIGH | 35+ actions with embedded business logic |
| Game state duplication | 🔴 HIGH | Logic in both C# and JavaScript |
| MongoDB direct access | 🟡 MEDIUM | Services bypass repository pattern |
| JWT hardcoded secret | 🔴 HIGH | Secret in config file |
| Video SDK credentials | 🔴 HIGH | Credentials in config and client code |

### 10.2 Coupling Hotspots

#### 1. Controller-to-SignalR Coupling
```csharp
// GameController.cs - Controllers directly broadcast to SignalR
gameHash.ActivePlayers.ForEach(async player =>
{
    await _HubContext.Clients.Client(player.ConnectionId).SendAsync("Bet", ...);
});
```
**Risk:** Difficult to test, tight coupling to SignalR infrastructure.

#### 2. Direct MongoDB Manipulation in Controllers
```csharp
// GameController.cs - Direct service calls without abstraction
GameHash gameHash = await _GameStateService.GetByGameCodeAsync(model.GameCode!);
gameHash.ActivePlayers[model.Index].PlayerAmount -= model.Amount;
await _GameStateService.UpdateAsync(gameHash.Id!, gameHash);
```
**Risk:** No domain layer, business rules scattered.

#### 3. Client-Side Game State Duplication
```javascript
// gameStateSlice.js - Duplicates server logic
bet: (state, action) => {
    state.ActivePlayers[action.payload.Index].PlayerAmount -= action.payload.Amount;
    state.PotSize += action.payload.Amount;
    // ... same logic as server
}
```
**Risk:** Logic drift between client and server.

### 10.3 Reference Behavior vs. Reusable Code

#### Reference Only (Rewrite Needed)
- `Controllers/GameController.cs` - Needs clean domain layer
- `Controllers/AdminController.cs` - Needs proper authorization
- `Middleware/JwtMiddleware.cs` - Replace with standard auth
- `Models/DBCardGameContext.cs` - Legacy SQL context

#### Potentially Reusable
- `Models/GameState/*` - Domain models (with cleanup)
- `Services/*Service.cs` - Data access patterns
- `Hubs/GameClass.cs` - SignalR structure (events)
- `slice/gameStateSlice.js` - State structure
- `components/MainGameComponents/*` - UI components
- `common/game/GameControl.js` - API interface (update URLs)

### 10.4 Recommended Migration Order

1. **Phase 1: Authentication**
   - Create new auth API
   - Migrate user/asset models
   - Update frontend auth flow

2. **Phase 2: Game Engine**
   - Extract game logic from controllers
   - Create proper domain layer
   - Implement game state machine

3. **Phase 3: Real-Time**
   - Design new SignalR hub contract
   - Update client event handlers
   - Remove logic duplication

4. **Phase 4: Lobby & Features**
   - Migrate game listing APIs
   - Update recurring games
   - Migrate membership/billing

5. **Phase 5: Video Integration**
   - Abstract video provider
   - Secure credential handling
   - Update client integration

---

## Appendix A: File Quick Reference

### Backend Files

| Path | Description |
|------|-------------|
| `Program.cs` | Application startup |
| `Controllers/AuthController.cs` | Authentication API |
| `Controllers/GameController.cs` | Game API |
| `Controllers/AdminController.cs` | Admin API |
| `Controllers/MembershipManageController.cs` | Billing API |
| `Hubs/GameClass.cs` | SignalR game hub |
| `Services/GameStateService.cs` | Game data access |
| `Services/AssetService.cs` | User assets |
| `Models/GameState/GameHash.cs` | Game state model |
| `Models/GameState/ActivePlayer.cs` | Player model |
| `Models/AppUser.cs` | User model |
| `Middleware/JwtMiddleware.cs` | JWT validation |

### Frontend Files

| Path | Description |
|------|-------------|
| `src/index.js` | Entry point |
| `src/AppRoutes.js` | Route definitions |
| `src/store.js` | Redux store |
| `src/Pages/Game/Home.js` | Landing page |
| `src/Pages/Game/Main.js` | Game table |
| `src/Pages/Auth/SignIn.js` | Login page |
| `src/slice/gameStateSlice.js` | Game state |
| `src/slice/authSlice.js` | Auth state |
| `src/common/game/GameControl.js` | API calls |
| `src/util/AxiosUtil.js` | HTTP client |
| `src/components/MainGameComponents/*` | Game UI |

---

*Report generated for DealersChoice migration project*
