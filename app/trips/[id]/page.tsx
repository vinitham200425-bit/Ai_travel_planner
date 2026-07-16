"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function TripDetailsPage() {
  const params = useParams<{ id: string }>();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (params.id) {
      loadTrip(params.id);
    }
  }, [params.id]);

  async function loadTrip(id: string) {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`/api/trips/${id}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load trip.");
      }

      setTrip(data.trip);
    } catch (error) {
      console.error("Trip Details Error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading this trip."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 pt-32 text-center">
        <p className="text-xl font-semibold text-gray-700">
          Loading trip...
        </p>
      </main>
    );
  }

  if (message || !trip) {
    return (
      <main className="min-h-screen bg-gray-100 pt-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <h1 className="text-3xl font-bold text-gray-900">
              Trip Not Available
            </h1>

            <p className="mt-4 text-red-600">
              {message || "Trip not found."}
            </p>

            <Link
              href="/my-trips"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Back to My Trips
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-16 pt-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6">
          <Link
            href="/my-trips"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to My Trips
          </Link>
        </div>

        <section className="rounded-3xl bg-white p-8 shadow-xl md:p-10">
          <div className="border-b border-gray-200 pb-8">
            <h1 className="text-4xl font-bold text-blue-600">
              📍 {trip.destination}
            </h1>

            <p className="mt-3 text-gray-500">
              Created on{" "}
              {new Date(trip.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-5 border-b border-gray-200 py-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="mt-1 text-lg font-semibold">
                📅 {trip.days} days
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Budget</p>
              <p className="mt-1 text-lg font-semibold">
                💰 ₹{trip.budget}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Travelers</p>
              <p className="mt-1 text-lg font-semibold">
                👥 {trip.travelers}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Travel Style</p>
              <p className="mt-1 text-lg font-semibold">
                🎒 {trip.travelStyle}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Hotel</p>
              <p className="mt-1 text-lg font-semibold">
                🏨 {trip.hotelCategory}
              </p>
            </div>
          </div>

          <div className="pt-8">
            <h2 className="mb-5 text-3xl font-bold text-gray-900">
              Your Itinerary
            </h2>

            <div className="whitespace-pre-wrap rounded-2xl bg-gray-50 p-6 leading-8 text-gray-700">
              {trip.itinerary}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}