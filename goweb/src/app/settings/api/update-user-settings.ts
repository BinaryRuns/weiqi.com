import { fetchWithAuth } from "@/utils/api";
import { UserSettingsDto } from "../page";

// Implement ZOD in the future

export const updateUserSettings = async (
  settings: UserSettingsDto
): Promise<void> => {
  const response = await fetchWithAuth(`/api/user/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }
};
