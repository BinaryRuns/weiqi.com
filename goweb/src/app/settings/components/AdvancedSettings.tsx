"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UserSettingsDto } from "../page";

interface AdvancedSettingsProps {
  settings: UserSettingsDto;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (id: keyof UserSettingsDto, checked: boolean) => void;
  onUpdate: () => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  settings,
  onInputChange,
  onSwitchChange,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="gameHistory" className="block mb-1">
          Game History
        </Label>
        <Input
          id="gameHistory"
          value={settings.gameHistory}
          onChange={onInputChange}
          placeholder="View or download your game data"
        />
      </div>
      <div>
        <Label htmlFor="apiKey" className="block mb-1">
          API Integration
        </Label>
        <Input
          id="apiKey"
          value={settings.apiKey}
          onChange={onInputChange}
          placeholder="Manage your API keys"
        />
      </div>
      <div className="flex items-center space-x-3">
        <Label htmlFor="betaFeatures">Experimental Features</Label>
        <Switch
          id="betaFeatures"
          checked={settings.betaFeatures}
          onCheckedChange={(checked) => onSwitchChange("betaFeatures", checked)}
        />
      </div>
      <Button onClick={onUpdate}>Save Advanced Settings</Button>
    </div>
  );
};

export default AdvancedSettings;
