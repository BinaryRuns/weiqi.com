"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/login/AuthProviderButton';

// Create the auth context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define a key for localStorage user sync flag
const getUserSyncKey = (userId: string) => `user_synced_${userId}`;

/**
 * Authentication provider that manages Supabase auth state
 * and ensures users are synced with the backend database
 */
export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to ensure user exists in our backend
  const ensureUserInBackend = async (currentUser: User, token: string) => {
    try {
      if (!currentUser.email) {
        console.error('User has no email, cannot sync with backend');
        return;
      }

      // Prepare user data from Supabase
      const userData = {
        email: currentUser.email,
        username: currentUser.user_metadata?.username || 
                 currentUser.user_metadata?.full_name || 
                 `user_${currentUser.id.substring(0, 8)}`,
        avatarUrl: currentUser.user_metadata?.avatar_url,
        skillLevel: currentUser.user_metadata?.skill_level || 'beginner'
      };

      // Send to our backend
      const syncResponse = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const responseText = await syncResponse.text();
      
      if (!syncResponse.ok) {
        if (syncResponse.status === 409) {
          // Email conflict - user exists with different ID
          try {
            const errorData = JSON.parse(responseText);
            console.warn("User email conflict detected:", errorData);
            return;
          } catch (e) {
            console.error('Failed to parse conflict error response');
          }
        }
        
        console.error('Failed to sync user with backend:', syncResponse.status);
        return;
      }
      
      // Mark user as synced regardless of response parsing success
      localStorage.setItem(getUserSyncKey(currentUser.id), 'true');
    } catch (error) {
      console.error('Error ensuring user in backend:', error);
    }
  };

  // Check if a user has already been synced
  const hasUserBeenSynced = (userId: string) => {
    try {
      return localStorage.getItem(getUserSyncKey(userId)) === 'true';
    } catch (e) {
      return false;
    }
  };

  // Initialize the auth state when the component mounts
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get the current session and user
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Only sync the user if they haven't been synced before
          if (session?.user && !hasUserBeenSynced(session.user.id)) {
            await ensureUserInBackend(session.user, session.access_token);
          }
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted || !session) return;
            
            setSession(session);
            setUser(session?.user ?? null);
            
            // Only sync on sign in or update if not already synced
            const needsSync = ['SIGNED_IN', 'USER_UPDATED'].includes(event);
            if (session?.user && needsSync && !hasUserBeenSynced(session.user.id)) {
              await ensureUserInBackend(session.user, session.access_token);
            }
          }
        );

        if (mounted) {
          setLoading(false);
        }

        // Cleanup the subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
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
      console.error('Error during sign in:', error);
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.push('/');
      } else {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  };

  const value = {
    session,
    user,
    signIn,
    signOut,
    loading,
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
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}; 