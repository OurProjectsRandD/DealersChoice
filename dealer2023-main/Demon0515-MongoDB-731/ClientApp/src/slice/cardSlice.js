import { createSlice } from "@reduxjs/toolkit";

export const cardSlice = createSlice({
  name: "card",
  initialState: {
    selectedCards: [],
    draggingCard: null,
  },
  reducers: {
    setSelectedCards: (state, action) => {
      state.selectedCards = [...action.payload];
    },
    setDraggingCard: (state, action) => {
      state.draggingCard = { ...action.payload };
    },
  },
});

export const { setSelectedCards, setDraggingCard } = cardSlice.actions;

export default cardSlice.reducer;
