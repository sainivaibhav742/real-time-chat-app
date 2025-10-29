import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { initializeUserCrypto } from "@/utils/crypto";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ChatFlow - Real-Time Chat App",
  description: "A modern real-time chat application with AI integration and end-to-end encryption",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize crypto on app start
  if (typeof window !== 'undefined') {
    initializeUserCrypto().catch(console.error);
  }

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
