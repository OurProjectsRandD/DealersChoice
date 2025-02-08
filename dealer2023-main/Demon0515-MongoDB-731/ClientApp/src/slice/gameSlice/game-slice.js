import { createSlice } from "@reduxjs/toolkit";

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
  },
});

const newGameStateReducer = slice.reducer;
const actions = slice.actions;
export { newGameStateReducer, actions };
