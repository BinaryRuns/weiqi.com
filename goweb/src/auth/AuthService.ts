export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string | null;
};

export const refreshAccessToken = async (): Promise<RefreshTokenResponse> => {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
};
