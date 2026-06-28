import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOVA — Autonomous AI Productivity Agent",
  description:
    "An AI agent that plans, schedules, and executes tasks so you never miss a deadline again. Built with Google AI Studio, Gemini, and Firebase.",
  keywords: ["AI", "productivity", "agent", "autonomous", "Gemini", "Firebase", "Google"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-[family-name:var(--font-inter)]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
