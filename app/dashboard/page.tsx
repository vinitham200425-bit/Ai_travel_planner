"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Traveler");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setUserName("Traveler");
        return;
      }

      setUserName(
        user.user_metadata?.full_name ||
          user.email ||
          "Traveler"
      );
    } catch (error) {
      console.error("Dashboard User Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 pb-16 pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome 👋
          </h1>

          <p className="mt-2 text-xl font-semibold text-blue-600">
            {loading ? "Loading..." : userName}
          </p>

          <p className="mt-2 text-gray-500">
            Plan, view and manage your travel itineraries.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Link href="/my-trips">
            <div className="h-full cursor-pointer rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 text-5xl">✈️</div>

              <h2 className="text-2xl font-bold text-gray-900">
                My Trips
              </h2>

              <p className="mt-3 text-gray-500">
                View all your saved travel plans.
              </p>

              <p className="mt-6 font-semibold text-blue-600">
                View Trips →
              </p>
            </div>
          </Link>

          <Link href="/#trip-form">
            <div className="h-full cursor-pointer rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 text-5xl">➕</div>

              <h2 className="text-2xl font-bold text-gray-900">
                Plan New Trip
              </h2>

              <p className="mt-3 text-gray-500">
                Generate a new AI-powered itinerary.
              </p>

              <p className="mt-6 font-semibold text-blue-600">
                Start Planning →
              </p>
            </div>
          </Link>

          <Link href="/profile">
            <div className="h-full cursor-pointer rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 text-5xl">👤</div>

              <h2 className="text-2xl font-bold text-gray-900">
                Profile
              </h2>

              <p className="mt-3 text-gray-500">
                Manage your personal account information.
              </p>

              <p className="mt-6 font-semibold text-blue-600">
                Open Profile →
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}