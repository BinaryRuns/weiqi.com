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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { NavItem } from "@/components/layout/nav-item";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const navItems = [
  { href: "/play", label: "Play", icon: GamepadIcon },
  { href: "/puzzles", label: "Puzzles", icon: BrainCircuitIcon },
  { href: "/learn", label: "Learn", icon: GraduationCapIcon },
  { href: "/watch", label: "Watch", icon: PlaySquareIcon },
  { href: "/news", label: "News", icon: NewspaperIcon },
  { href: "/challenges", label: "Challenges", icon: TrophyIcon },
];

export function Sidebar({ className = "" }: { className?: string }) {
  const { accessToken, userName } = useSelector(
    (state: RootState) => state.auth
  );
  return (
    <div
      className={`w-64 bg-sidebar border-r border-border px-4 py-6 flex flex-col ${className}`}
    >
      <Logo />

      <nav className="space-y-1 mt-8 flex-1">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="space-y-3 pt-6 border-t border-border">
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
          // If logged in, display avatar and user name
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage
                src="https://example.com/user-avatar.jpg"
                alt="User Avatar"
              />
              <AvatarFallback>UA</AvatarFallback>
            </Avatar>
            <span className="font-medium">{userName || "User"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
