# Current Authentication Flow

## Overview
The current authentication system uses a custom JWT-based implementation with Spring Security on the backend and a simple token-based approach on the frontend.

## User Model
The user is represented by the `UserEntity` class with the following key attributes:
- `id`: Auto-incremented primary key
- `userId`: UUID for public identification 
- `username`: Unique username
- `email`: Unique email address
- `passwordHash`: BCrypt hashed password (nullable for OAuth users)
- `skillLevel`: User's skill level in Go/Weiqi
- `createdAt`: Account creation timestamp

## OAuth Integration
OAuth support is implemented for:
- Google
- GitHub

OAuth users are linked via the `UserOAuthEntity` which maps provider IDs to internal users.

## Authentication Flows

### Registration
1. User submits username, email, password
2. Backend validates uniqueness
3. Password is hashed with BCrypt
4. User record is created
5. JWT tokens (access + refresh) are generated and returned

### Login
1. User submits username and password
2. Backend validates credentials
3. JWT tokens (access + refresh) are generated and returned

### OAuth Login
1. User initiates OAuth flow with provider
2. Backend receives provider callback with user info
3. System checks for existing OAuth link
4. If no link exists, system looks for user with matching email
5. If no user exists, a new user is created
6. OAuth link is established
7. JWT tokens are generated and returned

### Token Refresh
1. Frontend sends refresh token
2. Backend validates refresh token
3. New access token and refresh token are generated
4. Tokens are returned to frontend

### Protected Routes
1. Frontend wraps protected components with `withAuth` HOC
2. HOC checks for access token
3. If no token exists, attempts to refresh
4. If refresh fails, redirects to login
5. If token exists, renders protected component

## Token Storage
- Access token is stored in Redux store
- Refresh token is stored in HTTP-only cookie

## JWT Implementation
- Access tokens expire in short time (typically 15min)
- Refresh tokens have longer validity (typically 7 days)
- Tokens contain userId and username claims 