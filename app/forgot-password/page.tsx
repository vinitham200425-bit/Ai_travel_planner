"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setErrorMessage("");

      const redirectUrl = `${window.location.origin}/reset-password`;

const { error } = await supabase.auth.resetPasswordForEmail(
  email,
  {
    redirectTo: redirectUrl,
  }
);

      if (error) {
        throw error;
      }

      setMessage(
        "Password reset email sent. Please check your inbox and spam folder."
      );
      setEmail("");
    } catch (error) {
      console.error("Password Reset Request Error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-20">
      <div className="mx-auto mt-12 max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Forgot Password
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Enter your registered email address. We will send you a password
          reset link.
        </p>

        <form onSubmit={handleResetRequest} className="mt-8">
          <label
            htmlFor="email"
            className="mb-2 block font-semibold text-gray-700"
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {message && (
            <p className="mt-4 rounded-xl bg-green-50 p-3 text-green-700">
              {message}
            </p>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}