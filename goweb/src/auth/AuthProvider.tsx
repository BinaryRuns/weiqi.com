"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { RootState, store } from "@/store/store";
import { useEffect, useState } from "react";
import { setAccessToken, clearAccessToken } from "@/store/authSlice";
import { refreshAccessToken } from "./AuthService";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const AuthManager = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isProtectedRoute = !["/login", "/register"].includes(pathname);

    const handleRefreshToken = async () => {
      try {
        const data = await refreshAccessToken();
        dispatch(setAccessToken(data.accessToken));
      } catch (error) {
        console.log("Failed to refresh token on load:", error);
        router.push("/login");
        dispatch(clearAccessToken());
      } finally {
        setLoading(false);
      }
    };

    if (isProtectedRoute && !accessToken) {
      handleRefreshToken();
    } else {
      setLoading(false);
    }
  }, [accessToken, dispatch, pathname]);

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
