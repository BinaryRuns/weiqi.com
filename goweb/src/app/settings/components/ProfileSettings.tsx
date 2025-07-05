"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserSettingsDto } from "../page";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  calculateProfileCompleteness,
  getIncompleteFields,
  getStandardProfileFields,
} from "@/utils/profileCompleteness";

interface ProfileSettingsProps {
  settings: UserSettingsDto;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onUpdate: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  settings,
  onChange,
  onUpdate,
}) => {
  // Get profile fields and calculate completeness
  const profileFields = useMemo(
    () => getStandardProfileFields(settings),
    [settings]
  );

  const profileCompleteness = useMemo(
    () => calculateProfileCompleteness(profileFields),
    [profileFields]
  );

  // Get incomplete fields for suggestions
  const incompleteFields = useMemo(
    () => getIncompleteFields(profileFields),
    [profileFields]
  );

  return (
    <div className="space-y-6">
      {/* Profile Completeness Section */}
      <Card className="p-4 bg-card/50">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Profile Completeness</h3>
            <span className="text-sm font-medium">{profileCompleteness}%</span>
          </div>
          <Progress value={profileCompleteness} className="h-2" />
        </div>

        {profileCompleteness < 100 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Complete your profile to enhance your experience:
            </p>
            <ul className="space-y-1">
              {incompleteFields.map((field, index) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>{field.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {profileCompleteness === 100 && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>Your profile is complete!</span>
          </div>
        )}
      </Card>

      {/* Profile Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="username" className="block mb-1">
            Username
          </Label>
          <Input
            id="username"
            value={settings.username}
            onChange={onChange}
            placeholder="Your username"
          />
        </div>
        <div>
          <Label htmlFor="email" className="block mb-1">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={onChange}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password" className="block mb-1">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={""}
            onChange={onChange}
            placeholder="••••••••"
          />
        </div>
        <div>
          <Label htmlFor="avatarUrl" className="block mb-1">
            Avatar URL
          </Label>
          <Input
            id="avatarUrl"
            value={settings.avatarUrl}
            onChange={onChange}
            placeholder="Link to your avatar"
          />
        </div>
        <div>
          <Label htmlFor="bio" className="block mb-1">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={settings.bio}
            onChange={onChange}
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>
        <Button onClick={onUpdate}>Update Profile</Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
