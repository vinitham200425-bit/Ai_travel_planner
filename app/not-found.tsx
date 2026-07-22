import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Home,
  MapPinOff,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-20 dark:bg-gray-950">
      <section className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          <MapPinOff size={46} />
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
          Error 404
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          This destination could not be found
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-400">
          The page may have been moved, deleted or the address may be
          incorrect. Return home and continue planning your next trip.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            <Home size={19} />
            Return Home
          </Link>

          <Link
            href="/#trip-form"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-7 py-4 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Compass size={19} />
            Plan a Trip
          </Link>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={17} />
          Back to AI Travel Planner
        </Link>
      </section>
    </main>
  );
}