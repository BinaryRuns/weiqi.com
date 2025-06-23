# Authentication System

This directory contains the authentication system for the application.

## Overview

The authentication system is built on top of Supabase Auth and is designed to be modular and extensible.
It allows for easy addition of new OAuth providers with minimal code changes.

## How to Add a New Authentication Provider

To add a new authentication provider, follow these steps:

### Step 1: Set up the provider in Supabase

1. Log in to your Supabase dashboard
2. Go to Authentication > Providers
3. Enable the provider you want to add
4. Configure the provider settings (Client ID, Secret, etc.)

### Step 2: Update the AuthProvider type

In `components/login/AuthProviderButton.tsx`, add your new provider to the `AuthProvider` type:

```typescript
export type AuthProvider = 'google' | 'github' | 'discord' | 'twitter' | 'apple' | 'your-new-provider';
```

### Step 3: Add provider configuration

In `lib/auth/providers.tsx`, add a new provider configuration:

```typescript
import { FaYourProviderIcon } from "react-icons/fa"; // Import the appropriate icon

export const yourProviderConfig: ProviderConfig = {
  id: 'your-new-provider',
  name: 'Provider Name',
  icon: <FaYourProviderIcon className="h-5 w-5" />,
  className: "bg-[#brandColor] text-white hover:bg-[#hoverColor]" // Optional custom styles
};

// Add to the availableProviders object
export const availableProviders = {
  // ...existing providers
  yourProvider: yourProviderConfig
};
```

### Step 4: Use the provider in your components

```tsx
import { AuthProviderButton } from "@/components/login/AuthProviderButton";
import { yourProviderConfig } from "@/lib/auth/providers";

// In your component:
<AuthProviderButton provider={yourProviderConfig} fullWidth />
```

## Architecture

The auth system consists of:

1. **Supabase Client** (`lib/supabase.ts`): Handles the communication with Supabase Auth API.
2. **Auth Provider** (`auth/SupabaseAuthProvider.tsx`): Manages auth state and exposes authentication methods via React Context.
3. **Provider Configurations** (`lib/auth/providers.tsx`): Contains configs for all supported authentication providers.
4. **Auth Provider Button** (`components/login/AuthProviderButton.tsx`): A reusable component for rendering provider-specific login buttons.
5. **Protected Routes** (`auth/WithAuth.tsx`): HOC for protecting routes that require authentication.

This modular approach makes it easy to:
- Add new providers with minimal code changes
- Maintain a consistent UI across all providers
- Test authentication flows in isolation 