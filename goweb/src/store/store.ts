import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import waitingReducer from "./waitingSlice";
import gameReducer from "./gameSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    waiting: waitingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
