import { Games } from "@mui/icons-material";
import { GetFullURL, SendRequest } from "../../util/AxiosUtil";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import gameStateSlice from "../../slice/gameStateSlice";
import { getMinutes } from "../../util/VideoSDK";
import { setToken } from "../../slice/authSlice";

export const startConnectionWithGameCodeAndUserId = async (
  GameCode,
  UniqueId
) => {
  const connection = new HubConnectionBuilder()
    .withUrl(
      GetFullURL(`GameClass?GameCode=${GameCode}&UserIdentity=${UniqueId}`)
    )
    .withAutomaticReconnect()
    .build();

  if (connection.state === HubConnectionState.Connected) return;

  await connection.start();

  return connection;
};

export const checkIfJoinedMeeting = (
  meetingAPI,
  UserId,
  feedback = () => {}
) => {
  return (
    meetingAPI !== null &&
    meetingAPI.meeting !== null &&
    meetingAPI.meeting.participants.has(UserId)
  );
};

export const EndVideoMeeting = (UserId, GameCode, feedback = () => {}) => {
  SendRequest({
    url: "Game/EndVideoMeeting",
    method: "post",
    data: {
      UserId,
      GameCode,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const StartVideoMeeting = (UserId, GameCode, feedback = () => {}) => {
  SendRequest({
    url: "Game/StartVideoMeeting",
    method: "post",
    data: {
      UserId,
      GameCode,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const DealCards = (
  UserId,
  GameCode,
  Amount,
  Index,
  Type,
  DealType,
  feedback = () => {}
) => {
  SendRequest({
    url: "Game/DealCards",
    method: "post",
    data: {
      UserId,
      GameCode,
      Amount,
      Index,
      Type,
      DealType,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const PassDeal = (UserId, GameCode, DealerId, feedback = () => {}) => {
  SendRequest({
    url: "Game/PassDeal",
    method: "post",
    data: {
      UserId,
      GameCode,
      DealerId,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const PassCards = (
  UserId,
  GameCode,
  DraggingCards,
  Index,
  Type,
  feedback = () => {}
) => {
  SendRequest({
    url: "Game/PassCards",
    method: "post",
    data: {
      UserId,
      GameCode,
      DraggingCards,
      Index,
      Type,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const KickPlayer = (GameCode, Index, feedback = () => {}) => {
  SendRequest({
    url: "Game/KickPlayer",
    method: "post",
    data: {
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else {
      feedback();
    }
  });
};

export const LeaveGame = (GameCode, Index, feedback = () => {}) => {
  SendRequest({
    url: "Game/LeftGame",
    method: "post",
    data: {
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const LockGame = (UserId, GameCode, feedback = () => {}) => {
  SendRequest({
    url: "Game/ToggleLock",
    method: "post",
    data: {
      UserId,
      GameCode,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Bet = (
  UserId,
  GameCode,
  Index,
  BetAmount,
  feedback = () => {}
) => {
  SendRequest({
    url: "Game/Bet",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      Amount: BetAmount,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Take = (UserId, GameCode, Index, Amount, feedback = () => {}) => {
  SendRequest({
    url: "Game/Take",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      Amount,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Ante = (UserId, GameCode, Index, Amount, feedback = () => {}) => {
  SendRequest({
    url: "Game/Ante",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      Amount,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const AddToPot = (
  UserId,
  GameCode,
  Index,
  Amount,
  feedback = () => {}
) => {
  SendRequest({
    url: "Game/AddToPot",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      Amount,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Call = (UserId, GameCode, Index, feedback) => {
  SendRequest({
    url: "Game/Call",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const CancelHand = (UserId, GameCode, feedback = () => {}) => {
  SendRequest({
    url: "Game/CancelHand",
    method: "post",
    data: {
      UserId,
      GameCode,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Check = (UserId, GameCode, Index, feedback = () => {}) => {
  SendRequest({
    url: "Game/Check",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Discard = (
  UserId,
  GameCode,
  Index,
  SelectedCards,
  feedback = () => {}
) => {
  SendRequest({
    url: "Game/Discard",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      DraggingCards: SelectedCards,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const ReturnToDeck = (
  UserId,
  GameCode,
  Index,
  SelectedCards,
  feedback = () => {}
) => {
  SendRequest({
    url: "Game/ReturnToDeck",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      DraggingCards: SelectedCards,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Show = (
  UserId,
  GameCode,
  Index,
  SelectedCards,
  Type,
  feedback = () => {}
) => {
  SendRequest({
    url: "Game/Show",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      Type,
      DraggingCards: SelectedCards,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Endhand = (UserId, GameCode, Index, feedback = () => {}) => {
  SendRequest({
    url: "Game/Endhand",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Endgame = (UserId, GameCode, Index, feedback = () => {}) => {
  SendRequest({
    url: "Game/Endgame",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Fold = (UserId, GameCode, Index, feedback = () => {}) => {
  SendRequest({
    url: "Game/Fold",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Sitout = (UserId, GameCode, Index, feedback = () => {}) => {
  SendRequest({
    url: "Game/Sitout",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const Rejoin = (UserId, GameCode, Index, feedback = () => {}) => {
  SendRequest({
    url: "Game/Rejoin",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
    },
  }).then((result) => {
    if (result.data === false) alert("failed");
    else feedback();
  });
};

export const ToggleCamera = (UserId, GameCode, Index, Status,  feedback = () => {}) => {
  SendRequest({
    url: "Game/ToggleCamera",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      Status
    },
  }).then((result) => {
    if (result.data === true) feedback();
    else alert("failed");
  });
};
export const ToggleMic = (UserId, GameCode, Index, Status,feedback = () => {}) => {
  SendRequest({
    url: "Game/ToggleMic",
    method: "post",
    data: {
      UserId,
      GameCode,
      Index,
      Status
    },
  }).then((result) => {
    if (result.data === true) feedback();
    else alert("failed");
  });
};
export const decreaseVideoMinutes = async (
  gameHash,
  dispatch,
  setVideoMinute
) => {
  let minutes = await getMinutes(gameHash.MeetingId);
    SendRequest({
    url: "MembershipManage/_DecreaseVideoTime",
    method: "POST",
    data: {
      GameCode: gameHash.GameCode,
      VideoMinutes: minutes,
      MeetingId: gameHash.MeetingId,
    },
  }).then((res) => {
    console.log(res)
    alert("You have " + res.data.VideoTime + " video minutes left");
    dispatch(setVideoMinute(res.data.VideoTime));
    dispatch(setToken(res.data.Tokens));
  });
};
export const decreaseVideoMinutesRuntime = async (
  gameHash,
  dispatch,
  setVideoMinute
) => {
  let minutes = await getMinutes(gameHash.MeetingId);
  SendRequest({
    url: "MembershipManage/_DecreaseVideoTimeRuntime",
    method: "POST",
    data: {
      GameCode: gameHash.GameCode,
      VideoMinutes: minutes,
      MeetingId: gameHash.MeetingId,
    },
  }).then((res) => {
    console.log(res)
    //alert("You have " + res.data.VideoTime + " video minutes left");
    dispatch(setVideoMinute(res.data.VideoTime));
    dispatch(setToken(res.data.Tokens));
  });
};
export const OnPlayerAction = (GameState) => {
  let activePlayers = [...GameState.ActivePlayers];

  GameState.CurrentBet = activePlayers.sort(
    (x, y) => y.CurrentRoundStatus - x.CurrentRoundStatus
  )[0].CurrentRoundStatus;
  GameState.IsRoundSettlement = false;
  let newIndex = NextCurrentIndex(GameState, -1);
  GameState.CurrentId = GameState.ActivePlayers[newIndex].PlayerId;
  let currentPlayerbet =
    GameState.CurrentBet - GameState.ActivePlayers[newIndex].CurrentRoundStatus;
  GameState.BetStatusIndex = newIndex;
  GameState.BetStatus =
    "The bet is " +
    currentPlayerbet +
    " to " +
    GameState.ActivePlayers[newIndex].PlayerName;

  // all players current bet is same, start another betting round
  if (
    GameState.ActivePlayers.filter(
      (x) =>
        x.IsFolded === false && x.CurrentRoundStatus === GameState.CurrentBet
    ).length ===
    GameState.ActivePlayers.filter((x) => x.IsFolded === false).length
  ) {
    GameState.CurrentBet = 0;
    GameState.ActivePlayers.forEach(
      (player) => (player.CurrentRoundStatus = 0)
    );
    GameState.Round++;
    if (GameState.HandSteps[GameState.GameHand] === undefined) {
      GameState.HandSteps.push({
        HandId: GameState.GameHand,
        BettingRounds: [],
      });
    }
    GameState.HandSteps[GameState.GameHand].BettingRounds.push({
      RoundId: GameState.Round,
      BeforeRoundSteps: [],
      AfterRoundSteps: [],
    });
  }
  return GameState;
};

export const FindAvailablePlayer = (GameState) => {
  GameState.ActivePlayers.filter(
    (x) => x.IsDisconnected === false && x.IsFolded === false
  );
};

//find current
export const NextCurrentIndex = (GameState, index = -1) => {
  if (index === -1)
    index = GameState.ActivePlayers.findIndex(
      (player) => player.PlayerId === GameState.CurrentId
    );
  let newIndex = index;
  let count = 0;
  do {
    newIndex = (newIndex + 1) % GameState.ActivePlayers.length;
    if (
      GameState.ActivePlayers[newIndex].IsFolded === false &&
      GameState.ActivePlayers[newIndex].IsDisconnected === false
    )
      return newIndex;
  } while (count++ < GameState.ActivePlayers.length);
};

export const NextCurrentId = (GameState, index = -1) => {
  let newIndex = NextCurrentIndex(GameState, index);
  if (newIndex === -1) return "";
  else return GameState.ActivePlayers[newIndex].PlayerId;
};

export const CalculateTransanction = (GameState) => {
  let state = JSON.parse(JSON.stringify(GameState));

  state.ActivePlayers.forEach((player) => {
    player.PlayerNetStatusFinal += player.PlayerAmount;
    player.Balance = player.PlayerNetStatusFinal;
  });

  const ArrTransaction = [];
  const Winners = state.ActivePlayers.filter(
    (x) => x.PlayerNetStatusFinal > 0
  ).sort((x, y) => y.PlayerNetStatusFinal - x.PlayerNetStatusFinal);

  const Loosers = state.ActivePlayers.filter(
    (x) => x.PlayerNetStatusFinal < 0
  ).sort((x, y) => x.PlayerNetStatusFinal - y.PlayerNetStatusFinal);

  Loosers.forEach((looser) => {
    if (looser.Balance < 0) {
      Winners.forEach((winner) => {
        if (looser.Balance !== 0 && winner.Balance !== 0) {
          if (looser.Balance * -1 === winner.Balance) {
            ArrTransaction.push({
              from: {
                PlayerId: looser.PlayerId,
                PlayerName: looser.PlayerName,
              },
              to: { PlayerId: winner.PlayerId, PlayerName: winner.PlayerName },
              amount: winner.Balance,
            });
            looser.Balance = 0;
            winner.Balance = 0;
          } else if (looser.Balance * -1 > winner.Balance) {
            ArrTransaction.push({
              from: {
                PlayerId: looser.PlayerId,
                PlayerName: looser.PlayerName,
              },
              to: { PlayerId: winner.PlayerId, PlayerName: winner.PlayerName },
              amount: winner.Balance,
            });
            looser.Balance = looser.Balance + winner.Balance;
            winner.Balance = 0;
          } else if (looser.Balance * -1 < winner.Balance) {
            ArrTransaction.push({
              from: {
                PlayerId: looser.PlayerId,
                PlayerName: looser.PlayerName,
              },
              to: { PlayerId: winner.PlayerId, PlayerName: winner.PlayerName },
              amount: looser.Balance * -1,
            });
            winner.Balance = looser.Balance + winner.Balance;
            looser.Balance = 0;
          }
        }
      });
    }
  });

  return ArrTransaction;
};

export const AddStep = (GameState, index, actionMessage, action) => {
  if (index === -1) {
    index = GameState.ActivePlayers.findIndex(
      (x) => x.PlayerId === GameState.DealerId
    );
  }

  if (GameState.HandSteps.length <= GameState.GameHand) {
    GameState.HandSteps.push({
      HandId: GameState.GameHand,
      BettingRounds: [],
    });
  }
  if (
    GameState.HandSteps[GameState.GameHand].BettingRounds.length <=
    GameState.Round
  ) {
    GameState.HandSteps[GameState.GameHand].BettingRounds.push({
      RoundId: GameState.Round,
      BeforeRoundSteps: [],
      AfterRoundSteps: [],
    });
  }
  switch (action) {
    case "Deal":
    case "Ante":
      GameState.HandSteps[GameState.GameHand].BettingRounds[
        GameState.Round
      ].BeforeRoundSteps.push({
        PlayerId: GameState.ActivePlayers[index].PlayerId,
        PlayerName: GameState.ActivePlayers[index].PlayerName,
        Action: action,
        Amount: 0,
        Description: actionMessage,
      });
      break;
    default:
      GameState.HandSteps[GameState.GameHand].BettingRounds[
        GameState.Round
      ].AfterRoundSteps.push({
        PlayerId: GameState.ActivePlayers[index].PlayerId,
        PlayerName: GameState.ActivePlayers[index].PlayerName,
        Action: action,
        Amount: 0,
        Description: actionMessage,
      });
      break;
  }
};
