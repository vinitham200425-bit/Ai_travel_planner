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
      className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 pb-20 pt-32 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/30 sm:px-6 lg:px-8"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/20"
      />

      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/20"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        {/* LEFT CONTENT */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
            <Sparkles size={17} />
            AI-Powered Travel Planning
          </div>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            AI Travel Planner for
            <span className="block text-blue-600 dark:text-blue-400">
              Personalized Itineraries
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 lg:mx-0">
            Create a personalized day-by-day travel itinerary
            based on your destination, travel dates, budget,
            travelers and travel style. AITrips helps you plan
            attractions, hotels, food, transportation, weather
            and estimated costs in one place.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href="#trip-form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              <Plane size={20} />
              Plan My Trip
              <ArrowRight size={19} />
            </Link>

            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-7 py-4 text-base font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
            >
              Explore Features
            </Link>
          </div>

          {/* TRUST / FEATURE POINTS */}
          <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-gray-600 dark:text-gray-400 lg:justify-start">
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Personalized itinerary
            </span>

            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Budget-aware planning
            </span>

            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Weather-aware suggestions
            </span>
          </div>
        </div>

        {/* RIGHT SIDE TRAVEL IMAGE */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem]">
              <Image
                src="/images/travel-collage-v2.png"
                alt="AITrips AI travel planner showing travel destinations and trip inspiration"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Floating AI badge */}
          <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:block">
            <div className="flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-blue-600 dark:text-blue-400"
              />

              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                AI-powered planning
              </p>
            </div>

            <p className="mt-1 font-bold text-gray-900 dark:text-white">
              Travel better ✈️
            </p>
          </div>

          {/* Decorative badge */}
          <div className="absolute -right-3 top-8 hidden rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-xl sm:block">
            <p className="text-xs font-medium text-blue-100">
              Your next adventure
            </p>

            <p className="mt-0.5 font-bold">
              Starts here
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}