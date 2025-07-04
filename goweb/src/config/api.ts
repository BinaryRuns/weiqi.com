/**
 * API Configuration
 *
 * This file centralizes all API-related configuration and environment variables.
 * Always use these constants instead of hardcoding URLs in the application.
 */

// API URL for REST endpoints
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// WebSocket URL for real-time communication
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8081/ws";

// Helper function to build API URLs
export const buildApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};

// Helper function to build WebSocket URLs
export const buildWsUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${WS_URL}/${cleanPath}`;
};
