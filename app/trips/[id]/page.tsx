"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Download,
  Hotel,
  LoaderCircle,
  MapPin,
  Plane,
  Route,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

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
  const tripId = params.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (tripId) {
      loadTrip();
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

      setTrip(data.trip);
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
      month: "long",
      year: "numeric",
    }).format(new Date(date));
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
        if (currentY + lineHeight > pageHeight - bottomMargin) {
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
      pdf.text(trip.destination, margin, 29);

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
        [
          "Duration",
          `${trip.days} ${trip.days === 1 ? "day" : "days"}`,
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

        currentY += Math.max(8, wrappedValue.length * 6);
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
        trip.itinerary || "No itinerary is available for this trip.",
        margin,
        currentY,
        contentWidth,
        6
      );

      const pageCount = pdf.getNumberOfPages();

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        pdf.setPage(pageNumber);

        const pageHeight = pdf.internal.pageSize.getHeight();

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
        createSafeFileName(trip.destination) || "travel-plan";

      pdf.save(`${fileName}-itinerary.pdf`);

      toast.success("Trip PDF downloaded successfully.");
    } catch (error) {
      console.error("PDF download error:", error);

      toast.error("Unable to download the PDF.");
    } finally {
      setDownloadingPdf(false);
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
            {errorMessage || "This trip could not be found."}
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

        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-7 text-white shadow-lg sm:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="flex items-center gap-2 text-blue-100">
                <MapPin size={19} />
                Your saved travel plan
              </p>

              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                {trip.destination}
              </h1>

              <p className="mt-4 text-blue-100">
                Created on {formatDate(trip.createdAt)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
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

              <Link
                href="/#trip-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-md transition hover:bg-blue-50"
              >
                <Plane size={19} />
                Plan Another Trip
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <DetailCard
            title="Duration"
            value={`${trip.days} ${trip.days === 1 ? "day" : "days"}`}
            icon={<CalendarDays size={23} />}
          />

          <DetailCard
            title="Budget"
            value={formatCurrency(trip.budget)}
            icon={<CircleDollarSign size={23} />}
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

        <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Plane size={25} />
            </span>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Travel Itinerary
              </h2>

              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Your complete day-by-day travel plan
              </p>
            </div>
          </div>

          <div className="mt-8 whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 leading-8 text-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:p-8">
            {trip.itinerary || "No itinerary is available for this trip."}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleDownloadPdf}
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
          </div>
        </section>
      </div>
    </main>
  );
}

type DetailCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
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
        className="mt-1 truncate text-lg font-bold text-gray-900 dark:text-white"
        title={value}
      >
        {value}
      </p>
    </article>
  );
}