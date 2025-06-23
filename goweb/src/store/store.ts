import { configureStore } from "@reduxjs/toolkit";
import waitingReducer from "./waitingSlice";

export const store = configureStore({
  reducer: {
    waiting: waitingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
