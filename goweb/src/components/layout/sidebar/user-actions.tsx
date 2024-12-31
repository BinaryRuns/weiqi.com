"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogInIcon, UserPlusIcon } from 'lucide-react';

export function UserActions() {
  return (
    <div className="space-y-3 pt-6 border-t border-border">
      <Button asChild variant="outline" className="w-full justify-start">
        <Link href="/login" className="gap-3">
          <LogInIcon className="w-4 h-4" />
          Log In
        </Link>
      </Button>
      <Button asChild className="w-full justify-start">
        <Link href="/signup" className="gap-3">
          <UserPlusIcon className="w-4 h-4" />
          Sign Up
        </Link>
      </Button>
    </div>
  );
}