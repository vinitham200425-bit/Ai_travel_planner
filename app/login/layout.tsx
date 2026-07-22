import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your AI Travel Planner account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}