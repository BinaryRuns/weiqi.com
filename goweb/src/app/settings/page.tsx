import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="w-full mx-auto max-w-screen-xl h-screen bg-background text-foreground p-8">
      <Card className="p-6 bg-card">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6 flex flex-wrap gap-2">
            <TabsTrigger value="profile">Profile & Account</TabsTrigger>
            <TabsTrigger value="game">Game Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="matchmaking">Matchmaking</TabsTrigger>
            <TabsTrigger value="display">Display & Accessibility</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          {/* Profile & Account */}
          <TabsContent value="profile">
            <h3 className="text-xl font-semibold mb-4">
              Profile & Account Settings
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="block mb-1">
                  Username
                </Label>
                <Input id="username" placeholder="Your username" />
              </div>
              <div>
                <Label htmlFor="email" className="block mb-1">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="password" className="block mb-1">
                  Password
                </Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label htmlFor="avatar" className="block mb-1">
                  Avatar URL
                </Label>
                <Input id="avatar" placeholder="Link to your avatar" />
              </div>
              <div>
                <Label htmlFor="bio" className="block mb-1">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
              <Button>Update Profile</Button>
            </div>
          </TabsContent>

          {/* Game Preferences */}
          <TabsContent value="game">
            <h3 className="text-xl font-semibold mb-4">Game Preferences</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="boardTheme" className="block mb-1">
                  Board Theme
                </Label>
                <Select>
                  <SelectTrigger id="boardTheme" className="w-full">
                    <span>Select board theme</span>
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
                <Select>
                  <SelectTrigger id="stoneTheme" className="w-full">
                    <span>Select stone theme</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="colorful">Colorful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-3">
                <Label htmlFor="soundSettings">Sound Effects</Label>
                <Switch id="soundSettings" />
              </div>
              <div>
                <Label htmlFor="timeControl" className="block mb-1">
                  Default Time Control
                </Label>
                <Input id="timeControl" placeholder="e.g., Byo-yomi, Fischer" />
              </div>
              <div className="flex items-center space-x-3">
                <Label htmlFor="aiAssistance">AI / Move Suggestions</Label>
                <Switch id="aiAssistance" />
              </div>
              <Button>Save Game Settings</Button>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <h3 className="text-xl font-semibold mb-4">
              Notification Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch id="emailNotifications" />
              </div>
              <div className="flex items-center space-x-3">
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <Switch id="smsNotifications" />
              </div>
              <div className="flex items-center space-x-3">
                <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                <Switch id="inAppNotifications" />
              </div>
              <Button>Update Notification Settings</Button>
            </div>
          </TabsContent>

          {/* Matchmaking */}
          <TabsContent value="matchmaking">
            <h3 className="text-xl font-semibold mb-4">Matchmaking Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Label htmlFor="displayRatings">Display Ratings Publicly</Label>
                <Switch id="displayRatings" />
              </div>
              <div>
                <Label htmlFor="matchFilters" className="block mb-1">
                  Matchmaking Filters
                </Label>
                <Input
                  id="matchFilters"
                  placeholder="e.g., Skill level, game type, region"
                />
              </div>
              <Button>Save Matchmaking Settings</Button>
            </div>
          </TabsContent>

          {/* Display & Accessibility */}
          <TabsContent value="display">
            <h3 className="text-xl font-semibold mb-4">
              Display & Accessibility Settings
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme" className="block mb-1">
                  Theme
                </Label>
                <Select>
                  <SelectTrigger id="theme" className="w-full">
                    <span>Select theme</span>
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
                <Select>
                  <SelectTrigger id="fontSize" className="w-full">
                    <span>Select font size</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accessibility" className="block mb-1">
                  Accessibility Options
                </Label>
                <Input id="accessibility" placeholder="e.g., high contrast" />
              </div>
              <div>
                <Label htmlFor="language" className="block mb-1">
                  Language
                </Label>
                <Select>
                  <SelectTrigger id="language" className="w-full">
                    <span>Select language</span>
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
                <Input id="timezone" placeholder="Select time zone" />
              </div>
              <Button>Update Display Settings</Button>
            </div>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy">
            <h3 className="text-xl font-semibold mb-4">
              Privacy & Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                <Switch id="twoFactor" />
              </div>
              <div className="flex items-center space-x-3">
                <Label htmlFor="loginAlerts">Login Alerts</Label>
                <Switch id="loginAlerts" />
              </div>
              <div>
                <Label htmlFor="blockedUsers" className="block mb-1">
                  Blocked Users
                </Label>
                <Input
                  id="blockedUsers"
                  placeholder="Manage your blocked list"
                />
              </div>
              <div>
                <Label htmlFor="dataExport" className="block mb-1">
                  Data Export
                </Label>
                <Button id="dataExport" variant="outline">
                  Export Data
                </Button>
              </div>
              <div>
                <Label htmlFor="deleteAccount" className="block mb-1">
                  Delete Account
                </Label>
                <Button id="deleteAccount" variant="destructive">
                  Delete Account
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Options */}
          <TabsContent value="advanced">
            <h3 className="text-xl font-semibold mb-4">
              Advanced & Developer Options
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gameHistory" className="block mb-1">
                  Game History
                </Label>
                <Input
                  id="gameHistory"
                  placeholder="View or download your game data"
                />
              </div>
              <div>
                <Label htmlFor="apiKey" className="block mb-1">
                  API Integration
                </Label>
                <Input id="apiKey" placeholder="Manage your API keys" />
              </div>
              <div className="flex items-center space-x-3">
                <Label htmlFor="betaFeatures">Experimental Features</Label>
                <Switch id="betaFeatures" />
              </div>
              <Button>Save Advanced Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
