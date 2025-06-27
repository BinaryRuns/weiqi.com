"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Handles the callback from the from backend.
 * All it does it extract the access token from the query params
 * and stores it in the redux store. And set httpOnly cookie.
 * @returns
 */

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get next path from query params
        const next = searchParams.get("next") || "/";
        
        // Check for code in query params (authorization code flow)
        const code = searchParams.get("code");
        
        if (code) {
          // Handle authorization code flow
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Error exchanging code for session:", error);
            router.push("/login?error=" + encodeURIComponent(error.message || "Unable to sign in"));
            return;
          }
          
          console.log("User signed in with authorization code:", data.session?.user?.id);
          router.push(next);
          return;
        }
        
        // If no code, check for hash fragment (implicit flow)
        // Need to check on client side since hash fragment isn't sent to server
        if (typeof window !== 'undefined' && window.location.hash) {
          console.log("Hash detected, attempting to process:", window.location.hash);
          
          // Let Supabase handle the hash params internally
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session from hash:", error);
            router.push("/login?error=" + encodeURIComponent(error.message || "Unable to sign in"));
            return;
          }
          
          if (data.session) {
            console.log("User signed in with hash fragment:", data.session.user.id);
            router.push(next);
            return;
          }
        }
        
        // No valid auth data found
        console.error("No authentication data found");
        router.push("/login?error=No authentication data found");
      } catch (error: any) {
        console.error("Unexpected error during authentication:", error);
        router.push("/login?error=" + encodeURIComponent(error.message || "Authentication error"));
      }
    };
    
    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Signing you in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
