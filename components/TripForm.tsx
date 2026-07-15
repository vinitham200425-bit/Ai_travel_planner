"use client";

import { useState } from "react";
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

  const handleGenerateTrip = async () => {
    if (!destination || !budget || !days) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          days,
          budget,
          travelers,
          travelStyle,
          hotelCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate itinerary.");
      }

      setTrip({
        destination,
        days: Number(days),
        budget,
        travelers,
        travelStyle,
        hotelCategory,
        itinerary: [data.itinerary],
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="trip-form" className="py-20 bg-gray-100">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <h2 className="text-4xl font-bold text-center text-blue-600 mb-3">
          ✈️ Plan Your Dream Trip
        </h2>

        <p className="text-center text-gray-500 mb-10">
          Enter your travel preferences and let AI build your itinerary.
        </p>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              📍 Destination
            </label>

            <input
              type="text"
              placeholder="e.g. Ooty"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              💰 Budget (₹)
            </label>

            <input
              type="number"
              placeholder="e.g. 25000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              📅 Number of Days
            </label>

            <input
              type="number"
              placeholder="e.g. 5"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              👨‍👩‍👧 Travelers
            </label>

            <select
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5+</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              🎒 Travel Style
            </label>

            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Relax</option>
              <option>Adventure</option>
              <option>Luxury</option>
              <option>Family</option>
              <option>Solo</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              🏨 Hotel Category
            </label>

            <select
              value={hotelCategory}
              onChange={(e) => setHotelCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>3 Star</option>
              <option>4 Star</option>
              <option>5 Star</option>
            </select>
          </div>

        </div>

        <button
          onClick={handleGenerateTrip}
          disabled={loading}
          className="mt-10 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl text-lg font-semibold transition duration-300"
        >
          {loading ? "Generating AI Itinerary..." : "🚀 Generate AI Itinerary"}
        </button>

      </div>

      {trip && <TripResult trip={trip} />}
    </section>
  );
}