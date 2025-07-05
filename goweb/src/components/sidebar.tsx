"use client";

import {
  GamepadIcon,
  BrainCircuitIcon,
  GraduationCapIcon,
  PlaySquareIcon,
  NewspaperIcon,
  TrophyIcon,
  LogInIcon,
  UserPlusIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { NavItem } from "@/components/layout/nav-item";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { ProfileCompletenessIndicator } from "@/components/profile/ProfileCompletenessIndicator";

const navItems = [
  { href: "/play", label: "Play", icon: GamepadIcon },
  { href: "/puzzles", label: "Puzzles", icon: BrainCircuitIcon },
  { href: "/learn", label: "Learn", icon: GraduationCapIcon },
  { href: "/watch", label: "Watch", icon: PlaySquareIcon },
  { href: "/news", label: "News", icon: NewspaperIcon },
  { href: "/challenges", label: "Challenges", icon: TrophyIcon },
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className = "", isMobile = false }: SidebarProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut } = useSupabaseAuth();

  const handleUserSectionClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogOut = async () => {
    try {
      setIsDropdownOpen(false);
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Use user data from Supabase
  const displayName =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div
      className={`${
        !isMobile ? "w-64 bg-sidebar border-r border-border px-4 py-6" : ""
      } 
        flex flex-col ${className} ${
        isMobile ? "h-[calc(100vh-4rem)]" : "h-full"
      }`}
    >
      {!isMobile && <Logo />}
      <nav className={`space-y-1 flex-1 ${isMobile ? "px-2 py-4" : "mt-8"}`}>
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
      <div
        className={`space-y-3 ${
          isMobile ? "p-4 mb-safe" : "pt-6"
        } border-t border-border`}
      >
        {!user ? (
          <>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/login" className="gap-3">
                <LogInIcon className="w-4 h-4" />
                Log In
              </Link>
            </Button>
            <Button asChild className="w-full justify-start">
              <Link href="/register" className="gap-3">
                <UserPlusIcon className="w-4 h-4" />
                Sign Up
              </Link>
            </Button>
          </>
        ) : (
          <div className="relative">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleUserSectionClick}
            >
              <Avatar>
                <AvatarImage
                  src={avatarUrl || "https://example.com/user-avatar.jpg"}
                  alt="User Avatar"
                />
                <AvatarFallback>
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate overflow-hidden whitespace-nowrap">
                {displayName}
              </span>
            </div>

            {/* Profile Completeness Indicator */}
            <ProfileCompletenessIndicator />
            {isDropdownOpen && (
              <div className="absolute bottom-full mb-2 p-3 w-48 bg-darkcard border border-border rounded-lg shadow-lg">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/settings")}
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full mt-2 justify-start"
                  onClick={handleLogOut}
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
