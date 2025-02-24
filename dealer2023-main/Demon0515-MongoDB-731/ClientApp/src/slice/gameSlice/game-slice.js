import { createSlice } from "@reduxjs/toolkit";
import {
  AddStep,
  NextCurrentId,
  OnPlayerAction,
} from "../../common/game/GameControl";

/**
 * @TODO: move all functions dependent on states out of the reducers into the action dispatchers
 */

const initialState = {
  isLoading: false,
  Id: null,
  HostName: null,
  GameCreatorId: null,
  IsLocked: false,
  IsEnded: false,
  IsInvitesOnly: false,
  VideoChatAllowed: false,
  MeetingId: null,
  CreatedDate: null,
  EndDate: null,
  NumberOfCommunities: 0,
  CurrentId: null,
  DealerId: null,
  BetStatus: null,
  BetStatusIndex: 0,
  CurrentBet: 0,
  PotSize: 0,
  GameHand: 0,
  Round: 0,
  MeetingMinutes: 0,
  IsRoundSettlement: false,
  GameCode: null,
  ActivePlayers: [],
  CommunityCards: [],
  HandSteps: [],
  Deck: [],
  error: null,
};

const slice = createSlice({
  name: "newGameState",
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // SET GAME STATE
    setState(state, action) {
      state.isLoading = false;
      state.Id = action.payload.Id;
      state.GameCreatorId = action.payload.GameCreatorId;
      state.HostName = action.payload.HostName;
      state.IsLocked = action.payload.IsLocked;
      state.IsEnded = action.payload.IsEnded;
      state.IsInvitesOnly = action.IsInvitesOnly;
      state.VideoChatAllowed = action.payload.VideoChatAllowed;
      state.MeetingId = action.payload.MeetingId;
      state.CreatedDate = action.payload.CreatedDate;
      state.EndDate = action.payload.EndDate;
      state.NumberOfCommunities = action.payload.NumberOfCommunities;
      state.CurrentId = action.payload.CurrentId;
      state.DealerId = action.payload.DealerId;
      state.BetStatus = action.payload.BetStatus;
      state.BetStatusIndex = action.payload.BetStatusIndex;
      state.CurrentBet = action.payload.CurrentBet;
      state.PotSize = action.payload.PotSize;
      state.GameHand = action.payload.GameHand;
      state.Round = action.payload.Round;
      state.MeetingMinutes = action.payload.MeetingMinutes;
      state.IsRoundSettlement = action.payload.IsRoundSettlement;
      state.GameCode = action.payload.GameCode;
      state.ActivePlayers = action.payload.ActivePlayers;
      state.CommunityCards = action.payload.CommunityCards;
      state.HandSteps = action.payload.HandSteps;
      state.Deck = action.payload.Deck;
    },

    // PLAYER CONNECTED STATE
    playerConnected(state, action) {
      state.isLoading = false;

      let playerIndex = state.ActivePlayers.findIndex(
        (ele) => ele.PlayerId === action.payload.Userid
      );

      if (playerIndex !== -1) {
        state.ActivePlayers[playerIndex].ConnectionId =
          action.payload.ConnectionId;
        state.ActivePlayers[playerIndex].IsDisconnected = false;
      }
    },

    // PLAYER JOIN GAME
    playerJoinGame(state, action) {
      state.isLoading = false;

      const { userId, playerImage, userName, connectionId } = action.payload;
      let index = state.ActivePlayers.findIndex((x) => x.PlayerId === userId);

      if (index !== -1) {
        return;
      }

      state.ActivePlayers.push({
        PlayerId: userId,
        PlayerImage: playerImage,
        PlayerName: userName,
        ConnectionId: connectionId,
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
    },

    // PASS CARD STATE
    passCard(state, action) {
      state.isLoading = false;
      const { draggingCards, Type, Index } = action.payload;

      draggingCards.forEach((draggingCard) => {
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

        if (Type === 0) {
          state.ActivePlayers[Index].PlayerCards.push({
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
    },

    // PLAYER LEFT
    playerLeft(state, action) {
      state.isLoading = false;
      const { index } = action.payload;

      let dealerIndex = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === state.DealerId
      );
      let currentPlayerIndex = state.ActivePlayers.findIndex(
        (x) => x.PlayerId === state.CurrentId
      );

      if (dealerIndex === index) {
        state.DealerId = NextCurrentId(state, dealerIndex);
      }
      if (currentPlayerIndex === index) {
      }
      state.CurrentId = NextCurrentId(state, currentPlayerIndex);
      state.ActivePlayers.splice(index, 1);

      // if (dealerIndex === action.payload) {
      //   // state.DealerId = NextCurrentId();
      //   console.log("state ====== ", state);
      //   console.log("dealer index ======= ", dealerIndex);
      // }
    },

    // PLAYER DISCONNECTED
    playerDisconnected(state, action) {
      state.isLoading = false;
      state.ActivePlayers[action.payload.index].IsDisconnected = true;
      if (
        state.CurrentId === state.ActivePlayers[action.payload.index].PlayerId
      )
        state.CurrentId = NextCurrentId(state, action.payload.index);
      if (state.DealerId === state.ActivePlayers[action.payload.index].PlayerId)
        state.DealerId = NextCurrentId(state, action.payload.index);
    },

    // BET
    bet(state, action) {
      state.isLoading = false;
      const { Index, Amount } = action.payload;

      state.ActivePlayers[Index].PlayerAmount -= action.payload.Amount;
      state.PotSize += Amount;
      state.ActivePlayers[Index].CurrentRoundStatus += Amount;

      let actionMsg = " bet: " + Amount;
      if (state.CurrentBet < Amount) {
        actionMsg =
          " raised by: " + (Amount - state.CurrentBet) + "- bet: " + Amount;

        state.CurrentBet = Amount;
      }
      state.ActivePlayers[Index].LastActionPerformed = actionMsg;
      AddStep(state, Index, actionMsg, "Bet");
      OnPlayerAction(Index);
    },

    // TAKE
    take(state, action) {
      state.isLoading = false;
      const { Index, Amount } = action.payload;

      state.ActivePlayers[Index].LastActionPerformed = " Took $" + Amount;
      state.ActivePlayers[Index].PlayerAmount += Amount;
      state.PotSize -= Amount;
      AddStep(
        state,
        Index,
        state.ActivePlayers[Index].LastActionPerformed,
        "Take"
      );
    },

    // DISCARD
    discard(state, action) {
      state.isLoading = false;

      const { Index, selectedCards } = action.payload;
      state.ActivePlayers[Index].LastActionPerformed =
        "Discarded " + selectedCards.length + " cards";

      selectedCards.forEach((element) => {
        if (element.Type === 0) {
          state.ActivePlayers[Index].PlayerCards = state.ActivePlayers[
            Index
          ].PlayerCards.filter((item) => item.Value !== element.Value);
        } else {
          state.CommunityCards = state.CommunityCards.filter(
            (item) => item.Value !== element.Value
          );
        }
      });

      AddStep(
        state,
        Index,
        state.ActivePlayers[Index].LastActionPerformed,
        "Discard"
      );
    },
  },

  // RETURN TO DECK
  returnToDeck(state, action) {
    const { Index, selectedCards } = action.payload;

    state.isLoading = false;
    state.ActivePlayers[Index].LastActionPerformed =
      " Returned " + selectedCards.length + " cards";

    selectedCards.forEach((card) => {
      if (card.Type === 0) {
        state.ActivePlayers[Index].PlayerCards = state.ActivePlayers[
          Index
        ].PlayerCards.filter((obj) => obj.Value !== card.Value);
      }

      if (card.Type === 1) {
        state.CommunityCards = state.CommunityCards.filter(
          (obj) => obj.Value !== card.Value
        );
      }

      state.Deck.push(card.Value);
    });

    AddStep(
      state,
      Index,
      state.ActivePlayers[Index].LastActionPerformed,
      "ReturnToDeck"
    );
  },

  // SHOW
  show(state, action) {
    state.isLoading = false;
    const { selectedCards, Index } = action.payload;

    if (selectedCards.length === 0) {
      state.ActivePlayers[Index].PlayerCards.forEach(
        (card) => (card.Presentation = 0)
      );
    } else {
      selectedCards.forEach((card) => {
        if (card.Type === 0) {
          let index = state.ActivePlayers[Index].PlayerCards.findIndex(
            (x) => x.Value === card.Value
          );

          if (index !== -1) {
            state.ActivePlayers[Index].PlayerCards[index].Presentation = 0;
          } else {
            state.CommunityCards.find((x) => x.Value === card.Value);
          }
        }
      });
    }
  },
});

const newGameStateReducer = slice.reducer;
const actions = slice.actions;
export { newGameStateReducer, actions };
