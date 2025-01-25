import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { stat } from "fs";

interface WaitingState {
  waiting: boolean;
  waitingTime: number;
}

const initialState: WaitingState = {
  waiting: false,
  waitingTime: 0,
};

const waitingSlice = createSlice({
  name: "waiting",
  initialState,
  reducers: {
    startWaiting: (state) => {
      state.waiting = true;
      state.waitingTime = 0;
    },
    stopWaiting(state) {
      state.waiting = false;
      state.waitingTime = 0;
    },
    incrementTime(state) {
      if (state.waiting) {
        state.waitingTime += 1;
      }
    },
  },
});

export const { startWaiting, stopWaiting, incrementTime } =
  waitingSlice.actions;
export default waitingSlice.reducer;
