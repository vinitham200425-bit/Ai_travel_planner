"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  async function handleSendLoginLink(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage(
        "Please enter your registered email address."
      );
      return;
    }

    try {
      setLoading(true);

      /*
        The magic link returns directly to /set-password.

        The set-password page will:
        1. Exchange the PKCE code for a Supabase session.
        2. Allow the authenticated user to create a password.
      */
      const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

if (!siteUrl) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not configured."
  );
}

const emailRedirectTo =
  `${siteUrl}/set-password`;

console.log("Redirect URL:", emailRedirectTo);

      const { error } =
        await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            shouldCreateUser: false,
            emailRedirectTo,
          },
        });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "A secure sign-in link has been sent to your email. Open the newest link in the same browser and device to create your new password."
      );
    } catch (error) {
      console.error(
        "Unable to send magic link:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the sign-in link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 sm:p-10">
        <div className="text-center">
          <div
            aria-hidden="true"
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl dark:bg-blue-950"
          >
            ✉️
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">
            Forgot Your Password?
          </h1>

          <p className="mt-3 leading-7 text-gray-500 dark:text-gray-400">
            Enter your registered email address. We will
            send a secure sign-in link so you can create a
            new password.
          </p>
        </div>

        <form
          onSubmit={handleSendLoginLink}
          className="mt-8 space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              disabled={loading}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-xl bg-green-50 p-4 leading-6 text-green-700 dark:bg-green-950/40 dark:text-green-300"
            >
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Sending Secure Link..."
              : "Send Secure Sign-In Link"}
          </button>
        </form>

        <div className="mt-7 text-center">
          <Link
            href="/login"
            className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400"
          >
            ← Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}