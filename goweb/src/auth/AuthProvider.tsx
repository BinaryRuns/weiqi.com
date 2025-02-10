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

    const handleRefresh = async () => {
      try {
        // Attempt to refresh the token if no access token is available.
        const { accessToken } = await refreshAccessToken();
        dispatch(setAccessToken(accessToken));
        setLoading(false);
      } catch (error) {
        dispatch(clearAccessToken());
        router.push("/login");
      }
    };

    if (isProtectedRoute) {
      if (!accessToken) {
        // If no access token exists, attempt to refresh it.
        handleRefresh();
      } else {
        // If an access token exists, assume the user is logged in.
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [accessToken, pathname, dispatch, router]);
  return null;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <AuthManager />
    {children}
  </Provider>
);
export default AuthProvider;
