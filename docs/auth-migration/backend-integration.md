# Supabase Auth Backend Integration

This guide describes how to integrate Supabase authentication with the Spring Boot backend.

## Overview

The integration allows the Spring Boot backend to:

1. Validate Supabase JWT tokens sent from the frontend
2. Extract user information from these tokens
3. Provide authentication for REST API endpoints
4. Authenticate WebSocket connections

## Configuration Steps

### 1. Set Supabase JWT Secret

You need to configure your Spring Boot application with the Supabase JWT secret.

1. Add the following property to your `.env` file:
   ```
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
   ```
   
2. Get your JWT secret from your Supabase project:
   - Go to your Supabase dashboard
   - Navigate to Settings > API
   - Find JWT Secret under "Project API keys" section
   - Copy the JWT Secret value

### 2. Component Overview

The integration consists of the following components:

1. **SupabaseAuthService**: Validates Supabase JWT tokens and extracts user information
2. **SupabaseAuthenticationFilter**: Intercepts HTTP requests and authenticates users
3. **UserInterceptor**: Handles WebSocket authentication
4. **SecurityConfig**: Configures Spring Security to use Supabase authentication

### 3. Frontend Integration

The frontend needs to:

1. Include the Supabase access token in all API requests as a Bearer token
2. Pass the access token in WebSocket connections

Example API call:
```typescript
const response = await fetchWithAuth('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

WebSocket connection:
```typescript
const socket = new SockJS(`/ws?token=${accessToken}`);
```

## Token Structure

Supabase tokens have the following important claims:

- `sub`: The user ID
- `aud`: Should be "authenticated" for valid user tokens
- `exp`: Token expiration time
- `email`: User's email address
- `role`: Usually "authenticated"

## Troubleshooting

Common issues:

1. **401 Unauthorized errors**: 
   - Check that the JWT secret in your application matches the one in Supabase
   - Verify the token hasn't expired
   - Check that the audience claim is "authenticated"

2. **WebSocket connection issues**:
   - Ensure the token is correctly passed in the URL parameters
   - Check WebSocket logs for authentication errors

3. **Missing user information**:
   - Supabase JWT tokens include user information in the claims, verify that your service is extracting this information correctly

## Extending the Authentication System

To add additional features:

1. **Role-based access control**:
   - Extract custom claims from the JWT payload
   - Map them to Spring Security authorities

2. **User synchronization**:
   - Create a user sync service to keep local user records in sync with Supabase

3. **Token refresh handling**:
   - The frontend should handle token refreshing before expiry
   - The `fetchWithAuth` utility already handles this but may need additional error handling 