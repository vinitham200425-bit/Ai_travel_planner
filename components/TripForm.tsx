"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import TripResult from "./TripResult";

type Trip = {
  destination: string;
  days: number;
  budget: string;
  travelers: string;
  travelStyle: string;
  hotelCategory: string;
  itinerary: string[];
};

export default function TripForm() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [travelStyle, setTravelStyle] = useState("Relax");
  const [hotelCategory, setHotelCategory] = useState("3 Star");

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerateTrip() {
    const parsedDays = Number(days);
    const parsedBudget = Number(budget);

    if (!destination.trim() || !budget || !days) {
      toast.error("Please fill in destination, budget and days.");
      return;
    }

    if (!Number.isInteger(parsedDays) || parsedDays < 1) {
      toast.error("Number of days must be at least 1.");
      return;
    }

    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      toast.error("Please enter a valid budget.");
      return;
    }

    const loadingToast = toast.loading(
      "Generating your AI itinerary..."
    );

    try {
      setLoading(true);

      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: destination.trim(),
          days: parsedDays,
          budget: parsedBudget,
          travelers,
          travelStyle,
          hotelCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate itinerary."
        );
      }

      setTrip({
        destination: destination.trim(),
        days: parsedDays,
        budget,
        travelers,
        travelStyle,
        hotelCategory,
        itinerary: [data.itinerary],
      });

      toast.success("Itinerary generated and saved!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Generate Trip Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate your itinerary.",
        {
          id: loadingToast,
        }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="trip-form" className="bg-gray-100 py-20">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-2xl">
        <h2 className="mb-3 text-center text-4xl font-bold text-blue-600">
          ✈️ Plan Your Dream Trip
        </h2>

        <p className="mb-10 text-center text-gray-500">
          Enter your travel preferences and let AI build your itinerary.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              📍 Destination
            </label>

            <input
              type="text"
              placeholder="e.g. Ooty"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              💰 Budget (₹)
            </label>

            <input
              type="number"
              min="1"
              placeholder="e.g. 25000"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              📅 Number of Days
            </label>

            <input
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={days}
              onChange={(event) => setDays(event.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              👨‍👩‍👧 Travelers
            </label>

            <select
              value={travelers}
              onChange={(event) => setTravelers(event.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              🎒 Travel Style
            </label>

            <select
              value={travelStyle}
              onChange={(event) => setTravelStyle(event.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Relax">Relax</option>
              <option value="Adventure">Adventure</option>
              <option value="Luxury">Luxury</option>
              <option value="Family">Family</option>
              <option value="Solo">Solo</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              🏨 Hotel Category
            </label>

            <select
              value={hotelCategory}
              onChange={(event) =>
                setHotelCategory(event.target.value)
              }
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3 Star">3 Star</option>
              <option value="4 Star">4 Star</option>
              <option value="5 Star">5 Star</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateTrip}
          disabled={loading}
          className="mt-10 w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading
            ? "Generating AI Itinerary..."
            : "🚀 Generate AI Itinerary"}
        </button>
      </div>

      {trip && <TripResult trip={trip} />}
    </section>
  );
}