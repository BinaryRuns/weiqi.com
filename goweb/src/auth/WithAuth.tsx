"use client";

/**
 * To manage page level protection for protected pages
 */

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { setAccessToken } from "@/store/authSlice";

// TODO: refractor the protected route component better

const withAuth = (WrappedComponent: React.ComponentType) => {
  return function ProtectedComponent() {
    const accessToken = useSelector(
      (state: RootState) => state.auth.accessToken
    );
    const router = useRouter();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const initializeAuth = async () => {
        if (!accessToken) {
          try {
            const response = await fetch("/api/auth/refresh", {
              method: "POST",
            });
            const { accessToken } = await response.json();
            dispatch(setAccessToken(accessToken));
          } catch (error) {
            console.error("Failed to refresh token", error);
            router.push("/login");
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      };

      initializeAuth();
    }, [accessToken, dispatch, router]);

    if (isLoading) {
      return <h1>Loading...</h1>;
    } else {
      return accessToken ? <WrappedComponent /> : null;
    }
  };
};

export default withAuth;
