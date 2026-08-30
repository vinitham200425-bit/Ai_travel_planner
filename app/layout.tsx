import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import ThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),

  title: {
    default:     "AI Travel Planner & Itinerary Generator | AITrips",
    template: "%s | AI Travel Planner",
  },

  description:
    "Plan personalized trips with AITrips, an AI travel planner and itinerary generator. Create day-by-day travel itineraries based on your destination, budget, travel style and trip duration.",
  keywords: [
    "AI travel planner",
    "trip planner",
    "travel itinerary generator",
    "AI itinerary",
    "vacation planner",
    "holiday planner",
    "budget trip planner",
    "travel planner India",
    "ai generated travel itinerary",
    "ai travel itineraries",
    "ai generated itineraries"
  ],

  authors: [
    {
      name: "AI Travel Planner",
    },
  ],

  creator: "AI Travel Planner",
  publisher: "AI Travel Planner",

  applicationName: "AI Travel Planner",

  category: "travel",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "AI Travel Planner",
    title: "AI Travel Planner | Plan Smarter, Travel Better",
    description:
      "Generate personalized day-wise travel itineraries based on your destination, dates, budget, preferences and weather.",
    images: [
      {
        url: "/images/travel-collage.png",
        alt: "AI Travel Planner",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AI Travel Planner | Plan Smarter, Travel Better",
    description:
      "Create personalized AI-powered travel itineraries in minutes.",
    images: ["/images/travel-collage.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}