"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserSettingsDto } from "../page";

interface DisplaySettingsProps {
  settings: UserSettingsDto;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (id: keyof UserSettingsDto, value: string) => void;
  onUpdate: () => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  settings,
  onInputChange,
  onSelectChange,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="theme" className="block mb-1">
          Theme
        </Label>
        <Select
          value={settings.theme}
          onValueChange={(val) => onSelectChange("theme", val)}
        >
          <SelectTrigger id="theme" className="w-full">
            <span>{settings.theme || "Select theme"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="fontSize" className="block mb-1">
          Font Size
        </Label>
        <Select
          value={settings.fontSize}
          onValueChange={(val) => onSelectChange("fontSize", val)}
        >
          <SelectTrigger id="fontSize" className="w-full">
            <span>{settings.fontSize || "Select font size"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="small">Small</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="accessibilityOptions" className="block mb-1">
          Accessibility Options
        </Label>
        <Input
          id="accessibilityOptions"
          value={settings.accessibilityOptions}
          onChange={onInputChange}
          placeholder="e.g., high contrast"
        />
      </div>
      <div>
        <Label htmlFor="language" className="block mb-1">
          Language
        </Label>
        <Select
          value={settings.language}
          onValueChange={(val) => onSelectChange("language", val)}
        >
          <SelectTrigger id="language" className="w-full">
            <span>{settings.language || "Select language"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="timezone" className="block mb-1">
          Time Zone
        </Label>
        <Input
          id="timezone"
          value={settings.timezone}
          onChange={onInputChange}
          placeholder="Select time zone"
        />
      </div>
      <Button onClick={onUpdate}>Update Display Settings</Button>
    </div>
  );
};

export default DisplaySettings;
