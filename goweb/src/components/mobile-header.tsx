"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Logo } from './layout/logo';

export function MobileHeader({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect the screen width to toggle mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Define the mobile breakpoint (768px or any value you prefer)
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className={`h-16 border-b border-border bg-card/50 px-4 flex items-center ${className}`}>
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <MenuIcon className="w-5 h-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-full max-w-[300px] sm:max-w-[400px] bg-card border-r border-border flex flex-col">
            <SheetHeader className="flex items-center justify-between p-2 border-b border-border">
              <SheetTitle></SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <Sidebar className="w-full border-none" isMobile />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        // Desktop sidebar is always visible on desktop
        <Sidebar className="w-64 bg-sidebar border-r border-border px-4 py-6" />
      )}
      
      <div className="ml-4">
        <Logo />
      </div>
    </header>
  );
}
