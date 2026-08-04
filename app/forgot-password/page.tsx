"use client";

import Link from "next/link";
import {
  type FormEvent,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  async function handleSendMagicLink(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const redirectUrl =
        `${window.location.origin}` +
        "/auth/callback?next=/set-password";

      const { error } = await supabase.auth.signInWithOtp({
  email: normalizedEmail,
  options: {
    shouldCreateUser: false,
    emailRedirectTo: redirectUrl,
  },
});

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "A secure login link has been sent to your email. Open the link in the same browser and device, then create your new password."
      );
    } catch (error) {
      console.error("Magic-link error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the login link."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 sm:p-10">
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
          Forgot Your Password?
        </h1>

        <p className="mt-3 text-center text-gray-500 dark:text-gray-400">
          Enter your registered email. We will send you a
          secure login link so you can create a new password.
        </p>

        <form
          onSubmit={handleSendMagicLink}
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
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-950/40 dark:text-red-300"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-950/40 dark:text-green-300">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Sending Login Link..."
              : "Send Login Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}