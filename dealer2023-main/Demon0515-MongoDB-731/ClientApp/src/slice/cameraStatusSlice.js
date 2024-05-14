// cameraStatusSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isCameraOn: true,
  isCameraOff:false, // remove
};

const cameraStatusSlice = createSlice({
  name: "cameraStatus",
  initialState,
  reducers: {
    setCameraStatus: (state, action) => {
      state.isCameraOn = action.payload;
    },
    setCameraStatusoff: (state, action) => { // remove
        state.isCameraOff = action.payload;
      },
  },
});

export const { setCameraStatus ,setCameraStatusoff} = cameraStatusSlice.actions;

export default cameraStatusSlice.reducer;
