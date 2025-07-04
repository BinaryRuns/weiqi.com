"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/components/login/AuthProviderButton";

/**
 * Error types for auth operations
 */
export enum AuthErrorType {
  USERNAME_CONFLICT = "username_conflict",
  EMAIL_CONFLICT = "email_conflict",
  NETWORK_ERROR = "network_error",
  SERVER_ERROR = "server_error",
  UNAUTHORIZED = "unauthorized",
  UNKNOWN = "unknown",
}

/**
 * Standardized error response
 */
export type AuthError = {
  type: AuthErrorType;
  message: string;
  details?: any;
};

// Create the auth context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  forceUserSync: () => Promise<boolean>; // Returns success status
  updateUserProfile: (profileData: {
    username?: string;
    avatarUrl?: string;
    skillLevel?: string;
  }) => Promise<{ success: boolean; message?: string; [key: string]: any }>;
  authError: AuthError | null; // Authentication error information
  isProfileComplete: (userId: string) => boolean; // Check if profile is complete
  setProfileComplete: (userId: string, isComplete: boolean) => void; // Set profile completeness
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define a key for localStorage user sync flag
const getUserSyncKey = (userId: string) => `user_synced_${userId}`;

// Define a key for tracking profile completeness
const getProfileCompletenessKey = (userId: string) =>
  `profile_complete_${userId}`;

/**
 * Authentication provider that manages Supabase auth state
 * and ensures users are synced with the backend database
 */
