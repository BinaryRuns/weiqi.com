"use client";

import Link from 'next/link';
import { CircleDotIcon } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 px-2">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <CircleDotIcon className="w-5 h-5 text-background" />
      </div>
      <span className="text-xl font-bold text-foreground">GoMaster</span>
    </Link>
  );
}