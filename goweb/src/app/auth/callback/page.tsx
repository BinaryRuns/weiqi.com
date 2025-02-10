"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/store/authSlice";

/**
 * Handles the callback from the from backend.
 * All it does it extract the access token from the query params
 * and stores it in the redux store. And set httpOnly cookie.
 * @returns
 */

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("accessToken");
    if (token) {
      dispatch(setAccessToken(token));
      // Redirect to home after login
      router.push("/");
    }
  }, [searchParams, dispatch, router]);

  return <div>Processing login...</div>;
}