export const SupabaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const router = useRouter();

  // Utility function to handle API errors
  const handleApiError = async (response: Response): Promise<AuthError> => {
    try {
      const errorData = await response.json();

      if (response.status === 409) {
        // Handle conflict errors
        if (errorData.message?.includes("email")) {
          return {
            type: AuthErrorType.EMAIL_CONFLICT,
            message: "A user with this email already exists",
            details: errorData,
          };
        } else if (errorData.message?.includes("username")) {
          return {
            type: AuthErrorType.USERNAME_CONFLICT,
            message: "This username is already taken",
            details: errorData,
          };
        }
      } else if (response.status === 401) {
        return {
          type: AuthErrorType.UNAUTHORIZED,
          message: "Authentication required",
          details: errorData,
        };
      } else if (response.status >= 500) {
        return {
          type: AuthErrorType.SERVER_ERROR,
          message: "Server error occurred",
          details: errorData,
        };
      }

      // Default error
      return {
        type: AuthErrorType.UNKNOWN,
        message: errorData.message || "An unknown error occurred",
        details: errorData,
      };
    } catch (e) {
      // Error parsing the JSON response
      return {
        type: AuthErrorType.UNKNOWN,
        message: "Failed to parse error response",
        details: { status: response.status },
      };
    }
  };

  // Function to ensure user exists in our backend
  const ensureUserInBackend = async (currentUser: User, token: string) => {
    try {
      if (!currentUser.email) {
        console.error("User has no email, cannot sync with backend");
        setAuthError({
          type: AuthErrorType.UNKNOWN,
          message: "User has no email address",
        });
        return false;
      }

      // Prepare user data from Supabase
      const userData = {
        email: currentUser.email,
        username:
          currentUser.user_metadata?.username ||
          currentUser.user_metadata?.full_name ||
          `user_${currentUser.id.substring(0, 8)}`,
        avatarUrl: currentUser.user_metadata?.avatar_url,
        skillLevel: currentUser.user_metadata?.skill_level || "beginner",
      };

      // Use the create-user endpoint for first-time sync
      const syncResponse = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!syncResponse.ok) {
        const error = await handleApiError(syncResponse);
        setAuthError(error);
        console.error("Failed to sync user with backend:", error);
        return false;
      }

      // Parse the response to check if it's a new user
      try {
        const responseData = await syncResponse.json();

        // Mark user as synced
        localStorage.setItem(getUserSyncKey(currentUser.id), "true");

        // If this is a new user, mark profile as incomplete to prompt for completion later
        if (responseData.isNewUser) {
          localStorage.setItem(
            getProfileCompletenessKey(currentUser.id),
            "false"
          );

          // Could redirect to profile completion page here if desired
          // router.push('/settings/profile');
        }

        // Clear any previous errors
        setAuthError(null);
        return true;
      } catch (e) {
        console.error("Error parsing sync response:", e);
        // Still mark as synced to avoid repeated sync attempts
        localStorage.setItem(getUserSyncKey(currentUser.id), "true");

        setAuthError({
          type: AuthErrorType.UNKNOWN,
          message: "Failed to parse server response",
        });
        return false;
      }
    } catch (error) {
      console.error("Error ensuring user in backend:", error);
      setAuthError({
        type: AuthErrorType.NETWORK_ERROR,
        message: "Network error while syncing user data",
      });
      return false;
    }
  };

  // Check if a user has already been synced
  const hasUserBeenSynced = (userId: string) => {
    try {
      return localStorage.getItem(getUserSyncKey(userId)) === "true";
    } catch (e) {
      return false;
    }
  };

  // Check if a user's profile is complete
  const isProfileComplete = (userId: string) => {
    try {
      return localStorage.getItem(getProfileCompletenessKey(userId)) === "true";
    } catch (e) {
      return false;
    }
  };

  // Mark a user's profile as complete or incomplete
  const setProfileComplete = (userId: string, isComplete: boolean) => {
    try {
      localStorage.setItem(
        getProfileCompletenessKey(userId),
        isComplete ? "true" : "false"
      );
    } catch (e) {
      console.error("Error setting profile completeness:", e);
    }
  };

  // Force a sync regardless of previous sync status
  const forceUserSync = async () => {
    if (session?.user) {
      // Remove the sync flag to force a new sync
      localStorage.removeItem(getUserSyncKey(session.user.id));
      return await ensureUserInBackend(session.user, session.access_token);
    }
    return false;
  };

  // Update user profile information
  const updateUserProfile = async (profileData: {
    username?: string;
    avatarUrl?: string;
    skillLevel?: string;
  }) => {
    if (!session?.user) {
      console.error("Cannot update profile: No authenticated user");
      setAuthError({
        type: AuthErrorType.UNAUTHORIZED,
        message: "Not authenticated",
      });
      return { success: false, message: "Not authenticated" };
    }

    try {
      const response = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await handleApiError(response);
        setAuthError(error);
        return {
          success: false,
          message: error.message,
          error,
        };
      }

      const data = await response.json();
      setAuthError(null); // Clear any previous errors
      return { success: true, ...data };
    } catch (error) {
      console.error("Error updating user profile:", error);
      const authError = {
        type: AuthErrorType.NETWORK_ERROR,
        message: "Network error while updating profile",
      };
      setAuthError(authError);
      return {
        success: false,
        message: "Error updating profile",
        error: authError,
      };
    }
  };

  // Initialize the auth state when the component mounts
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get the current session and user
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          // Only sync the user if this is their first login
          // We check localStorage to see if they've been synced before
          if (session?.user && !hasUserBeenSynced(session.user.id)) {
            await ensureUserInBackend(session.user, session.access_token);
          }
        }

        // Listen for auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted || !session) return;

          setSession(session);
          setUser(session?.user ?? null);

          // Only sync on FIRST sign up or if never synced before
          // This ensures we only create the backend record once per user
          const isFirstSignIn =
            event === "SIGNED_IN" && !hasUserBeenSynced(session.user.id);
          if (session?.user && isFirstSignIn) {
            await ensureUserInBackend(session.user, session.access_token);
          }
        });

        if (mounted) {
          setLoading(false);
        }

        // Cleanup the subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setLoading(false);
          setAuthError({
            type: AuthErrorType.UNKNOWN,
            message: "Error initializing authentication",
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Social sign-in handler
  const signIn = async (provider: AuthProvider) => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Error during sign in:", error);
      setAuthError({
        type: AuthErrorType.UNKNOWN,
        message: "Error during sign in",
      });
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.push("/");
      } else {
        console.error("Error signing out:", error);
        setAuthError({
          type: AuthErrorType.UNKNOWN,
          message: "Error signing out",
        });
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      setAuthError({
        type: AuthErrorType.UNKNOWN,
        message: "Unexpected error during sign out",
      });
    }
  };

  const value = {
    session,
    user,
    signIn,
    signOut,
    loading,
    forceUserSync, // Expose the force sync function
    updateUserProfile, // Expose the profile update function
    authError, // Expose authentication errors
    isProfileComplete: (userId: string) => isProfileComplete(userId),
    setProfileComplete: (userId: string, isComplete: boolean) =>
      setProfileComplete(userId, isComplete),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the auth context
 * @throws Error if used outside of a SupabaseAuthProvider
 */
export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  }
  return context;
};
