"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setUserId(user.id);
      setCreatedAt(user.created_at);
    } catch (error) {
      console.error("Load Profile Error:", error);

      setErrorMessage("Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const {
        data: { user },
        error,
      } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
        },
      });

      if (error) {
        throw error;
      }

      setName(user?.user_metadata?.full_name || name.trim());
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Update Profile Error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 pt-32 text-center">
        <p className="text-xl font-semibold text-gray-700">
          Loading profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 pb-16 pt-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <section className="rounded-3xl bg-white p-8 shadow-xl md:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-5xl">
              👤
            </div>

            <h1 className="mt-5 text-4xl font-bold text-gray-900">
              My Profile
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your personal account information.
            </p>
          </div>

          <form
            onSubmit={handleUpdateProfile}
            className="mt-10 space-y-6"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block font-semibold text-gray-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
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
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-500"
              />

              <p className="mt-2 text-sm text-gray-400">
                Email editing will be added later.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                User ID
              </label>

              <div className="break-all rounded-xl bg-gray-100 p-3 text-sm text-gray-600">
                {userId}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Account Created
              </label>

              <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString()
                  : "Not available"}
              </div>
            </div>

            {message && (
              <p className="rounded-xl bg-green-50 p-4 text-green-700">
                {message}
              </p>
            )}

            {errorMessage && (
              <p className="rounded-xl bg-red-50 p-4 text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-red-500 py-3 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
            >
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}