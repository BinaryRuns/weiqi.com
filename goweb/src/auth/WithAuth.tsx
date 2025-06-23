"use client";

/**
 * To manage page level protection for protected pages
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";

// TODO: refractor the protected route component better

const withAuth = (WrappedComponent: React.ComponentType) => {
  return function ProtectedComponent() {
    const router = useRouter();
    const { user, loading } = useSupabaseAuth();
    const [isClientLoaded, setIsClientLoaded] = useState(false);

    // This useEffect ensures the component only renders on the client
    useEffect(() => {
      setIsClientLoaded(true);
    }, []);

    // Don't render anything until both auth is loaded and client-side rendering is confirmed
    if (loading || !isClientLoaded) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      );
    }

    // If auth is loaded but no user, redirect to login
    if (!user) {
      router.push('/login');
      return null;
          }

    // User is authenticated, render the protected component
    return <WrappedComponent />;
  };
};

export default withAuth;
