"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-accent/10 hover:text-accent-foreground",
        isActive 
          ? "bg-accent/20 text-accent-foreground" 
          : "text-muted-foreground"
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}