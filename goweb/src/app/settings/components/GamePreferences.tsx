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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UserSettingsDto } from "../page";

interface GamePreferencesProps {
  settings: UserSettingsDto;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (id: keyof UserSettingsDto, value: string) => void;
  onSwitchChange: (id: keyof UserSettingsDto, checked: boolean) => void;
  onUpdate: () => void;
}

const GamePreferences: React.FC<GamePreferencesProps> = ({
  settings,
  onChange,
  onSelectChange,
  onSwitchChange,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="boardTheme" className="block mb-1">
          Board Theme
        </Label>
        <Select
          value={settings.boardTheme}
          onValueChange={(val) => onSelectChange("boardTheme", val)}
        >
          <SelectTrigger id="boardTheme" className="w-full">
            <span>{settings.boardTheme || "Select board theme"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="wood">Wood</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="stoneTheme" className="block mb-1">
          Stone Theme
        </Label>
        <Select
          value={settings.stoneTheme}
          onValueChange={(val) => onSelectChange("stoneTheme", val)}
        >
          <SelectTrigger id="stoneTheme" className="w-full">
            <span>{settings.stoneTheme || "Select stone theme"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="traditional">Traditional</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="colorful">Colorful</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-3">
        <Label htmlFor="soundEffects">Sound Effects</Label>
        <Switch
          id="soundEffects"
          checked={settings.soundEffects}
          onCheckedChange={(checked) => onSwitchChange("soundEffects", checked)}
        />
      </div>
      <div>
        <Label htmlFor="timeControl" className="block mb-1">
          Default Time Control
        </Label>
        <Input
          id="timeControl"
          value={settings.timeControl}
          onChange={onChange}
          placeholder="e.g., Byo-yomi, Fischer"
        />
      </div>
      <div className="flex items-center space-x-3">
        <Label htmlFor="aiAssistance">AI / Move Suggestions</Label>
        <Switch
          id="aiAssistance"
          checked={settings.aiAssistance}
          onCheckedChange={(checked) => onSwitchChange("aiAssistance", checked)}
        />
      </div>
      <Button onClick={onUpdate}>Save Game Settings</Button>
    </div>
  );
};

export default GamePreferences;
