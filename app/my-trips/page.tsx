"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Trip = {
  id: string;
  userId: string;
  userEmail: string;
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
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/my-trips", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch trips.");
      }

      setTrips(data.trips);
    } catch (error) {
      console.error("My Trips Error:", error);

      setErrorMessage(
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
      <main className="min-h-screen bg-gray-100 pt-32 text-center">
        <p className="text-xl font-semibold text-gray-700">
          Loading trips...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 pb-16 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              My Trips
            </h1>

            <p className="mt-2 text-gray-500">
              View and manage your saved travel plans.
            </p>
          </div>

          <Link
            href="/#trip-form"
            className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Plan New Trip
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {!errorMessage && trips.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-md">
            <div className="mb-4 text-6xl">✈️</div>

            <h2 className="text-2xl font-bold text-gray-900">
              No Trips Yet
            </h2>

            <p className="mt-3 text-gray-500">
              Generate your first AI travel itinerary.
            </p>

            <Link
              href="/#trip-form"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Generate Trip
            </Link>
          </section>
        ) : (
          !errorMessage && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <article
                  key={trip.id}
                  className="rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
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
                    className="mt-6 block w-full rounded-xl bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Trip
                  </Link>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}