import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import waitingReducer from "./waitingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    waiting: waitingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
