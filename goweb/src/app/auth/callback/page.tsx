"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/store/authSlice";

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
