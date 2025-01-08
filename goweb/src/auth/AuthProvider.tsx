"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { RootState, store } from "@/store/store";
import { useEffect } from "react";
import { setAccessToken, clearAccessToken } from "@/store/authSlice";

const AuthManager = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const refreshToken = async () => {
      // TODO: Implement a loading state to prevent rendering protected routes prematurely

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();
          dispatch(setAccessToken(data.accessToken));
        } else {
          dispatch(clearAccessToken());
        }
      } catch (error) {
        console.error("Failed to refresh token on load:", error);
        dispatch(clearAccessToken());
      }
    };

    if (!accessToken) {
      refreshToken();
    }
  }, [accessToken, dispatch]);

  return null;
};

const AuthProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProviderWrapper>
      <AuthManager />
      {children}
    </AuthProviderWrapper>
  );
};
export default AuthProvider;
