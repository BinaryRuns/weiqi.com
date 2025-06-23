"use client";

import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { ReactElement } from "react";

export type AuthProvider = 'google' | 'github' | 'discord' | 'twitter' | 'apple';

export interface ProviderConfig {
  id: AuthProvider;
  name: string;
  icon: ReactElement;
  className?: string;
}

interface AuthProviderButtonProps {
  provider: ProviderConfig;
  fullWidth?: boolean;
  className?: string;
}

export function AuthProviderButton({
  provider,
  fullWidth = false,
  className = "",
}: AuthProviderButtonProps) {
  const { signIn } = useSupabaseAuth();

  const handleSignIn = async () => {
    try {
      await signIn(provider.id);
    } catch (error) {
      console.error(`Error signing in with ${provider.name}:`, error);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleSignIn}
      className={`${className} ${
        fullWidth ? "w-full" : ""
      } flex items-center gap-2 ${provider.className || ""}`}
    >
      {provider.icon}
      <span>Sign in with {provider.name}</span>
    </Button>
  );
} 