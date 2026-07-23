"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const prepareRecoverySession = async () => {
      setCheckingSession(true);
      setErrorMessage("");

      try {
        const code = searchParams.get("code");

        // PKCE recovery links return ?code=...
        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        }

        // Check whether Supabase now has a recovery session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!mounted) return;

        if (session) {
          setSessionReady(true);
        } else {
          setSessionReady(false);
          setErrorMessage(
            "Your password reset link is invalid or expired. Please request a new link."
          );
        }
      } catch (error) {
        if (!mounted) return;

        setSessionReady(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify the password reset link."
        );
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    prepareRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
        setCheckingSession(false);
        setErrorMessage("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleUpdatePassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!sessionReady) {
      setErrorMessage(
        "Your password reset session is missing. Please request a new reset link."
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

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Your password has been updated successfully."
      );

      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 sm:p-10">
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
          Create New Password
        </h1>

        {checkingSession ? (
          <div className="mt-8 rounded-xl bg-blue-50 p-4 text-center text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            Verifying your password reset link...
          </div>
        ) : (
          <form
            onSubmit={handleUpdatePassword}
            className="mt-8 space-y-6"
          >
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block font-medium text-gray-800 dark:text-gray-200"
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
                disabled={!sessionReady || loading}
                className="form-input w-full"
                placeholder="Enter at least 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block font-medium text-gray-800 dark:text-gray-200"
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
                disabled={!sessionReady || loading}
                className="form-input w-full"
                placeholder="Enter the password again"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-950/40 dark:text-red-300">
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
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        {!checkingSession && !sessionReady && (
          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Request a new reset link
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}