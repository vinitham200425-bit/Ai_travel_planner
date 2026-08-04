"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function SetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [checkingSession, setCheckingSession] =
    useState(true);
  const [sessionReady, setSessionReady] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          throw new Error(
            "Your login link is invalid or expired. Please request a new link."
          );
        }

        if (active) {
          setSessionReady(true);
          setErrorMessage("");
        }
      } catch (error) {
        if (active) {
          setSessionReady(false);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to verify your login session."
          );
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!sessionReady) {
      setErrorMessage(
        "Your authenticated session is missing. Please request a new login link."
      );
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        throw error;
      }

      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Your new password has been created successfully. Redirecting you to login..."
      );

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1800);
    } catch (error) {
      console.error("Set password error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your new password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 sm:p-10">
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
          Create New Password
        </h1>

        <p className="mt-3 text-center text-gray-500 dark:text-gray-400">
          Create a password that you can use for future
          logins.
        </p>

        {checkingSession ? (
          <div
            role="status"
            className="mt-8 rounded-xl bg-blue-50 p-4 text-center text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          >
            Verifying your secure login session...
          </div>
        ) : (
          <form
            onSubmit={handleSetPassword}
            className="mt-8 space-y-6"
          >
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                required
                minLength={8}
                autoComplete="new-password"
                disabled={!sessionReady || loading}
                placeholder="Enter at least 8 characters"
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
              >
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
                minLength={8}
                autoComplete="new-password"
                disabled={!sessionReady || loading}
                placeholder="Enter the password again"
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
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
              disabled={!sessionReady || loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating Password..."
                : "Create New Password"}
            </button>
          </form>
        )}

        {!checkingSession && !sessionReady && (
          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Request a new login link
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}