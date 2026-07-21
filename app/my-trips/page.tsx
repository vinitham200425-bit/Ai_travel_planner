"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  Eye,
  Heart,
  Hotel,
  LoaderCircle,
  MapPin,
  Plane,
  RefreshCw,
  Route,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const fallbackImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

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
  imageUrl?: string | null;
  isFavorite: boolean;
};

type TripFilter = "all" | "favorites";

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<TripFilter>("all");
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<string | null>(
    null
  );

  useEffect(() => {
    void loadTrips();
  }, []);

  const favoriteCount = useMemo(
    () => trips.filter((trip) => trip.isFavorite).length,
    [trips]
  );

  const visibleTrips = useMemo(() => {
    if (filter === "favorites") {
      return trips.filter((trip) => trip.isFavorite);
    }

    return trips;
  }, [filter, trips]);

  async function loadTrips() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/my-trips", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch trips.");
      }

      const loadedTrips = Array.isArray(data.trips)
        ? data.trips.map((trip: Trip) => ({
            ...trip,
            isFavorite: Boolean(trip.isFavorite),
          }))
        : [];

      setTrips(loadedTrips);
    } catch (error) {
      console.error("My Trips Error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while loading your trips.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFavorite(trip: Trip) {
    if (updatingFavoriteId) {
      return;
    }

    const newFavoriteStatus = !trip.isFavorite;

    try {
      setUpdatingFavoriteId(trip.id);

      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isFavorite: newFavoriteStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update favorite status."
        );
      }

      setTrips((currentTrips) =>
        currentTrips.map((currentTrip) =>
          currentTrip.id === trip.id
            ? {
                ...currentTrip,
                isFavorite: newFavoriteStatus,
              }
            : currentTrip
        )
      );

      toast.success(
        newFavoriteStatus
          ? "Trip added to favorites."
          : "Trip removed from favorites."
      );
    } catch (error) {
      console.error("Favorite Trip Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update favorite status."
      );
    } finally {
      setUpdatingFavoriteId(null);
    }
  }

  async function handleDeleteTrip() {
    if (!tripToDelete || deleting) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(`/api/trips/${tripToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete the trip.");
      }

      setTrips((currentTrips) =>
        currentTrips.filter((trip) => trip.id !== tripToDelete.id)
      );

      setTripToDelete(null);
      toast.success("Trip deleted successfully.");
    } catch (error) {
      console.error("Delete Trip Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete the trip."
      );
    } finally {
      setDeleting(false);
    }
  }

  function closeDeleteModal() {
    if (!deleting) {
      setTripToDelete(null);
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
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 pt-24 transition-colors dark:bg-gray-950">
        <div className="text-center">
          <LoaderCircle
            size={48}
            className="mx-auto animate-spin text-blue-600 dark:text-blue-400"
          />

          <p className="mt-4 font-medium text-gray-600 dark:text-gray-300">
            Loading your trips...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                <Plane size={19} />
                Your travel collection
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
                My Trips
              </h1>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                View, manage and revisit your saved travel plans.
              </p>
            </div>

            <Link
              href="/#trip-form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plane size={19} />
              Plan New Trip
            </Link>
          </div>

          {errorMessage && (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
              <p className="font-medium text-red-700 dark:text-red-300">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => void loadTrips()}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
            </section>
          )}

          {!errorMessage && trips.length === 0 && (
            <section className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900 sm:p-14">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Plane size={42} />
              </span>

              <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                No trips yet
              </h2>

              <p className="mx-auto mt-3 max-w-md leading-7 text-gray-500 dark:text-gray-400">
                Generate your first AI-powered travel itinerary. Your saved
                plans will appear here.
              </p>

              <Link
                href="/#trip-form"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plane size={19} />
                Generate Your First Trip
              </Link>
            </section>
          )}

          {!errorMessage && trips.length > 0 && (
            <>
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      filter === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Trips ({trips.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter("favorites")}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      filter === "favorites"
                        ? "bg-rose-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={filter === "favorites" ? "currentColor" : "none"}
                    />
                    Favorites ({favoriteCount})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void loadTrips()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {filter === "favorites" && visibleTrips.length === 0 ? (
                <section className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    <Heart size={32} />
                  </span>

                  <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
                    No favorite trips
                  </h2>

                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Select the heart icon on a trip to save it as a favorite.
                  </p>

                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    View All Trips
                  </button>
                </section>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {visibleTrips.map((trip, index) => {
                    const updatingFavorite =
                      updatingFavoriteId === trip.id;

                    return (
                      <article
                        key={trip.id}
                        className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="relative h-56 w-full overflow-hidden">
                          <Image
                            src={trip.imageUrl || fallbackImage}
                            alt={`Travel destination: ${trip.destination}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            loading={index === 0 ? "eager" : "lazy"}
                            className="object-cover transition duration-500 hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                          <button
                            type="button"
                            onClick={() => void handleToggleFavorite(trip)}
                            disabled={
                              Boolean(updatingFavoriteId) &&
                              !updatingFavorite
                            }
                            aria-label={
                              trip.isFavorite
                                ? `Remove ${trip.destination} from favorites`
                                : `Add ${trip.destination} to favorites`
                            }
className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md backdrop-blur transition hover:scale-110 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900/90 dark:text-red-500 dark:hover:bg-gray-900"                          >
                            {updatingFavorite ? (
                              <LoaderCircle
                                size={21}
                                className="animate-spin"
                              />
                            ) : (
                              <Heart
  size={22}
  className="text-red-500"
  fill={trip.isFavorite ? "#ef4444" : "none"}
  strokeWidth={2}
/>
                            )}
                          </button>

                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <p className="flex items-center gap-2 text-sm text-blue-100">
                              <MapPin size={17} />
                              Saved trip
                            </p>

                            <h2 className="mt-2 break-words text-3xl font-bold">
                              {trip.destination}
                            </h2>

                            <p className="mt-2 text-sm text-blue-100">
                              Created on {formatDate(trip.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="space-y-3 text-gray-700 dark:text-gray-300">
                            <TripInfo
                              icon={<CalendarDays size={19} />}
                              text={`${trip.days} ${
                                trip.days === 1 ? "day" : "days"
                              }`}
                            />

                            <TripInfo
                              icon={<CircleDollarSign size={19} />}
                              text={formatCurrency(trip.budget)}
                            />

                            <TripInfo
                              icon={<Users size={19} />}
                              text={`${trip.travelers} traveler(s)`}
                            />

                            <TripInfo
                              icon={<Route size={19} />}
                              text={trip.travelStyle}
                            />

                            <TripInfo
                              icon={<Hotel size={19} />}
                              text={trip.hotelCategory}
                            />
                          </div>

                          <div className="mt-6 grid grid-cols-2 gap-3">
                            <Link
                              href={`/trips/${trip.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                              <Eye size={18} />
                              View Trip
                            </Link>

                            <button
                              type="button"
                              onClick={() => setTripToDelete(trip)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white dark:border-red-500 dark:text-red-400 dark:hover:text-white"
                            >
                              <Trash2 size={18} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {tripToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-trip-title"
            aria-describedby="delete-trip-description"
            className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-7 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <Trash2 size={24} />
              </span>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label="Close delete confirmation"
              >
                <X size={22} />
              </button>
            </div>

            <h2
              id="delete-trip-title"
              className="mt-5 text-2xl font-bold text-gray-900 dark:text-white"
            >
              Delete this trip?
            </h2>

            <p
              id="delete-trip-description"
              className="mt-3 leading-7 text-gray-500 dark:text-gray-400"
            >
              You are about to delete your trip to{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {tripToDelete.destination}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDeleteTrip()}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                {deleting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

type TripInfoProps = {
  icon: ReactNode;
  text: string;
};

function TripInfo({ icon, text }: TripInfoProps) {
  return (
    <p className="flex items-center gap-3">
      <span className="shrink-0 text-blue-600 dark:text-blue-400">
        {icon}
      </span>

      <span className="break-words">{text}</span>
    </p>
  );
}