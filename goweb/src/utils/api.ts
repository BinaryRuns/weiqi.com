import { supabase } from "@/lib/supabase";

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get the current session from Supabase
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  
  // If no session, throw error
  if (!accessToken) {
    throw new Error("No active session found. Please log in.");
  }

  console.log("Fetching with token:", accessToken.substring(0, 15) + "...");
  
  const response = await fetch(url, {
    ...options,
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Log the response for debugging
  console.log("Response status:", response.status);
  
  if (response.status === 401) {
    // Attempt to refresh the session with Supabase
    const { data: refreshData, error } = await supabase.auth.refreshSession();

    if (!error && refreshData.session) {
      const newAccessToken = refreshData.session.access_token;

      console.log("Retrying with refreshed token:", newAccessToken.substring(0, 15) + "...");
      
      // Retry the original request with the new token
      return fetch(url, {
        ...options,
        mode: 'cors',
        credentials: 'include',
        headers: {
          ...(options.headers || {}),
          'Authorization': `Bearer ${newAccessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    } else {
      // Refresh token is invalid or expired
      throw new Error("Unauthorized. Please log in again.");
    }
  }

  return response;
};
