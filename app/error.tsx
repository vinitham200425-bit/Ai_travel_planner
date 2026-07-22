"use client";

import {
  AlertTriangle,
  Home,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-20 dark:bg-gray-950">
      <section className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <AlertTriangle size={38} />
        </div>

        <h1 className="mt-7 text-4xl font-black text-gray-900 dark:text-white">
          Something went wrong
        </h1>

        <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
          We were unable to complete your request. Please try again or
          return to the home page.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700"
          >
            <RefreshCw size={19} />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-7 py-4 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Home size={19} />
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}