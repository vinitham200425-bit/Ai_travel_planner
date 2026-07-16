"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Trip = {
  id: string;
  destination: string;
  days: number;
  budget: number;
  travelers: string;
  travelStyle: string;
  hotelCategory: string;
  itinerary: string;
  createdAt: string;
};

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      setMessage("");

      console.log("Step 1: Checking logged-in user");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("Step 2: User result", user);
      console.log("User error", userError);

      if (userError || !user) {
        setMessage("Please log in to view your trips.");
        return;
      }

      console.log("Step 3: Calling /api/my-trips");

      const response = await fetch("/api/my-trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      console.log("Step 4: API status", response.status);

      const data = await response.json();

      console.log("Step 5: API response", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch trips.");
      }

      setTrips(data.trips);
    } catch (error) {
      console.error("My Trips Error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading trips."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Loading trips...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              My Trips
            </h1>

            <p className="text-gray-500 mt-2">
              View your saved travel plans.
            </p>
          </div>

          <Link
            href="/#trip-form"
            className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Plan New Trip
          </Link>
        </div>

        {message && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {message}
          </div>
        )}

        {!message && trips.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-md text-center">
            <div className="text-5xl mb-4">✈️</div>

            <h2 className="text-2xl font-bold text-gray-900">
              No Trips Yet
            </h2>

            <p className="text-gray-500 mt-3">
              Generate your first AI travel itinerary.
            </p>

            <Link
              href="/#trip-form"
              className="inline-block mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
              Generate Trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <article
                key={trip.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
              >
                <h2 className="text-2xl font-bold text-blue-600">
                  📍 {trip.destination}
                </h2>

                <div className="mt-5 space-y-2 text-gray-700">
                  <p>📅 {trip.days} days</p>
                  <p>💰 ₹{trip.budget}</p>
                  <p>👥 {trip.travelers} traveler(s)</p>
                  <p>🎒 {trip.travelStyle}</p>
                  <p>🏨 {trip.hotelCategory}</p>
                </div>

                <p className="mt-5 text-sm text-gray-400">
                  Created on{" "}
                  {new Date(trip.createdAt).toLocaleDateString()}
                </p>

                <Link
  href={`/trips/${trip.id}`}
  className="mt-6 block w-full rounded-xl bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700 transition"
>
  View Trip
</Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}