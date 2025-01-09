"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { RootState, store } from "@/store/store";
import { useEffect, useState } from "react";
import { setAccessToken, clearAccessToken } from "@/store/authSlice";
import { refreshAccessToken } from "./AuthService";

const AuthManager = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRefreshToken = async () => {
      // TODO: Implement a loading state to prevent rendering protected routes prematurely

      try {
        const data = await refreshAccessToken();
        dispatch(setAccessToken(data.accessToken));
      } catch (error) {
        console.error("Failed to refresh token on load:", error);
        dispatch(clearAccessToken());
      } finally {
        setLoading(false);
      }
    };

    if (!accessToken) {
      handleRefreshToken();
    } else {
      setLoading(false);
    }
  }, [accessToken, dispatch]);

  if (loading) {
    return <div>Loading....</div>;
  }
  // Don't render anything
  return null;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <AuthManager />
    {children}
  </Provider>
);
export default AuthProvider;
