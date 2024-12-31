"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Logo } from './layout/logo';

export function MobileHeader({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`h-16 border-b border-border bg-card/50 px-4 flex items-center ${className}`}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-foreground">
            <MenuIcon className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      <div className="ml-4">
        <Logo />
      </div>
    </header>
  );
}