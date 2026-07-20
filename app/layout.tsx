import type { Metadata } from "next";
import "./globals.css";

import ThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "AI Travel Planner",
  description:
    "Create personalized travel itineraries using artificial intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider>
          <ToastProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}