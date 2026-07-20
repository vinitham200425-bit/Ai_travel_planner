"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

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
      setCreatedAt(user.created_at || "");
    } catch (error) {
      console.error("Load profile error:", error);
      setProfileError("Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!name.trim()) {
      setProfileError("Please enter your full name.");
      return;
    }

    try {
      setSavingProfile(true);

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
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Update profile error:", error);

      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated successfully.");
    } catch (error) {
      console.error("Change password error:", error);

      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to update your password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6 dark:bg-gray-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

          <p className="mt-5 text-lg font-semibold text-gray-700 dark:text-gray-200">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 pb-16 pt-28 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900 sm:p-8 md:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-5xl dark:bg-blue-950">
                👤
              </div>

              <h1 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Manage your account information and password.
              </p>
            </div>

            <form
              onSubmit={handleUpdateProfile}
              className="mt-10 space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

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
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 p-3 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />

                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Your email address cannot be changed from this page.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-700 dark:text-gray-200">
                  Account Created
                </label>

                <div className="rounded-xl bg-gray-100 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {createdAt
                    ? new Date(createdAt).toLocaleDateString(
                        undefined,
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "Not available"}
                </div>
              </div>

              {profileMessage && (
                <p className="rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-950 dark:text-green-300">
                  {profileMessage}
                </p>
              )}

              {profileError && (
                <p className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {profileError}
                </p>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:hover:bg-blue-500"
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Profile"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900 sm:p-8 md:p-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Change Password
              </h2>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Enter a new password for your account.
              </p>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="mt-8 space-y-6"
            >
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={
                      showNewPassword ? "text" : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 pr-20 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (currentValue) => !currentValue
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 pr-20 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (currentValue) => !currentValue
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your password must contain at least 8 characters.
              </p>

              {passwordMessage && (
                <p className="rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-950 dark:text-green-300">
                  {passwordMessage}
                </p>
              )}

              {passwordError && (
                <p className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-300">
                  {passwordError}
                </p>
              )}

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {changingPassword
                  ? "Updating Password..."
                  : "Update Password"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-xl dark:border-red-900 dark:bg-gray-900 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Account Session
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Sign out from your current account.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 w-full rounded-xl border border-red-500 py-3 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
            >
              Logout
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}