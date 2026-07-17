"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        toast.success("Account created successfully!");

        router.push("/dashboard");
        router.refresh();
        return;
      }

      toast.success(
        "Account created. Please confirm your email before logging in."
      );

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Signup Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-16">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Sign up to create and save travel plans.
        </p>

        <div className="mt-8">
          <label
            htmlFor="name"
            className="mb-2 block font-semibold text-gray-700"
          >
            Full Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-5">
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
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="confirmPassword"
            className="mb-2 block font-semibold text-gray-700"
          >
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-6 text-center text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}