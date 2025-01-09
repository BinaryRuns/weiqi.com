"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { ToastProvider, ToastViewport } from "../ui/toast";
import { Toaster } from "../ui/toaster";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen">
        <Sidebar className="hidden lg:flex" />
        <div className="flex-1 flex flex-col">
          <MobileHeader className="lg:hidden" />
          <main className="flex-1 overflow-y-auto">
            {children}
            <Toaster />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
