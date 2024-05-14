import { createSlice } from "@reduxjs/toolkit";
import LogRocket from "../util/LogRocketUtil";
import {
  AddStep,
  NextCurrentId,
  OnPlayerAction,
} from "../common/game/GameControl";
import { GetNewDeck } from "../common/game/CommonGame";
export const gameStateSlice = createSlice({
  name: "gameState",
  initialState: {
    GameCode: "",
    ActivePlayers: [],
    CommunityCards: [],
    HandSteps: [],
    Deck: [],
  },
  reducers: {
    setMeetingId: (state, action) => {
      state.MeetingId = action.payload;
    },
    setGameState: (state, action) => {
      return action.payload;
    },
    /**
     *0
     * @param {*} state
     * @param {*} action : left player index number
     */
    playerLeft: (state, action) => {
      let dealerIndex, currentIndex;
      dealerIndex = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === state.DealerId
      );
      currentIndex = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === state.CurrentId
      );
      if (dealerIndex === action.payload) {
        state.DealerId = NextCurrentId(state, dealerIndex);
      }
      if (currentIndex === action.payload) {
      }
      state.CurrentId = NextCurrentId(state, currentIndex);
      state.ActivePlayers.splice(action.payload, 1);
      LogRocket.log(`${action.payload}th Player Left Game`, state);
    },
    playerDisconnected: (state, action) => {
      state.ActivePlayers[action.payload].IsDisconnected = true;
      if (state.CurrentId === state.ActivePlayers[action.payload].PlayerId)
        state.CurrentId = NextCurrentId(state, action.payload);
      if (state.DealerId === state.ActivePlayers[action.payload].PlayerId)
        state.DealerId = NextCurrentId(state, action.payload);
      LogRocket.log(`${action.payload}th Player Disconnected`, state);
    },
    playerConnected: (state, action) => {
      let index = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === action.payload.UserId
      );
      if (index !== -1) {
        state.ActivePlayers[index].ConnectionId = action.payload.ConnectionId;
        state.ActivePlayers[index].IsDisconnected = false;
      }
      LogRocket.log(`${action.payload}th Player Connected`, state);
    },
    playerJoin: (state, action) => {
      let index = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === action.payload.userId
      );
      if (index !== -1) return;
      state.ActivePlayers.push({
        PlayerId: action.payload.userId,
        PlayerImage: action.payload.playerImage,
        PlayerName: action.payload.userName,
        ConnectionId: action.payload.connectionId,
        PlayerNetStatusFinal: 0,
        PlayerCards: [],
        PlayerAmount: 0,
        IsSitOut: false,
        IsFolded: false,
        IsRealTimeChat: true,
        IsRealTimeChatForMic: true,
        IsDisconnected: false,
        CurrentRoundStatus: 0,
        Balance: 0,
        LastActionPerformed: "",
      });
      if (state.ActivePlayers.length === 2) {
        state.CurrentId = state.ActivePlayers[1].PlayerId;
      }
      LogRocket.log(`${action.payload.userName} Joined joined the game`, state);
    },
    /**
     *
     * @param {*} state
     * @param {*} action; payload = { draggingCard: {}, Index, type }
     */
    passCard: (state, action) => {
      action.payload.draggingCards.forEach((draggingCard) => {
        if (draggingCard.Type === 0) {
          state.ActivePlayers[draggingCard.Index].PlayerCards =
            state.ActivePlayers[draggingCard.Index].PlayerCards.filter(
              (x) => x.Value !== draggingCard.Value
            );
        } else {
          state.CommunityCards = state.CommunityCards.filter(
            (x) => x.Value !== draggingCard.Value
          );
        }

        if (action.payload.Type === 0) {
          state.ActivePlayers[action.payload.Index].PlayerCards.push({
            Value: draggingCard.Value,
            Presentation: draggingCard.Presentation,
          });
        } else {
          state.CommunityCards.push({
            Value: draggingCard.Value,
            Presentation: 0,
            CommunityIndex: action.payload.Index,
          });
        }
      });
      LogRocket.log(
        `Pass ${action.payload.draggingCards.length} cards to ${action.payload.Index
        }th ${action.payload.Type === 0 ? "Player" : "Community"}`,
        state
      );
      return state;
    },
    bet: (state, action) => {
      state.ActivePlayers[action.payload.Index].PlayerAmount -=
        action.payload.Amount;
      state.PotSize += action.payload.Amount;
      state.ActivePlayers[action.payload.Index].CurrentRoundStatus +=
        action.payload.Amount;

      let actionMsg = " bet: " + action.payload.Amount;
      if (state.CurrentBet < action.payload.Amount) {
        actionMsg =
          " raised by: " +
          (action.payload.Amount - state.CurrentBet) +
          "- bet: " +
          action.payload.Amount;

        state.CurrentBet = action.payload.Amount;
      }
      state.ActivePlayers[action.payload.Index].LastActionPerformed = actionMsg;
      AddStep(state, action.payload.Index, actionMsg, "Bet");
      OnPlayerAction(state, action.payload.Index);
      LogRocket.log(
        `${action.payload.Index}th Player betted ${action.payload.Amount}`,
        state
      );
    },
    addToPot: (state, action) => {
      state.ActivePlayers[action.payload.Index].PlayerAmount -=
        action.payload.Amount;
      state.PotSize += action.payload.Amount;
      state.ActivePlayers[action.payload.Index].LastActionPerformed =
        " added " + action.payload.Amount + "$ to pot";
      AddStep(
        state,
        action.payload.Index,
        "added " + action.payload.Amount + "$ to pot",
        "AddToPot"
      );
      LogRocket.log(
        `${action.payload.Index}th Player added ${action.payload.Amount} to pot`
      );
    },
    ante: (state, action) => {
      state.ActivePlayers.filter(
        (player) => !player.IsFolded && !player.IsDisconnected
      ).forEach((player) => {
        player.PlayerAmount -= action.payload.Amount;
        state.PotSize += action.payload.Amount;
      });
      state.ActivePlayers[action.payload.Index].LastActionPerformed =
        "Ante " + action.payload.Amount;
      AddStep(
        state,
        action.payload.Index,
        "anted " + action.payload.Amount + "$",
        "Ante"
      );
      LogRocket.log(`Anted ${action.payload.Amount} to Pot`, state);
    },
    call: (state, action) => {
      const betamount = state.CurrentBet;
      const currentPlayer = state.ActivePlayers[action.payload];
      const currentplayerbet = betamount - currentPlayer.CurrentRoundStatus;
      currentPlayer.CurrentRoundStatus = betamount;
      const actionMsg = " called with " + currentplayerbet;
      currentPlayer.PlayerAmount -= currentplayerbet;
      state.PotSize += currentplayerbet;
      currentPlayer.LastActionPerformed = actionMsg;
      AddStep(state, action.payload, actionMsg, "Call");
      OnPlayerAction(state, action.payload);
      LogRocket.log(
        `${action.payload}th Player Called ${currentplayerbet}`,
        state
      );
    },
    cancelHand: (state, action) => {
      state.ActivePlayers.forEach((player) => {
        if (player.PlayerAmount < 0) state.PotSize += player.PlayerAmount;
        player.PlayerAmount = 0;
        player.Balance = 0;
        player.CurrentRoundStatus = 0;
        player.PlayerCards = [];
        player.LastActionPerformed = "";
        if (!player.IsSitOut) player.IsFolded = false;
      });
      state.BetStatus = "New Hand. No bet yet.";
      state.CurrentBet = 0;
      state.CommunityCards = [];
      state.Deck = GetNewDeck();
      let index = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === state.DealerId
      );
      AddStep(state, index, "cancelled hand", "Cancel_Hand");
      state.GameHand += 1;
      state.Round = 0;
      state.HandSteps.push({
        HandId: state.GameHand,
        BettingRounds: [],
      });
      let dealerIndex = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === state.DealerId
      );
      state.CurrentId = NextCurrentId(state, dealerIndex);
      LogRocket.log(`Cancelled Hand`);
    },
    check: (state, action) => {
      state.ActivePlayers[action.payload].LastActionPerformed = " Pass";
      AddStep(state, action.payload, " pass", "check");
      OnPlayerAction(state);
      LogRocket.log(`${action.payload}th Player checked`, state);
    },
    sitout: (state, action) => {
      state.ActivePlayers[action.payload].LastActionPerformed = " Sitout";
      AddStep(state, action.payload, "sitout", "Sitout");
      state.ActivePlayers[action.payload].IsSitOut = true;
      state.ActivePlayers[action.payload].IsFolded = true;
      state.ActivePlayers[action.payload].PlayerCards.forEach(
        (playerCard) => (playerCard.Presentation = 1)
      );
      OnPlayerAction(state);
      LogRocket.log(`${action.payload}th Player sit out`, state);
    },
    rejoin: (state, action) => {
      state.ActivePlayers[action.payload].LastActionPerformed = " Rejoin";
      AddStep(state, action.payload, "rejoined", "Rejoin");
      state.ActivePlayers[action.payload].IsSitOut = false;
      LogRocket.log(`${action.payload}th Player rejoined`, state);
    },
    fold: (state, action) => {
      state.ActivePlayers[action.payload].LastActionPerformed = " Fold";
      AddStep(state, action.payload, "folded", "Fold");
      state.ActivePlayers[action.payload].IsFolded = true;
      state.ActivePlayers[action.payload].PlayerCards.forEach(
        (playerCard) => (playerCard.Presentation = 1)
      );
      OnPlayerAction(state);
      LogRocket.log(`${action.payload}th Player folede`, state);
    },
    take: (state, action) => {
      state.ActivePlayers[action.payload.Index].LastActionPerformed =
        " Took $" + action.payload.Amount;
      state.ActivePlayers[action.payload.Index].PlayerAmount +=
        action.payload.Amount;
      state.PotSize -= action.payload.Amount;
      AddStep(
        state,
        action.payload.Index,
        state.ActivePlayers[action.payload.Index].LastActionPerformed,
        "Take"
      );
      LogRocket.log(
        `${action.payload.Index}th Player took $${action.payload.Amount}`,
        state
      );
    },
    discard: (state, action) => {
      state.ActivePlayers[action.payload.Index].LastActionPerformed =
        " Discarded " + action.payload.selectedCards.length + " cards";
      action.payload.selectedCards.forEach((card) => {
        if (card.Type === 0)
          state.ActivePlayers[action.payload.Index].PlayerCards =
            state.ActivePlayers[action.payload.Index].PlayerCards.filter(
              (obj) => obj.Value !== card.Value
            );
        else {
          state.CommunityCards = state.CommunityCards.filter(
            (obj) => obj.Value !== card.Value
          );
        }
      });
      AddStep(
        state,
        action.payload.Index,
        state.ActivePlayers[action.payload.Index].LastActionPerformed,
        "Discard"
      );
      LogRocket.log(
        `${action.payload.Index}th Player discarded ${action.payload.selectedCards.length} cards`,
        state
      );
    },
    returnToDeck: (state, action) => {
      state.ActivePlayers[action.payload.Index].LastActionPerformed =
        " Returned " + action.payload.selectedCards.length + " cards";
      action.payload.selectedCards.forEach((card) => {
        if (card.Type === 0) {
          state.ActivePlayers[action.payload.Index].PlayerCards =
            state.ActivePlayers[action.payload.Index].PlayerCards.filter(
              (obj) => obj.Value !== card.Value
            );
        } else if (card.Type === 1) {
          state.CommunityCards = state.CommunityCards.filter(
            (obj) => obj.Value !== card.Value
          );
        }
        state.Deck.push(card.Value);
      });
      AddStep(
        state,
        action.payload.Index,
        state.ActivePlayers[action.payload.Index].LastActionPerformed,
        "ReturnToDeck"
      );
      LogRocket.log(
        `${action.payload.Index}th Player returned ${action.payload.selectedCards.length} cards to deck`,
        state
      );
    },
    show: (state, action) => {
      if (action.payload.selectedCards.length === 0) {
        state.ActivePlayers[action.payload.Index].PlayerCards.forEach(
          (card) => (card.Presentation = 0)
        );
      } else {
        action.payload.selectedCards.forEach((card) => {
          if (card.Type === 0) {
            let index = state.ActivePlayers[
              action.payload.Index
            ].PlayerCards.findIndex((x) => x.Value === card.Value);
            if (index !== -1)
              state.ActivePlayers[action.payload.Index].PlayerCards[
                index
              ].Presentation = 0;
          } else {
            state.CommunityCards.find(
              (x) => x.Value === card.Value
            ).Presentation = 0;
          }
        });
      }
      LogRocket.log(`${action.payload.Index}th Player showed cards`, state);
    },
    endHand: (state, action) => {
      state.IsRoundSettlement = true;
      AddStep(state, -1, "ended hand", "EndHand");
      state.ActivePlayers.forEach((obj) => {
        obj.PlayerNetStatusFinal = obj.PlayerNetStatusFinal + obj.PlayerAmount;
        obj.PlayerAmount = 0;
        obj.Balance = 0;
        obj.CurrentRoundStatus = 0;
        obj.LastActionPerformed = "";
        obj.PlayerCards = [];
        //if you'r not sitout, set IsFolded as false
        if (!obj.IsSitOut) obj.IsFolded = false;
      });
      state.CommunityCards = [];
      state.CurrentBet = 0;
      state.Deck = GetNewDeck();
      state.GameHand += 1;
      state.Round = 0;
      state.HandSteps.push({
        HandId: state.GameHand,
        BettingRounds: [],
      });

      state.BetStatus = "New Hand. No bet yet.";
      let dealerIndex = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === state.DealerId
      );
      state.CurrentId = NextCurrentId(state, dealerIndex);
      LogRocket.log(`Ended hand`, state);
    },
    endGame: (state, action) => {
      state.IsEnded = true;
      LogRocket.log(`Ended game`);
    },
    toggleCamera: (state, action) => {
      // debugger;
      state.ActivePlayers[action.payload].IsRealTimeChat =
        !state.ActivePlayers[action.payload].IsRealTimeChat;
    },
    handleCamera: (state, action) => {
      state.ActivePlayers[action.payload.index].IsRealTimeChat = action.payload.value;
    },
    toggleMic: (state, action) => {
      // state.ActivePlayers[action.payload].IsRealTimeChatForMic =
      //   !state.ActivePlayers[action.payload].IsRealTimeChatForMic;
    },
    handleMic: (state, action) => {
      state.ActivePlayers[action.payload.index].IsRealTimeChatForMic = action.payload.value;
    },
    dealCards: (state, action) => {
      action.payload.dealCards.forEach((card) => {
        state.Deck = state.Deck.filter((x) => x !== card.Value);
        if (card.Type === 0) {
          // state.ActivePlayers.filter(
          //   (player) => !player.IsFolded
          // )[card.Index].PlayerCards.push({
          if (!state.ActivePlayers[card.Index].IsFolded)
            state.ActivePlayers[card.Index].PlayerCards.push({
              Value: card.Value,
              Presentation: card.Presentation,
            });
        } else {
          state.CommunityCards.push({
            Value: card.Value,
            Presentation: card.Presentation,
            CommunityIndex: card.Index,
          });
        }
      });
      let dealerIndex = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === state.DealerId
      );
      state.ActivePlayers[dealerIndex].LastActionPerformed =
        action.payload.LastActionPerformed;
      AddStep(state, dealerIndex, action.payload.LastActionPerformed, "Deal");
      LogRocket.log(action.payload.LastActionPerformed, state);
    },
    passDeal: (state, action) => {
      state.DealerId = action.payload;
      if (state.Deck.length === 52) {
        let newDealerIndex = state.ActivePlayers.findIndex(
          (x) => x.PlayerId === state.DealerId
        );
        state.CurrentId = NextCurrentId(state, newDealerIndex);
      }
      LogRocket.log(`Passed Deal to ${action.payload}th Player`, state);
    },
    toggleLock: (state, action) => {
      state.IsLocked = !state.IsLocked;
    },
  },
});

export const {
  setMeetingId,
  setGameState,
  passCard,
  playerLeft,
  playerDisconnected,
  bet,
  take,
  addToPot,
  ante,
  call,
  cancelHand,
  check,
  discard,
  returnToDeck,
  show,
  endHand,
  fold,
  sitout,
  rejoin,
  endGame,
  toggleCamera,
  handleCamera,
  toggleMic,
  handleMic,
  dealCards,
  passDeal,
  playerConnected,
  toggleLock,
  playerJoin,
} = gameStateSlice.actions;

export default gameStateSlice.reducer;
