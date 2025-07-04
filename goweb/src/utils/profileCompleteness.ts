/**
 * Utility functions for calculating profile completeness
 */

/**
 * Field definition for profile completeness calculation
 */
export interface ProfileField {
  name: string;
  value: string | null | undefined;
  weight: number;
  message?: string;
}

/**
 * Calculate the profile completeness percentage based on field values
 * @param fields Array of profile fields with their values and weights
 * @returns A number between 0-100 representing completeness percentage
 */
export function calculateProfileCompleteness(fields: ProfileField[]): number {
  const completedWeight = fields.reduce((total, field) => {
    return (
      total + (field.value && field.value.trim() !== "" ? field.weight : 0)
    );
  }, 0);

  return completedWeight;
}

/**
 * Get incomplete fields for providing suggestions to users
 * @param fields Array of profile fields with their values, weights and messages
 * @returns Array of incomplete fields
 */
export function getIncompleteFields(fields: ProfileField[]): ProfileField[] {
  return fields.filter((field) => !field.value || field.value.trim() === "");
}

/**
 * Standard profile fields used for completeness calculation
 * @param userData User data object containing profile fields
 * @returns Array of profile fields with weights and messages
 */
export function getStandardProfileFields(userData: {
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
}): ProfileField[] {
  return [
    {
      name: "Username",
      value: userData.username,
      weight: 20,
      message: "Add a username to personalize your profile",
    },
    {
      name: "Email",
      value: userData.email,
      weight: 20,
      message: "Verify your email address",
    },
    {
      name: "Avatar",
      value: userData.avatarUrl,
      weight: 30,
      message: "Add a profile picture to make your profile more recognizable",
    },
    {
      name: "Bio",
      value: userData.bio,
      weight: 30,
      message: "Write a short bio to tell others about yourself",
    },
  ];
}
