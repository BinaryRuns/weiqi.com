import { fetchWithAuth } from "@/utils/api";
import { UserSettingsDto } from "../page";

// Implement ZOD in the future

export const fetchUserSettings = async (
  userId: string
): Promise<UserSettingsDto | undefined> => {
  try {
    const response = await fetchWithAuth(`/api/user/settings/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch settings");
    const data: UserSettingsDto = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};
