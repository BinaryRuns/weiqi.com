"use client"

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect } from "react";

const withAuth = (WrappedComponent: React.ComponentType) => {
  return function ProtectedComponent() {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const router = useRouter();

    useEffect(() => {
      if (!accessToken) {
        router.push("/login"); // Redirect to login if unauthenticated
      }
    }, [accessToken, router]);

    return accessToken ? <WrappedComponent /> : null;
  };
};

export default withAuth;