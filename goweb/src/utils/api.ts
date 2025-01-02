import { store } from "@/store/store";
import { setAccessToken, clearAccessToken } from "@/store/authSlice";
import { useRouter } from "next/navigation";

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = store.getState().auth.accessToken;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Attempt to refresh the token
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      accessToken = refreshData.accessToken;

      // Update Redux store with the new access token
      if (accessToken) {
        store.dispatch(setAccessToken(accessToken));
      } else {
        store.dispatch(clearAccessToken());
      }

      // Retry the original request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } else {
      // Refresh token is invalid or expired
      store.dispatch(clearAccessToken());
      // router.push("/login");
      throw new Error("Unauthorized. Please log in again.");
    }
  }

  return response;
};
