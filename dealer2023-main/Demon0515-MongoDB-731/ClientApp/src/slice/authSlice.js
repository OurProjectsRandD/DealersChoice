import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isAuthorized: false,
  isMeetingJoined: false,
  user: {
    DisplayName: "",
  },
  asset: {
    Tokens: 0,
    VideoTime: 0,
  },
  roles: [],
}
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMeetingJoined: (state, action) => {
      state.isMeetingJoined = action.payload;
    },
    authorized: (state, action) => {
      state.isAuthorized = true;
      state.user = action.payload.user || {};
      state.asset = action.payload.asset || {};
      state.roles = action.payload.roles || [];
    },
    unAuthorized: (state) => {
      state.isAuthorized = false;
      state.asset = {
        Tokens: 0,
        VideoTime: 0,
      };
    },
    setUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    buyTokens: (state, action) => {
      state.asset.Tokens =
        parseInt(state.asset.Tokens) + parseInt(action.payload);
    },
    buyVideoTime: (state, action) => {
      state.asset.VideoTime =
        parseInt(state.asset.VideoTime) + parseInt(action.payload);
      state.asset.Tokens -=
        action.payload * process.env.REACT_APP_VIDEOMINUTES_PER_TOKEN;
    },
    setVideoTime: (state, action) => {
      state.asset.VideoTime = parseInt(action.payload);
    },
    setToken: (state, action) => {
      state.asset.Tokens = parseInt(action.payload);
    }

  },
});

export const {
  authorized,
  unAuthorized,
  setUser,
  buyVideoTime,
  buyTokens,
  setVideoTime,
  setToken,
  setMeetingJoined,
} = authSlice.actions;

export default authSlice.reducer;
