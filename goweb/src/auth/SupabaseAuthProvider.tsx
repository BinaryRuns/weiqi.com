"use client";

import { createContext, useContext, useEffect, useState } from 'react';
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

// Auth provider component
export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize the auth state when the component mounts
  useEffect(() => {
    const setData = async () => {
      // Get the current session and user
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
        }
      );

      setLoading(false);

      // Cleanup the subscription
      return () => {
        subscription.unsubscribe();
      };
    };

    setData();
  }, []);

  // Social sign-in handlers
  const signIn = async (provider: AuthProvider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Error signing in:', error);
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      // Redirect to home page
      router.push('/');
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

// Custom hook to use the auth context
export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}; 