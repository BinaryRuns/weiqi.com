"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/components/login/AuthProviderButton";
import { fetchUserSettings } from "@/app/settings/api/get-user-settings";
import {
  calculateProfileCompleteness,
  getStandardProfileFields,
} from "@/utils/profileCompleteness";

// --- Types and Enums ---

export enum AuthErrorType {
  USERNAME_CONFLICT = "username_conflict",
  EMAIL_CONFLICT = "email_conflict",
  NETWORK_ERROR = "network_error",
  SERVER_ERROR = "server_error",
  UNAUTHORIZED = "unauthorized",
  UNKNOWN = "unknown",
}

export type AuthError = {
  type: AuthErrorType;
  message: string;
  details?: any;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profileCompleteness: number;
  isCompletenessLoading: boolean;
  completenessError: Error | null;
  authError: AuthError | null;
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  forceUserSync: () => Promise<void>;
  refreshUserSettings: () => Promise<void>;
};

// --- Context Definition ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- LocalStorage Keys ---

const getUserSyncKey = (userId: string) => `user_synced_${userId}`;
const getUserSettingsKey = (userId: string) => `user_settings_${userId}`;

// --- Auth Provider Component ---

export const SupabaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [isCompletenessLoading, setIsCompletenessLoading] = useState(true);
  const [completenessError, setCompletenessError] = useState<Error | null>(
    null
  );
  const router = useRouter();

  const syncUserWithBackend = async (
    currentUser: User,
    token: string
  ): Promise<void> => {
    // We only need to sync the user if they haven't been synced before.
    if (!localStorage.getItem(getUserSyncKey(currentUser.id))) {
      const syncResponse = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentUser.email,
          username:
            currentUser.user_metadata?.username ||
            currentUser.user_metadata?.full_name ||
            `user_${currentUser.id.substring(0, 8)}`,
          avatarUrl: currentUser.user_metadata?.avatar_url,
          skillLevel: currentUser.user_metadata?.skill_level || "beginner",
        }),
      });

      if (!syncResponse.ok && syncResponse.status !== 409) {
        throw new Error("Failed to sync user with backend.");
      }
      localStorage.setItem(getUserSyncKey(currentUser.id), "true");
    }
  };

  const loadUserAndSettings = async (
    currentUser: User,
    token: string
  ): Promise<void> => {
    setIsCompletenessLoading(true);
    setCompletenessError(null);

    try {
      // Check for cached settings first to prevent flashing during hot reloads
      const cachedSettingsJson = sessionStorage.getItem(
        getUserSettingsKey(currentUser.id)
      );
      if (cachedSettingsJson) {
        try {
          const cachedSettings = JSON.parse(cachedSettingsJson);
          const fields = getStandardProfileFields(cachedSettings);
          const completeness = calculateProfileCompleteness(fields);
          setProfileCompleteness(completeness);
          setIsCompletenessLoading(false);

          // Continue with sync in background
          syncUserWithBackend(currentUser, token).catch(console.error);
          return;
        } catch (e) {
          console.error("Error parsing cached settings:", e);
          // Continue with normal flow if parsing fails
        }
      }

      await syncUserWithBackend(currentUser, token);

      const settings = await fetchUserSettings(currentUser.id);
      if (settings) {
        // Cache the settings for future hot reloads
        sessionStorage.setItem(
          getUserSettingsKey(currentUser.id),
          JSON.stringify(settings)
        );

        const fields = getStandardProfileFields(settings);
        const completeness = calculateProfileCompleteness(fields);
        setProfileCompleteness(completeness);
      } else {
        setProfileCompleteness(0);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("An unknown error occurred");
      setCompletenessError(error);
      console.error("Error during user data loading:", error);
    } finally {
      setIsCompletenessLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Initialize immediately with cached session if available
    const initFromCache = () => {
      try {
        // Check if we have session in sessionStorage (for hot reloads)
        const cachedSessionStr = sessionStorage.getItem(
          "supabase_auth_session"
        );
        if (cachedSessionStr) {
          try {
            const cachedSession = JSON.parse(cachedSessionStr);
            if (cachedSession && cachedSession.user) {
              setSession(cachedSession);
              setUser(cachedSession.user);

              // Load cached settings if available
              const cachedSettingsJson = sessionStorage.getItem(
                getUserSettingsKey(cachedSession.user.id)
              );
              if (cachedSettingsJson) {
                const cachedSettings = JSON.parse(cachedSettingsJson);
                const fields = getStandardProfileFields(cachedSettings);
                const completeness = calculateProfileCompleteness(fields);
                setProfileCompleteness(completeness);
                setIsCompletenessLoading(false);
              }

              // We'll still verify with Supabase in the background
              setLoading(false);
            }
          } catch (e) {
            console.error("Error parsing cached session:", e);
          }
        }
      } catch (e) {
        console.error("Error accessing sessionStorage:", e);
      }
    };

    // Try to initialize from cache first (for hot reloads)
    initFromCache();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // If we have a user and the session is just being refreshed,
      // we don't need to reload all user settings.
      if (
        user &&
        session &&
        (event === "TOKEN_REFRESHED" || event === "USER_UPDATED")
      ) {
        setSession(session); // Update session but that's it
        return;
      }

      setSession(session);
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      // Cache the session for hot reloads
      if (session) {
        try {
          sessionStorage.setItem(
            "supabase_auth_session",
            JSON.stringify(session)
          );
        } catch (e) {
          console.error("Error caching session:", e);
        }
      } else {
        sessionStorage.removeItem("supabase_auth_session");
      }

      if (sessionUser && session) {
        await loadUserAndSettings(sessionUser, session.access_token);
      } else {
        setProfileCompleteness(0);
        setIsCompletenessLoading(false);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
        setProfileCompleteness(0);

        // Clear cached data
        if (session?.user) {
          sessionStorage.removeItem(getUserSettingsKey(session.user.id));
        }
        sessionStorage.removeItem("supabase_auth_session");

        router.push("/");
        setTimeout(() => window.location.reload(), 100);
      } else {
        console.error("Error signing out:", error);
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  const forceUserSync = async () => {
    if (session?.user) {
      localStorage.removeItem(getUserSyncKey(session.user.id));
      sessionStorage.removeItem(getUserSettingsKey(session.user.id));
      await loadUserAndSettings(session.user, session.access_token);
    }
  };

  const refreshUserSettings = async (): Promise<void> => {
    if (!session?.user) {
      return;
    }

    setIsCompletenessLoading(true);
    try {
      // Always fetch fresh data from the server
      const settings = await fetchUserSettings(session.user.id);
      if (settings) {
        // Update the cache
        sessionStorage.setItem(
          getUserSettingsKey(session.user.id),
          JSON.stringify(settings)
        );

        // Update the profile completeness
        const fields = getStandardProfileFields(settings);
        const completeness = calculateProfileCompleteness(fields);
        setProfileCompleteness(completeness);
      }
    } catch (err) {
      console.error("Error refreshing user settings:", err);
    } finally {
      setIsCompletenessLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    profileCompleteness,
    isCompletenessLoading,
    completenessError,
    authError,
    signIn,
    signOut,
    forceUserSync,
    refreshUserSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  }
  return context;
};
