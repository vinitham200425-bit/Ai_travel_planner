"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  CloudRain,
  CloudSun,
  Download,
  Droplets,
  Heart,
  Hotel,
  LoaderCircle,
  MapPin,
  Plane,
  Route,
  Share2,
  Sunrise,
  Sunset,
  Users,
  Wind,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

type Trip = {
  id: string;
  userId: string;
  userEmail: string;
  destination: string;
  country: string;
  days: number;
  budget: number;
  travelers: string;
  travelStyle: string;
  hotelCategory: string;
  itinerary: string;
  imageUrl?: string | null;
  isFavorite?: boolean;
  createdAt: string;
};

type WeatherData = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  cloudCover: number;
  weatherCode: number;
  isDay: boolean;
  maximumTemperature: number | null;
  minimumTemperature: number | null;
  precipitationProbability: number | null;
  sunrise: string | null;
  sunset: string | null;
  timezone: string;
};

type WeatherLocation = {
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85";

export default function TripDetailsPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sharingTrip, setSharingTrip] = useState(false);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLocation, setWeatherLocation] =
    useState<WeatherLocation | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    if (tripId) {
      void loadTrip();
    }
  }, [tripId]);

  async function loadTrip() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`/api/trips/${tripId}`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load trip.");
      }

      const loadedTrip = data.trip as Trip;

      setTrip(loadedTrip);

      void loadWeather(
        loadedTrip.destination,
        loadedTrip.country || "India"
      );
    } catch (error) {
      console.error("Trip details error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while loading the trip.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadWeather(
    destination: string,
    country: string
  ) {
    try {
      setWeatherLoading(true);
      setWeatherError("");
      setWeather(null);
      setWeatherLocation(null);

      const params = new URLSearchParams({
        destination: destination.trim(),
        country: country.trim(),
      });

      const response = await fetch(
        `/api/weather?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setWeatherError(
          data.message || "Unable to load weather information."
        );
        return;
      }

      setWeather(data.weather);
      setWeatherLocation(data.location);
    } catch {
      setWeatherError(
        "Unable to connect to the weather service."
      );
    } finally {
      setWeatherLoading(false);
    }
  }

  function getWeatherDescription(code: number) {
    if (code === 0) return "Clear sky";
    if ([1, 2].includes(code)) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
    if ([71, 73, 75, 77].includes(code)) return "Snow";
    if ([80, 81, 82].includes(code)) return "Rain showers";
    if ([85, 86].includes(code)) return "Snow showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";

    return "Current weather";
  }

  function formatWeatherTime(value: string | null) {
    if (!value) {
      return "Unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
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
      month: "long",
      year: "numeric",
    }).format(parsedDate);
  }

  function createSafeFileName(destination: string) {
    return destination
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function addWrappedText(
    pdf: jsPDF,
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = 20;

    const paragraphs = text.split("\n");
    let currentY = startY;

    paragraphs.forEach((paragraph) => {
      const trimmedParagraph = paragraph.trim();

      if (!trimmedParagraph) {
        currentY += lineHeight;
        return;
      }

      const lines = pdf.splitTextToSize(
        trimmedParagraph,
        maxWidth
      ) as string[];

      lines.forEach((line) => {
        if (
          currentY + lineHeight >
          pageHeight - bottomMargin
        ) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.text(line, x, currentY);
        currentY += lineHeight;
      });

      currentY += 2;
    });

    return currentY;
  }

  async function handleDownloadPdf() {
    if (!trip) {
      return;
    }

    try {
      setDownloadingPdf(true);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 42, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("AI Travel Planner", margin, 17);

      pdf.setFontSize(15);
      pdf.text(
        `${trip.destination}, ${trip.country}`,
        margin,
        29
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(
        `Created on ${formatDate(trip.createdAt)}`,
        margin,
        36
      );

      let currentY = 55;

      pdf.setTextColor(31, 41, 55);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Trip Summary", margin, currentY);

      currentY += 10;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      const summaryRows = [
        ["Destination", trip.destination],
        ["Country", trip.country],
        [
          "Duration",
          `${trip.days} ${
            trip.days === 1 ? "day" : "days"
          }`,
        ],
        ["Budget", formatCurrency(trip.budget)],
        ["Travelers", trip.travelers],
        ["Travel Style", trip.travelStyle],
        ["Hotel Category", trip.hotelCategory],
      ];

      summaryRows.forEach(([label, value]) => {
        if (currentY > 275) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text(`${label}:`, margin, currentY);

        pdf.setFont("helvetica", "normal");

        const wrappedValue = pdf.splitTextToSize(
          value,
          contentWidth - 42
        ) as string[];

        pdf.text(wrappedValue, margin + 42, currentY);

        currentY += Math.max(
          8,
          wrappedValue.length * 6
        );
      });

      currentY += 4;

      if (currentY > 255) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Travel Itinerary", margin, currentY);

      currentY += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10.5);

      addWrappedText(
        pdf,
        trip.itinerary ||
          "No itinerary is available for this trip.",
        margin,
        currentY,
        contentWidth,
        6
      );

      const pageCount = pdf.getNumberOfPages();

      for (
        let pageNumber = 1;
        pageNumber <= pageCount;
        pageNumber++
      ) {
        pdf.setPage(pageNumber);

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        pdf.setDrawColor(220, 220, 220);
        pdf.line(
          margin,
          pageHeight - 13,
          pageWidth - margin,
          pageHeight - 13
        );

        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");

        pdf.text(
          "Generated by AI Travel Planner",
          margin,
          pageHeight - 7
        );

        pdf.text(
          `Page ${pageNumber} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - 7,
          {
            align: "right",
          }
        );
      }

      const fileName =
        createSafeFileName(trip.destination) ||
        "travel-plan";

      pdf.save(`${fileName}-itinerary.pdf`);

      toast.success(
        "Trip PDF downloaded successfully."
      );
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Unable to download the PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleShareTrip() {
    if (!trip || sharingTrip) {
      return;
    }

    try {
      setSharingTrip(true);

      const shareUrl = window.location.href;
      const shareTitle = `${trip.destination}, ${trip.country} Travel Plan`;
      const shareText = `Check out my travel itinerary for ${trip.destination}, ${trip.country}.`;

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });

        toast.success("Trip shared successfully.");
        return;
      }

      if (!navigator.clipboard) {
        throw new Error(
          "Clipboard sharing is not supported."
        );
      }

      await navigator.clipboard.writeText(shareUrl);

      toast.success(
        "Trip link copied to clipboard."
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error("Share trip error:", error);
      toast.error("Unable to share the trip.");
    } finally {
      setSharingTrip(false);
    }
  }

  async function handleFavoriteToggle() {
    if (!trip || updatingFavorite) {
      return;
    }

    const newFavoriteValue = !trip.isFavorite;

    try {
      setUpdatingFavorite(true);

      const response = await fetch(
        `/api/trips/${trip.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            isFavorite: newFavoriteValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update favorite."
        );
      }

      setTrip((currentTrip) =>
        currentTrip
          ? {
              ...currentTrip,
              isFavorite: newFavoriteValue,
            }
          : currentTrip
      );

      toast.success(
        newFavoriteValue
          ? "Trip added to favorites."
          : "Trip removed from favorites."
      );
    } catch (error) {
      console.error(
        "Favorite update error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update favorite."
      );
    } finally {
      setUpdatingFavorite(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 pt-24 dark:bg-gray-950">
        <div className="text-center">
          <LoaderCircle
            size={48}
            className="mx-auto animate-spin text-blue-600 dark:text-blue-400"
          />

          <p className="mt-4 font-medium text-gray-600 dark:text-gray-300">
            Loading trip details...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !trip) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 pt-24 dark:bg-gray-950">
        <section className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-md dark:bg-gray-900">
          <Plane
            size={52}
            className="mx-auto text-gray-300 dark:text-gray-600"
          />

          <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
            Trip unavailable
          </h1>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            {errorMessage ||
              "This trip could not be found."}
          </p>

          <Link
            href="/my-trips"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={19} />
            Back to My Trips
          </Link>
        </section>
      </main>
    );
  }

  const heroImage =
    trip.imageUrl || fallbackImage;

  const tripCountry =
    trip.country?.trim() || "India";

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/my-trips"
          className="inline-flex items-center gap-2 font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft size={19} />
          Back to My Trips
        </Link>

        <section className="relative mt-6 min-h-[390px] overflow-hidden rounded-3xl shadow-xl sm:min-h-[430px]">
          <Image
            src={heroImage}
            alt={`Travel destination: ${trip.destination}, ${tripCountry}`}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1152px"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

          <div className="relative z-10 flex min-h-[390px] flex-col justify-between p-7 text-white sm:min-h-[430px] sm:p-10">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  void handleFavoriteToggle()
                }
                disabled={updatingFavorite}
                aria-label={
                  trip.isFavorite
                    ? "Remove trip from favorites"
                    : "Add trip to favorites"
                }
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingFavorite ? (
                  <LoaderCircle
                    size={22}
                    className="animate-spin"
                  />
                ) : (
                  <Heart
                    size={24}
                    className="text-red-500"
                    fill={
                      trip.isFavorite
                        ? "#ef4444"
                        : "none"
                    }
                  />
                )}
              </button>
            </div>

            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                  <MapPin size={18} />
                  Your saved travel plan
                </p>

                <h1 className="mt-5 text-4xl font-bold capitalize drop-shadow-lg sm:text-6xl">
                  {trip.destination}
                </h1>

                <p className="mt-2 text-xl font-medium text-gray-100 drop-shadow-md">
                  {tripCountry}
                </p>

                <p className="mt-3 text-base text-gray-100 drop-shadow-md">
                  Created on{" "}
                  {formatDate(trip.createdAt)}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <HeroBadge
                    icon={
                      <CalendarDays size={17} />
                    }
                    text={`${trip.days} ${
                      trip.days === 1
                        ? "day"
                        : "days"
                    }`}
                  />

                  <HeroBadge
                    icon={
                      <CircleDollarSign
                        size={17}
                      />
                    }
                    text={formatCurrency(
                      trip.budget
                    )}
                  />

                  <HeroBadge
                    icon={<Users size={17} />}
                    text={`${trip.travelers} travelers`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:max-w-md md:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    void handleDownloadPdf()
                  }
                  disabled={downloadingPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {downloadingPdf ? (
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={19} />
                  )}

                  {downloadingPdf
                    ? "Preparing PDF..."
                    : "Download PDF"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleShareTrip()
                  }
                  disabled={sharingTrip}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sharingTrip ? (
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <Share2 size={19} />
                  )}

                  {sharingTrip
                    ? "Sharing..."
                    : "Share Trip"}
                </button>

                <Link
                  href="/#trip-form"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-black/30 px-5 py-3 font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/50"
                >
                  <Plane size={19} />
                  Plan Another Trip
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          <DetailCard
            title="Destination"
            value={trip.destination}
            icon={<MapPin size={23} />}
          />

          <DetailCard
            title="Country"
            value={tripCountry}
            icon={<MapPin size={23} />}
          />

          <DetailCard
            title="Duration"
            value={`${trip.days} ${
              trip.days === 1
                ? "day"
                : "days"
            }`}
            icon={
              <CalendarDays size={23} />
            }
          />

          <DetailCard
            title="Budget"
            value={formatCurrency(
              trip.budget
            )}
            icon={
              <CircleDollarSign size={23} />
            }
          />

          <DetailCard
            title="Travelers"
            value={trip.travelers}
            icon={<Users size={23} />}
          />

          <DetailCard
            title="Travel Style"
            value={trip.travelStyle}
            icon={<Route size={23} />}
          />

          <DetailCard
            title="Hotel"
            value={trip.hotelCategory}
            icon={<Hotel size={23} />}
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-6 dark:border-gray-800 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <CloudSun size={26} />
              </span>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Current Weather
                </h2>

                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Live conditions for{" "}
                  {trip.destination},{" "}
                  {tripCountry}
                </p>
              </div>
            </div>
          </div>

          {weatherLoading ? (
            <div className="flex min-h-64 items-center justify-center p-8">
              <div className="text-center">
                <LoaderCircle
                  size={40}
                  className="mx-auto animate-spin text-sky-600 dark:text-sky-400"
                />

                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Loading weather
                  information...
                </p>
              </div>
            </div>
          ) : weatherError ? (
            <div className="p-8 text-center">
              <CloudRain
                size={44}
                className="mx-auto text-gray-300 dark:text-gray-600"
              />

              <p className="mt-4 font-medium text-gray-600 dark:text-gray-300">
                Weather unavailable
              </p>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {weatherError}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadWeather(
                    trip.destination,
                    tripCountry
                  )
                }
                className="mt-5 rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-700"
              >
                Try Again
              </button>
            </div>
          ) : weather ? (
            <div className="p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
                <div className="rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 p-7 text-white shadow-md">
                  <p className="flex items-center gap-2 text-sky-100">
                    <MapPin size={18} />

                    {weatherLocation
                      ? `${weatherLocation.name}${
                          weatherLocation.region
                            ? `, ${weatherLocation.region}`
                            : ""
                        }${
                          weatherLocation.country
                            ? `, ${weatherLocation.country}`
                            : ""
                        }`
                      : `${trip.destination}, ${tripCountry}`}
                  </p>

                  <div className="mt-6 flex items-end gap-3">
                    <span className="text-6xl font-bold">
                      {Math.round(
                        weather.temperature
                      )}
                      °
                    </span>

                    <span className="pb-2 text-xl font-semibold">
                      C
                    </span>
                  </div>

                  <p className="mt-3 text-xl font-semibold">
                    {getWeatherDescription(
                      weather.weatherCode
                    )}
                  </p>

                  <p className="mt-2 text-sky-100">
                    Feels like{" "}
                    {Math.round(
                      weather.feelsLike
                    )}
                    °C
                  </p>

                  {weather.maximumTemperature !==
                    null &&
                    weather.minimumTemperature !==
                      null && (
                      <p className="mt-5 text-sm text-sky-100">
                        High{" "}
                        {Math.round(
                          weather.maximumTemperature
                        )}
                        ° · Low{" "}
                        {Math.round(
                          weather.minimumTemperature
                        )}
                        °
                      </p>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <WeatherCard
                    title="Humidity"
                    value={`${weather.humidity}%`}
                    icon={
                      <Droplets size={22} />
                    }
                  />

                  <WeatherCard
                    title="Wind"
                    value={`${weather.windSpeed} km/h`}
                    icon={<Wind size={22} />}
                  />

                  <WeatherCard
                    title="Cloud Cover"
                    value={`${weather.cloudCover}%`}
                    icon={
                      <CloudSun size={22} />
                    }
                  />

                  <WeatherCard
                    title="Rain Chance"
                    value={
                      weather.precipitationProbability !==
                      null
                        ? `${weather.precipitationProbability}%`
                        : "Unavailable"
                    }
                    icon={
                      <CloudRain size={22} />
                    }
                  />

                  <WeatherCard
                    title="Sunrise"
                    value={formatWeatherTime(
                      weather.sunrise
                    )}
                    icon={
                      <Sunrise size={22} />
                    }
                  />

                  <WeatherCard
                    title="Sunset"
                    value={formatWeatherTime(
                      weather.sunset
                    )}
                    icon={
                      <Sunset size={22} />
                    }
                  />
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
                Weather data provided by
                Open-Meteo
              </p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No weather information is
              available.
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Plane size={25} />
            </span>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Travel Itinerary
              </h2>

              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Your complete day-by-day
                travel plan
              </p>
            </div>
          </div>

          <div className="mt-8 whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 leading-8 text-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:p-8">
            {trip.itinerary ||
              "No itinerary is available for this trip."}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                void handleDownloadPdf()
              }
              disabled={downloadingPdf}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
            >
              {downloadingPdf ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Download size={19} />
              )}

              {downloadingPdf
                ? "Preparing PDF..."
                : "Download Itinerary PDF"}
            </button>

            <button
              type="button"
              onClick={() =>
                void handleShareTrip()
              }
              disabled={sharingTrip}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-600 px-7 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/40 sm:w-auto"
            >
              {sharingTrip ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Share2 size={19} />
              )}

              {sharingTrip
                ? "Sharing..."
                : "Share Trip"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

type HeroBadgeProps = {
  icon: ReactNode;
  text: string;
};

function HeroBadge({
  icon,
  text,
}: HeroBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
      {icon}
      {text}
    </span>
  );
}

type DetailCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
};

function DetailCard({
  title,
  value,
  icon,
}: DetailCardProps) {
  return (
    <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        {icon}
      </span>

      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <p
        className="mt-1 truncate text-lg font-bold capitalize text-gray-900 dark:text-white"
        title={value}
      >
        {value}
      </p>
    </article>
  );
}

type WeatherCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
};

function WeatherCard({
  title,
  value,
  icon,
}: WeatherCardProps) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-slate-50 p-5 dark:border-gray-700 dark:bg-gray-800">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
        {icon}
      </span>

      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </article>
  );
}