// store/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

const selectGameState = (state: RootState) => state.game;

export const selectCurrentGame = createSelector(
  [selectGameState],
  (game) => game.currentGame
);

export const selectPlayers = createSelector(
  [selectCurrentGame],
  (currentGame) => currentGame?.players || []
);

export const selectChatMessages = createSelector(
  [selectGameState],
  (game) => game.chatMessages
);

export const selectBoard = createSelector(
  [selectCurrentGame],
  (currentGame) => currentGame?.stones || []
);

export const selectGameStatus = createSelector(
  [selectCurrentGame],
  (currentGame) => currentGame?.status || "idle"
);

export const selectGameError = createSelector(
  [selectCurrentGame],
  (currentGame) => currentGame?.error
);
