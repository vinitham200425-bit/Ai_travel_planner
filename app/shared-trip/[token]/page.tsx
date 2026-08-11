import Link from "next/link";
import {
  CalendarDays,
  CircleDollarSign,
  Hotel,
  Plane,
  Route,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/server/prisma";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

type StructuredDayPlan = {
  day: number;
  date: string;
  location: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  transport: string;
  stay: string;
  weatherAdvice: string;
  optional: string[];
  estimatedDailyCost: string;
};

type StructuredItinerary = {
  tripOverview: {
    title: string;
    route: string[];
    summary: string;
    feasibilityNote: string;
  };
  days: StructuredDayPlan[];
  hotels: Array<{
    nameOrArea: string;
    category: string;
    approximateNightlyCost: string;
    bestFor: string;
  }>;
  budget: {
    accommodation: string;
    intercityTransport: string;
    localTransport: string;
    food: string;
    attractions: string;
    miscellaneous: string;
    estimatedTotal: string;
    budgetNote: string;
  };
  transportTips: string[];
  mustTryFood: string[];
  packingChecklist: string[];
  safetyTips: string[];
  bookingReminders: string[];
  quickTips: string[];
};

function parseStructuredItinerary(
  value: string
): StructuredItinerary | null {
  try {
    return JSON.parse(value) as StructuredItinerary;
  } catch {
    return null;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function SharedTripPage({
  params,
}: PageProps) {
  const { token } = await params;

  const trip = await prisma.trip.findFirst({
    where: {
      shareToken: token,
      isPublic: true,
    },
    select: {
      destination: true,
      country: true,
      days: true,
      budget: true,
      travelers: true,
      travelStyle: true,
      hotelCategory: true,
      itinerary: true,
    },
  });

  if (!trip) {
    notFound();
  }

  const itinerary =
    parseStructuredItinerary(trip.itinerary);

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-7 text-white shadow-xl sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            <Plane size={17} />
            Shared with AITrips
          </p>

          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">
            {trip.destination}
          </h1>
          <p className="mt-2 text-xl text-blue-50">
            {trip.country}
          </p>

          <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2">
              <CalendarDays size={17} />
              {trip.days} {trip.days === 1 ? "day" : "days"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2">
              <CircleDollarSign size={17} />
              {formatCurrency(trip.budget)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2">
              <Users size={17} />
              {trip.travelers} travelers
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2">
              <Route size={17} />
              {trip.travelStyle}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2">
              <Hotel size={17} />
              {trip.hotelCategory}
            </span>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-9">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Travel Itinerary
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Read-only shared travel plan
          </p>

          <div className="mt-8">
            {itinerary ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/30">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {itinerary.tripOverview.title}
                  </h3>
                  <p className="mt-2 leading-7 text-gray-600 dark:text-gray-300">
                    {itinerary.tripOverview.summary}
                  </p>
                  {itinerary.tripOverview.route.length > 0 && (
                    <p className="mt-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {itinerary.tripOverview.route.join(" → ")}
                    </p>
                  )}
                </div>

                {itinerary.days.map((day) => (
                  <article
                    key={day.day}
                    className="rounded-2xl border border-gray-100 p-5 dark:border-gray-700 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Day {day.day} · {day.date}
                        </p>
                        <h4 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                          {day.location}
                        </h4>
                      </div>
                      <span className="h-fit rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-300">
                        {day.estimatedDailyCost}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                      <DayBlock title="🌅 Morning" items={day.morning} />
                      <DayBlock title="☀️ Afternoon" items={day.afternoon} />
                      <DayBlock title="🌙 Evening" items={day.evening} />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Info title="🍽 Meals">
                        Breakfast: {day.meals.breakfast}
                        <br />
                        Lunch: {day.meals.lunch}
                        <br />
                        Dinner: {day.meals.dinner}
                      </Info>
                      <Info title="🚖 Transport">{day.transport}</Info>
                      <Info title="🏨 Stay">{day.stay}</Info>
                      <Info title="🌦 Weather">{day.weatherAdvice}</Info>
                    </div>
                  </article>
                ))}

                <div className="grid gap-5 lg:grid-cols-2">
                  <Summary title="💰 Approximate Budget">
                    <p>Accommodation: {itinerary.budget.accommodation}</p>
                    <p>Intercity transport: {itinerary.budget.intercityTransport}</p>
                    <p>Local transport: {itinerary.budget.localTransport}</p>
                    <p>Food: {itinerary.budget.food}</p>
                    <p>Attractions: {itinerary.budget.attractions}</p>
                    <p>Miscellaneous: {itinerary.budget.miscellaneous}</p>
                    <p className="mt-2 font-bold">
                      Estimated total: {itinerary.budget.estimatedTotal}
                    </p>
                  </Summary>
                  <Summary title="⭐ Quick Tips">
                    <BulletList items={itinerary.quickTips} />
                  </Summary>
                  <Summary title="🚖 Transport Tips">
                    <BulletList items={itinerary.transportTips} />
                  </Summary>
                  <Summary title="🍽 Must-Try Food">
                    <BulletList items={itinerary.mustTryFood} />
                  </Summary>
                  <Summary title="🎒 Packing Checklist">
                    <BulletList items={itinerary.packingChecklist} />
                  </Summary>
                  <Summary title="🛡 Safety Tips">
                    <BulletList items={itinerary.safetyTips} />
                  </Summary>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 leading-8 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {trip.itinerary}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-gray-900 p-7 text-center text-white">
          <h2 className="text-2xl font-bold">
            Planning your own trip?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-300">
            Create your own personalized itinerary with AITrips.
          </p>
          <Link
            href="/#trip-form"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            <Plane size={19} />
            Plan My Trip
          </Link>
        </section>
      </div>
    </main>
  );
}

function DayBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-800">
      <p className="font-bold text-gray-900 dark:text-white">
        {title}
      </p>
      <BulletList items={items} />
    </div>
  );
}

function BulletList({
  items,
}: {
  items: string[];
}) {
  return (
    <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>• {item}</li>
      ))}
    </ul>
  );
}

function Info({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
      <p className="font-bold text-gray-900 dark:text-white">
        {title}
      </p>
      <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}

function Summary({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 p-5 dark:border-gray-700">
      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </h4>
      <div className="mt-4 space-y-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </section>
  );
}
