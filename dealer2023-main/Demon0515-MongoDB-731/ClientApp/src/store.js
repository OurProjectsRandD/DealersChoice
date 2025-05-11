import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import gameStateReducer from "./slice/gameStateSlice";
import cardSliceReducer from "./slice/cardSlice";
import cameraStatusReducer from "./slice/cameraStatusSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";

const persistConfig = {
  key: "root",
  storage,
  // stateReconciler: hardSet,
};

const rootReducer = combineReducers({
  auth: authReducer,
  gameState: gameStateReducer,
  card: cardSliceReducer,
  cameraStatus: cameraStatusReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  // reducer: persistedReducer,
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk],
});

export const persistor = persistStore(store);
