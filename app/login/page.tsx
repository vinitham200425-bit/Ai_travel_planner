"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("Login session was not created.");
      }

      toast.success("Welcome back!");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } catch (error) {
      console.error("Login Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Login
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Sign in to plan and manage your trips.
        </p>

        <div className="mt-8">
          <label
            htmlFor="email"
            className="mb-2 block font-semibold text-gray-700"
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="password"
            className="mb-2 block font-semibold text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-3 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </main>
  );
}