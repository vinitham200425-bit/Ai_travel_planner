"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Plane,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden"
    >
      {/* FULL HERO BACKGROUND IMAGE */}
      <Image
        src="/images/travel-collage-v2.png"
        alt="AI Travel Planner travel destinations"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* DARK OVERLAY FOR TEXT READABILITY */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/45"
      />

      {/* EXTRA GRADIENT FOR BETTER TEXT VISIBILITY */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/20"
      />

      {/* HERO CONTENT */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-24">
        <div className="w-full max-w-4xl text-center lg:text-left">

          {/* BADGE */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md lg:mx-0">
            <Sparkles size={17} />
            AI-Powered Travel Planning
          </div>

          {/* MAIN HEADING */}
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:mx-0 lg:text-7xl">
            AI Travel Planner for
            <span className="block text-blue-300">
              Personalized Itineraries
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/90 drop-shadow-md sm:text-lg sm:leading-8 lg:mx-0">
            Create a personalized day-by-day travel itinerary
            based on your destination, travel dates, budget,
            travelers and travel style. AITrips helps you plan
            attractions, hotels, food, transportation, weather
            and estimated costs in one place.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href="#trip-form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-2xl"
            >
              <Plane size={20} />
              Plan My Trip
              <ArrowRight size={19} />
            </Link>

            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-white/50 bg-white/15 px-7 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/25"
            >
              Explore Features
            </Link>
          </div>

          {/* TRUST POINTS */}
          <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-white/90 lg:justify-start">
            <span className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              Personalized itinerary
            </span>

            <span className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              Budget-aware planning
            </span>

            <span className="flex items-center gap-2">
              <span className="text-green-300">✓</span>
              Weather-aware suggestions
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM FADE */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/35 to-transparent"
      />
    </section>
  );
}