"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ProfileCompletenessIndicator() {
  const {
    user,
    profileCompleteness,
    isCompletenessLoading,
    completenessError,
  } = useSupabaseAuth();

  // Show loading state from the context
  if (isCompletenessLoading) {
    return (
      <div className="w-full mt-2">
        <div className="flex justify-between items-center text-xs mb-1">
          <span>Profile</span>
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-1 w-full" />
      </div>
    );
  }

  // Show error state from the context
  if (completenessError) {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load profile details</AlertDescription>
      </Alert>
    );
  }

  // Don't render anything if there is no user, or if the profile is already complete.
  if (!user || profileCompleteness >= 100) {
    return null;
  }

  // Render the indicator with the data from the context
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between items-center text-xs mb-1">
        <span>Profile</span>
        <span>{profileCompleteness}%</span>
      </div>
      <Progress value={profileCompleteness} className="h-1" />
    </div>
  );
}
