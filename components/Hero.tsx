"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Sparkles } from "lucide-react";

export default function Hero() {
  function scrollToPlanner() {
    document
      .getElementById("trip-form")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[720px] scroll-mt-20 items-center overflow-hidden pt-20"
    >
      <Image
        src="/images/hero-banner.png"
        alt="Beautiful travel destination"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/65 to-gray-950/25" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
            <Sparkles size={17} />
            AI-powered travel planning
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
            Plan your perfect trip in minutes
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200 sm:text-xl">
            Create a personalized itinerary based on your destination,
            travel dates, budget, preferences and weather conditions.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={scrollToPlanner}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Start Planning Now
              <ArrowRight size={19} />
            </button>

            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-gray-200">
            <HeroBenefit text="Personalized itinerary" />
            <HeroBenefit text="Budget-based planning" />
            <HeroBenefit text="Weather-aware suggestions" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 hidden rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-xl backdrop-blur-lg md:block">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
            <MapPin size={22} />
          </span>

          <div>
            <p className="text-sm text-gray-300">Your next adventure</p>
            <p className="font-semibold">Starts right here</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroBenefit({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckCircle2 size={18} className="text-green-400" />
      {text}
    </span>
  );
}