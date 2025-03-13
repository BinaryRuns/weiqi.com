"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UserSettingsDto } from "../page";

interface MatchmakingSettingsProps {
  settings: UserSettingsDto;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (id: keyof UserSettingsDto, checked: boolean) => void;
  onUpdate: () => void;
}

const MatchmakingSettings: React.FC<MatchmakingSettingsProps> = ({
  settings,
  onInputChange,
  onSwitchChange,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Label htmlFor="displayRatings">Display Ratings Publicly</Label>
        <Switch
          id="displayRatings"
          checked={settings.displayRatings}
          onCheckedChange={(checked) =>
            onSwitchChange("displayRatings", checked)
          }
        />
      </div>
      <div>
        <Label htmlFor="matchmakingFilters" className="block mb-1">
          Matchmaking Filters
        </Label>
        <Input
          id="matchmakingFilters"
          value={settings.matchmakingFilters}
          onChange={onInputChange}
          placeholder="e.g., Skill level, game type, region"
        />
      </div>
      <Button onClick={onUpdate}>Save Matchmaking Settings</Button>
    </div>
  );
};

export default MatchmakingSettings;
