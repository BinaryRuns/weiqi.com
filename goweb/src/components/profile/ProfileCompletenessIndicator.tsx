"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { fetchUserSettings } from "@/app/settings/api/get-user-settings";
import {
  calculateProfileCompleteness,
  getStandardProfileFields,
} from "@/utils/profileCompleteness";

export function ProfileCompletenessIndicator() {
  const { user } = useSupabaseAuth();
  const [completeness, setCompleteness] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the component to prevent unnecessary re-renders
  const indicator = useMemo(
    () => (
      <div className="w-full mt-2">
        <div className="flex justify-between items-center text-xs mb-1">
          <span>Profile</span>
          <span>{completeness}%</span>
        </div>
        <Progress value={completeness} className="h-1" />
      </div>
    ),
    [completeness]
  );

  useEffect(() => {
    if (!user?.id) return;

    const loadProfileCompleteness = async () => {
      try {
        setIsLoading(true);
        const settings = await fetchUserSettings(user.id);

        if (settings) {
          // Use utility functions to calculate profile completeness
          const profileFields = getStandardProfileFields(settings);
          const completeness = calculateProfileCompleteness(profileFields);

          setCompleteness(completeness);
        } else {
          // If no settings returned, default to 0% complete
          setCompleteness(0);
        }
      } catch (error) {
        console.error("Error loading profile completeness:", error);
        // Don't show error, just default to 0% complete
        setCompleteness(0);
        setError(
          error instanceof Error
            ? error
            : new Error("Failed to load profile data")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileCompleteness();
  }, [user?.id]);

  // Don't render anything if loading, no user, or there was an error
  if (isLoading || !user || error) return null;

  return indicator;
}
