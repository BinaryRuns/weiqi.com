"use client";

import { Logo } from './logo';
import { Navigation } from './navigation';
import { UserActions } from './user-actions';

export function Sidebar({ className = '' }: { className?: string }) {
  return (
    <div className={`w-64 bg-[#121212] border-r border-border px-4 py-6 flex flex-col ${className}`}>
      <Logo />
      <Navigation />
      <UserActions />
    </div>
  );
}