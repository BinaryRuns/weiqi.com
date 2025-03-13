"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UserSettingsDto } from "../page";

interface NotificationSettingsProps {
  settings: UserSettingsDto;
  onSwitchChange: (id: keyof UserSettingsDto, checked: boolean) => void;
  onUpdate: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSwitchChange,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Label htmlFor="emailNotifications">Email Notifications</Label>
        <Switch
          id="emailNotifications"
          checked={settings.emailNotifications}
          onCheckedChange={(checked) =>
            onSwitchChange("emailNotifications", checked)
          }
        />
      </div>
      <div className="flex items-center space-x-3">
        <Label htmlFor="smsNotifications">SMS Notifications</Label>
        <Switch
          id="smsNotifications"
          checked={settings.smsNotifications}
          onCheckedChange={(checked) =>
            onSwitchChange("smsNotifications", checked)
          }
        />
      </div>
      <div className="flex items-center space-x-3">
        <Label htmlFor="inAppNotifications">In-App Notifications</Label>
        <Switch
          id="inAppNotifications"
          checked={settings.inAppNotifications}
          onCheckedChange={(checked) =>
            onSwitchChange("inAppNotifications", checked)
          }
        />
      </div>
      <Button onClick={onUpdate}>Update Notification Settings</Button>
    </div>
  );
};

export default NotificationSettings;
