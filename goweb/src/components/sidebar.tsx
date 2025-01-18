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
import { useDispatch, useSelector } from "react-redux";
import { clearAccessToken } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { useState } from "react";

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
  const dispatch = useDispatch();
  const router = useRouter();
  const { accessToken, userName } = useSelector(
    (state: RootState) => state.auth
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleUserSectionClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        dispatch(clearAccessToken());
        setIsDropdownOpen(false);
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div
      className={`${!isMobile ? 'w-64 bg-sidebar border-r border-border px-4 py-6' : ''} 
        flex flex-col ${className} ${isMobile ? 'h-[calc(100vh-4rem)]' : 'h-full'}`}
    >
      {!isMobile && <Logo />}
      <nav className={`space-y-1 flex-1 ${isMobile ? 'px-2 py-4' : 'mt-8'}`}>
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
      <div className={`space-y-3 ${isMobile ? 'p-4 mb-safe' : 'pt-6'} border-t border-border`}>
        {!accessToken ? (
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
                  src="https://example.com/user-avatar.jpg"
                  alt="User Avatar"
                />
                <AvatarFallback>UA</AvatarFallback>
              </Avatar>
              <span className="font-medium">{userName || "User"}</span>
            </div>
            {isDropdownOpen && (
              <div className="absolute bottom-full mb-2 p-3 w-48 bg-darkcard border border-border rounded-lg shadow-lg">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => console.log("Settings clicked")}
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