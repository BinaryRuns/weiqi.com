"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserSettingsDto } from "../page";

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
  return (
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
  );
};

export default ProfileSettings;
