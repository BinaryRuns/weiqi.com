// store/gameSlice.ts
import { ChatMessage, MessageType } from "@/types/ChatMessage";
import { BoardSize } from "@/types/game";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Player {
  userId: string;
  userName: string;
  color: "black" | "white";
  timeLeft: number;
}

export interface GameRoomState {
  roomId: string | null;
  players: Player[];
  stones: number[][];
  currentPlayerColor: "black" | "white";
  boardSize: BoardSize;
  blackTime: number;
  whiteTime: number;
  moveCount: number;
  status: "idle" | "matchmaking" | "playing" | "finished";
  error: string | null;
}

interface GameState {
  currentGame: GameRoomState | null;
  chatMessages: ChatMessage[];
}

const initialState: GameState = {
  currentGame: null,
  chatMessages: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameState: (state, action: PayloadAction<GameRoomState>) => {
      state.currentGame = action.payload;
    },
    updateBoard: (state, action: PayloadAction<number[][]>) => {
      if (state.currentGame) {
        state.currentGame.stones = action.payload;
        state.currentGame.moveCount += 1;
      }
    },
    updateTimer: (
      state,
      action: PayloadAction<{ blackTime: number; whiteTime: number }>
    ) => {
      if (state.currentGame) {
        state.currentGame.blackTime = action.payload.blackTime;
        state.currentGame.whiteTime = action.payload.whiteTime;
      }
    },
    addChatMessage: (
      state,
      action: PayloadAction<{ userId: string; message: string }>
    ) => {
      state.chatMessages.push({
        ...action.payload,
        timestamp: Date.now(),
        sender: "",
        senderUsername: "",
        content: "",
        roomId: "",
        type: MessageType.CHAT,
      });
    },
    setGameError: (state, action: PayloadAction<string | null>) => {
      if (state.currentGame) {
        state.currentGame.error = action.payload;
      }
    },
    resetGame: () => initialState,
    setGameStatus: (state, action: PayloadAction<GameRoomState["status"]>) => {
      if (state.currentGame) {
        state.currentGame.status = action.payload;
      }
    },
  },
});

export const gameActions = gameSlice.actions;
export default gameSlice.reducer;
