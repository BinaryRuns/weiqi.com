"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UserSettingsDto } from "../page";

interface PrivacySettingsProps {
  settings: UserSettingsDto;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (id: keyof UserSettingsDto, checked: boolean) => void;
  onUpdate: () => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  settings,
  onInputChange,
  onSwitchChange,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
        <Switch
          id="twoFactor"
          checked={settings.twoFactor}
          onCheckedChange={(checked) => onSwitchChange("twoFactor", checked)}
        />
      </div>
      <div className="flex items-center space-x-3">
        <Label htmlFor="loginAlerts">Login Alerts</Label>
        <Switch
          id="loginAlerts"
          checked={settings.loginAlerts}
          onCheckedChange={(checked) => onSwitchChange("loginAlerts", checked)}
        />
      </div>
      <div>
        <Label htmlFor="blockedUsers" className="block mb-1">
          Blocked Users
        </Label>
        <Input
          id="blockedUsers"
          value={settings.blockedUsers}
          onChange={onInputChange}
          placeholder="Manage your blocked list"
        />
      </div>
      <Button onClick={onUpdate}>Update Privacy Settings</Button>
    </div>
  );
};

export default PrivacySettings;
