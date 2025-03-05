"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { fetchUserSettings } from "./api/get-user-settings";
import { updateUserSettings } from "./api/update-user-settings";

import ProfileSettings from "./components/ProfileSettings";
import GamePreferences from "./components/GamePreferences";
import NotificationSettings from "./components/NotiflicationSettings";
import MatchmakingSettings from "./components/MatchmakingSettings";
import DisplaySettings from "./components/DisplaySettings";
import PrivacySettings from "./components/PrivacySettings";
import AdvancedSettings from "./components/AdvancedSettings";
import toast from "react-hot-toast";

export interface UserSettingsDto {
  // Profile & Account
  username: string;
  email: string;
  password: string;
  // UserSettingsEntity
  avatarUrl: string;
  bio: string;
  // Game Preferences
  boardTheme: string;
  stoneTheme: string;
  soundEffects: boolean;
  timeControl: string;
  aiAssistance: boolean;
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  // Matchmaking Settings
  displayRatings: boolean;
  matchmakingFilters: string;
  // Display & Accessibility Settings
  theme: string;
  fontSize: string;
  accessibilityOptions: string;
  language: string;
  timezone: string;
  // Privacy & Security Settings
  twoFactor: boolean;
  loginAlerts: boolean;
  blockedUsers: string;
  // Advanced Settings
  gameHistory: string;
  apiKey: string;
  betaFeatures: boolean;
}

const SettingsPage: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [settings, setSettings] = useState<UserSettingsDto | null>(null);
  const [originalSettings, setOriginalSettings] =
    useState<UserSettingsDto | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string>("");

  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      try {
        const settingsData = await fetchUserSettings(userId);
        if (settingsData) {
          setSettings(settingsData);
          setOriginalSettings(settingsData);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    loadSettings();
  }, [userId]);

  // Handlers for updating settings
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!settings) return;
    const { id, value } = e.target;
    setSettings({
      ...settings,
      [id]: value,
    });
  };

  const hasChanges = useMemo(() => {
    // Simple shallow comparison. For deep objects, consider using a deep comparison method.
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  const handleSwitchChange = (id: keyof UserSettingsDto, checked: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [id]: checked,
    });
  };

  const handleSelectChange = (id: keyof UserSettingsDto, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [id]: value,
    });
  };

  const handleUpdate = async () => {
    if (!userId || !settings) return;
    if (!hasChanges) {
      toast("No changes to update.", { icon: "ℹ️" });
      return;
    }
    try {
      await updateUserSettings(userId, settings);
      setUpdateMessage("Settings updated successfully!");
      toast.success("Settings updated successfully!");
    } catch (err) {
      console.error(err);
      setUpdateMessage("Error updating settings.");
      toast.error("Error updating settings.");
    }
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="w-full mx-auto max-w-screen-xl h-screen bg-background text-foreground p-8">
      <Card className="p-6 bg-card">
        {updateMessage && <p>{updateMessage}</p>}
        <Tabs defaultValue="profile">
          <div className="overflow-x-auto">
            <TabsList className="flex gap-2 whitespace-nowrap px-2">
              <TabsTrigger value="profile">Profile & Account</TabsTrigger>
              <TabsTrigger value="game">Game Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="matchmaking">Matchmaking</TabsTrigger>
              <TabsTrigger value="display">Display & Accessibility</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            <ProfileSettings
              settings={settings}
              onChange={handleInputChange}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="game">
            <GamePreferences
              settings={settings}
              onChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onSwitchChange={handleSwitchChange}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings
              settings={settings}
              onSwitchChange={handleSwitchChange}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="matchmaking">
            <MatchmakingSettings
              settings={settings}
              onInputChange={handleInputChange}
              onSwitchChange={handleSwitchChange}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="display">
            <DisplaySettings
              settings={settings}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacySettings
              settings={settings}
              onInputChange={handleInputChange}
              onSwitchChange={handleSwitchChange}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedSettings
              settings={settings}
              onInputChange={handleInputChange}
              onSwitchChange={handleSwitchChange}
              onUpdate={handleUpdate}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPage;
