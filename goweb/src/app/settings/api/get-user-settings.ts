import { fetchWithAuth } from "@/utils/api";
import { UserSettingsDto } from "../page";

// Implement ZOD in the future

export const fetchUserSettings = async (
  userId: string
): Promise<UserSettingsDto> => {
  try {
    const response = await fetchWithAuth(`/api/user/settings/${userId}`);
    if (!response.ok) {
      console.error(
        `Failed to fetch settings: ${response.status} ${response.statusText}`
      );
      throw new Error(
        `Failed to fetch user settings: ${response.status} ${response.statusText}`
      );
    }
    const data: UserSettingsDto = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching user settings:", err);
    throw err;
  }
};
