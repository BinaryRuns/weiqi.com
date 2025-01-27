import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootLayout } from "@/components/layout/root-layout";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

import AuthProvider from "@/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoMaster - Play Go/Weiqi Online",
  description:
    "Play Go/Weiqi online, solve puzzles, learn strategies, and join a global community of players.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <WebSocketProvider>
            <RootLayout>{children}</RootLayout>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
