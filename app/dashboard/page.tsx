"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  LoaderCircle,
  MapPin,
  Plane,
  Plus,
  Route,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

type Trip = {
  id: string;
  destination: string;
  days: number;
  budget: number;
  travelers: string;
  travelStyle: string;
  hotelCategory: string;
  createdAt: string;
};

type DashboardData = {
  totalTrips: number;
  uniqueDestinations: number;
  totalBudget: number;
  latestTrip: Trip | null;
  recentTrips: Trip[];
};

const emptyDashboardData: DashboardData = {
  totalTrips: 0,
  uniqueDestinations: 0,
  totalBudget: 0,
  latestTrip: null,
  recentTrips: [],
};

export default function DashboardPage() {
  const [userName, setUserName] = useState("Traveler");
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Please log in to view your dashboard.");
      }

      const fullName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name.trim()
          : "";

      const emailName = user.email?.split("@")[0] ?? "Traveler";

      setUserName(fullName || emailName);

      const response = await fetch("/api/dashboard-stats", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load dashboard statistics."
        );
      }

      setDashboardData(result);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 pt-24">
        <div className="text-center">
          <LoaderCircle
            size={48}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 font-medium text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  const latestTripName =
    dashboardData.latestTrip?.destination || "No trips yet";

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white shadow-lg sm:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 text-blue-100">
                <Sparkles size={19} />
                Your personal travel workspace
              </p>

              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Welcome back, {userName}!
              </h1>

              <p className="mt-3 max-w-2xl text-blue-100">
                Review your travel plans, explore your recent trips and
                start planning your next destination.
              </p>
            </div>

            <Link
              href="/#trip-form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-md transition hover:bg-blue-50"
            >
              <Plus size={20} />
              Plan New Trip
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Trips"
            value={dashboardData.totalTrips.toString()}
            description="Trips created"
            icon={<Plane size={25} />}
          />

          <StatCard
            title="Destinations"
            value={dashboardData.uniqueDestinations.toString()}
            description="Unique places planned"
            icon={<MapPin size={25} />}
          />

          <StatCard
            title="Total Budget"
            value={formatCurrency(dashboardData.totalBudget)}
            description="Combined planned budget"
            icon={<CircleDollarSign size={25} />}
          />

          <StatCard
            title="Latest Trip"
            value={latestTripName}
            description={
              dashboardData.latestTrip
                ? formatDate(dashboardData.latestTrip.createdAt)
                : "Create your first trip"
            }
            icon={<Route size={25} />}
            compact
          />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Trips
                </h2>

                <p className="mt-1 text-gray-500">
                  Your most recently created travel plans
                </p>
              </div>

              <Link
                href="/my-trips"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {dashboardData.recentTrips.length === 0 ? (
              <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-200 px-6 py-12 text-center">
                <Plane
                  size={44}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  No trips created yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-gray-500">
                  Create your first travel plan and it will appear here.
                </p>

                <Link
                  href="/#trip-form"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus size={19} />
                  Create First Trip
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {dashboardData.recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <MapPin size={23} />
                      </span>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {trip.destination}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={16} />
                            {trip.days}{" "}
                            {trip.days === 1 ? "day" : "days"}
                          </span>

                          <span>
                            {formatCurrency(trip.budget)}
                          </span>

                          <span>{trip.travelStyle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <span className="text-sm text-gray-500">
                        {formatDate(trip.createdAt)}
                      </span>

                      <Link
                        href={`/trips/${trip.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View trip
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Quick Actions
              </h2>

              <div className="mt-5 space-y-3">
                <QuickAction
                  href="/#trip-form"
                  title="Generate a Trip"
                  description="Create a personalised itinerary"
                  icon={<Plus size={21} />}
                />

                <QuickAction
                  href="/my-trips"
                  title="My Trips"
                  description="View all saved travel plans"
                  icon={<Plane size={21} />}
                />

                <QuickAction
                  href="/profile"
                  title="Update Profile"
                  description="Manage your account details"
                  icon={<Sparkles size={21} />}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-gray-900 p-6 text-white shadow-sm">
              <h2 className="text-xl font-bold">
                Ready for another adventure?
              </h2>

              <p className="mt-3 text-gray-300">
                Tell us your destination, budget and travel preferences.
                We will prepare the rest.
              </p>

              <Link
                href="/#trip-form"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                <Plane size={19} />
                Start Planning
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  compact?: boolean;
};

function StatCard({
  title,
  value,
  description,
  icon,
  compact = false,
}: StatCardProps) {
  return (
    <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-gray-500">{title}</p>

          <p
            className={`mt-3 truncate font-bold text-gray-900 ${
              compact ? "text-xl" : "text-3xl"
            }`}
            title={value}
          >
            {value}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>
        </div>

        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          {icon}
        </span>
      </div>
    </article>
  );
}

type QuickActionProps = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

function QuickAction({
  href,
  title,
  description,
  icon,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </span>

      <span>
        <span className="block font-semibold text-gray-900">
          {title}
        </span>

        <span className="mt-1 block text-sm text-gray-500">
          {description}
        </span>
      </span>
    </Link>
  );
}