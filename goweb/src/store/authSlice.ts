import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { string } from "zod";

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  userName: string | null;
}
interface JwtPayload {
  sub: string; // Subject (userId)
  exp: number; // Expiration time (as a UNIX timestamp)
  username: string;
}

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  userName: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;

      try {
        const decoded = jwtDecode<JwtPayload>(action.payload);
        state.userId = decoded.sub;
        state.userName = decoded.username;
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    },
    clearAccessToken: (state) => {
      state.accessToken = null;
    },
  },
});

export const { setAccessToken, clearAccessToken } = authSlice.actions;
export default authSlice.reducer;
