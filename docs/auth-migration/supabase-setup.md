# Supabase Auth Setup Guide

## 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com/) and sign in
2. Click "New Project"
3. Enter project details:
   - Name: `weiqi-auth`
   - Database Password: Generate and save a strong password
   - Region: Choose closest to your users
4. Click "Create new project"

## 2. Configure Authentication

### Enable Auth Providers

1. Go to Authentication > Providers
2. Configure Email Auth:
   - Ensure "Email" provider is enabled
   - Configure SMTP settings for production (optional for development)
   - Enable "Confirm email" for security

3. Configure OAuth Providers:
   - Enable Google:
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Create OAuth Client ID
     - Add redirect URL: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
     - Copy Client ID and Secret to Supabase

   - Enable GitHub:
     - Go to [GitHub Developer Settings](https://github.com/settings/developers)
     - Create OAuth App
     - Add callback URL: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
     - Copy Client ID and Secret to Supabase

### Configure JWT Settings

1. Go to Authentication > URL Configuration
2. Set Site URL to your frontend URL
3. Add allowed redirect URLs

### Configure User Fields

1. Go to Authentication > Users
2. Add custom user metadata schema to match current user model:
   - `skill_level`: to store the user's Go/Weiqi skill level
   - Any other custom fields needed

## 3. Setup Database Schema

1. Go to Table Editor
2. Create a new table `user_profiles` with:
   - `id`: uuid references auth.users.id
   - `username`: text, unique
   - `skill_level`: text
   - `created_at`: timestamp with time zone

3. Create RLS (Row Level Security) policies:
   - Allow users to read all profiles
   - Allow users to update only their own profile

## 4. Save Project API Keys

1. Go to Project Settings > API
2. Save the following:
   - Project URL
   - API Key (anon public)
   - JWT Secret (for backend verification)

## 5. Test Authentication Flow

1. Go to Authentication > Users
2. Create a test user through the Supabase UI
3. Verify the user appears in the users list
4. Test login with the created user

## Notes and Considerations

- **JWT expiration**: Default is 3600 seconds (1 hour). Consider if this needs adjustment.
- **Email templates**: Customize email templates for your brand in production.
- **Security settings**: Review and adjust according to your needs.
- **RLS policies**: Ensure proper security policies are in place before going live. 