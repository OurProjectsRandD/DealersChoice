import { createSlice } from "@reduxjs/toolkit";
import {
  AddStep,
  NextCurrentId,
  OnPlayerAction,
} from "../../common/game/GameControl";
import { GetNewDeck } from "../../common/game/CommonGame";

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
      console.log("error message ==== ", action.payload);
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
      state.IsInvitesOnly = action.payload.IsInvitesOnly;
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
        (ele) => ele.PlayerId === action.payload.UserId
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
            CommunityIndex: Index,
          });
        }
      });
    },

    // PLAYER LEFT
    playerLeft(state, action) {
      state.isLoading = false;
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
    },

    // PLAYER DISCONNECTED
    playerDisconnected(state, action) {
      state.isLoading = false;
      state.ActivePlayers[action.payload].IsDisconnected = true;

      if (state.CurrentId === state.ActivePlayers[action.payload].PlayerId)
        state.CurrentId = NextCurrentId(state, action.payload);

      if (state.DealerId === state.ActivePlayers[action.payload].PlayerId)
        state.DealerId = NextCurrentId(state, action.payload);
    },

    // BET
    bet(state, action) {
      state.isLoading = false;
      const { Index, Amount } = action.payload;

      state.ActivePlayers[Index].PlayerAmount -= Amount;
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
      OnPlayerAction(state, Index);
    },

    // ADD TO POT
    addToPot(state, action) {
      state.isLoading = false;

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
    },

    // ANTE
    ante(state, action) {
      state.isLoading = false;

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
    },

    // CALL
    call(state, action) {
      state.isLoading = false;

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
    },

    cancelHand(state, action) {
      state.isLoading = false;

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
    },

    check(state, action) {
      state.isLoading = false;

      state.ActivePlayers[action.payload].LastActionPerformed = " Pass";
      AddStep(state, action.payload, " pass", "check");
      OnPlayerAction(state);
    },

    sitout(state, action) {
      state.isLoading = false;

      state.ActivePlayers[action.payload].LastActionPerformed = " Sitout";
      AddStep(state, action.payload, "sitout", "Sitout");
      state.ActivePlayers[action.payload].IsSitOut = true;
      state.ActivePlayers[action.payload].IsFolded = true;
      state.ActivePlayers[action.payload].PlayerCards.forEach(
        (playerCard) => (playerCard.Presentation = 1)
      );
      OnPlayerAction(state);
    },

    rejoin(state, action) {
      state.isLoading = false;

      state.ActivePlayers[action.payload].LastActionPerformed = " Rejoin";
      AddStep(state, action.payload, "rejoined", "Rejoin");
      state.ActivePlayers[action.payload].IsSitOut = false;
    },

    fold(state, action) {
      state.isLoading = false;
      console.log("payloadAtFold =====>", action.payload);
      
      state.ActivePlayers[action.payload].LastActionPerformed = " Fold";
      AddStep(state, action.payload, "folded", "Fold");
      state.ActivePlayers[action.payload].IsFolded = true;
      state.ActivePlayers[action.payload].PlayerCards.forEach(
        (playerCard) => (playerCard.Presentation = 1)
      );
      OnPlayerAction(state);
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

    // END HAND
    endHand(state, action) {
      state.isLoading = false;
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
    },

    // END GAME
    endGame(state, action) {
      state.isLoading = false;
      state.IsEnded = true;
    },

    // TOGGLE CAMERA
    toggleCamera(state, action) {
      state.isLoading = false;
      state.ActivePlayers[action.payload].IsRealTimeChat =
        !state.ActivePlayers[action.payload].IsRealTimeChat;
    },

    // HANDLE CAMERA
    handleCamera(state, action) {
      state.isLoading = false;
      state.ActivePlayers[action.payload.index].IsRealTimeChat =
        action.payload.value;
    },

    // DEAL CARD
    handleMic(state, action) {
      state.isLoading = false;
      state.ActivePlayers[action.payload.index].IsRealTimeChatForMic =
        action.payload.value;
    },

    // DEAL CARD
    dealCard(state, action) {
      state.isLoading = false;

      action.payload.dealCards.forEach((card) => {
        state.Deck = state.Deck.filter((x) => x !== card.Value);
        if (card.Type === 0) {
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
    },

    // PASS DEAL
    passDeal(state, action) {
      state.isLoading = false;

      state.DealerId = action.payload;
      if (state.Deck.length === 52) {
        let newDealerIndex = state.ActivePlayers.findIndex(
          (x) => x.PlayerId === state.DealerId
        );
        state.CurrentId = NextCurrentId(state, newDealerIndex);
      }
    },

    // TOGGLE LOCK
    toggleLock(state, action) {
      state.isLoading = false;
      state.IsLocked = !state.IsLocked;
    },
  },
});

const newGameStateReducer = slice.reducer;
const actions = slice.actions;
export { newGameStateReducer, actions };
