"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { recoverySupabase } from "@/lib/supabase-recovery";

export default function SetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [sessionReady, setSessionReady] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    let active = true;

    const finishChecking = window.setTimeout(
      async () => {
        try {
          const {
            data: { session },
            error,
          } =
            await recoverySupabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (!active) {
            return;
          }

          if (!session) {
            setSessionReady(false);
            setErrorMessage(
              "Your secure sign-in link is invalid or expired. Please request a new link."
            );
            return;
          }

          setSessionReady(true);
          setErrorMessage("");

          /*
            Remove authentication tokens from the
            visible browser address after Supabase
            has processed them.
          */
          window.history.replaceState(
            {},
            document.title,
            "/set-password"
          );
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Recovery session error:",
            error
          );

          setSessionReady(false);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to verify your secure sign-in link."
          );
        } finally {
          if (active) {
            setCheckingSession(false);
          }
        }
      },
      500
    );

    const {
      data: { subscription },
    } =
      recoverySupabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!active || !session) {
            return;
          }

          setSessionReady(true);
          setCheckingSession(false);
          setErrorMessage("");

          window.history.replaceState(
            {},
            document.title,
            "/set-password"
          );
        }
      );

    return () => {
      active = false;
      window.clearTimeout(finishChecking);
      subscription.unsubscribe();
    };
  }, []);

  async function handleCreatePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!sessionReady) {
      setErrorMessage(
        "Your secure login session is missing. Please request a new sign-in link."
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage(
        "Please enter and confirm your new password."
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
      setErrorMessage(
        "The passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await recoverySupabase.auth.updateUser({
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

      /*
        Sign out the temporary magic-link
        recovery session.
      */
      await recoverySupabase.auth.signOut();

      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1800);
    } catch (error) {
      console.error(
        "Create-password error:",
        error
      );

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
        <div className="text-center">
          <div
            aria-hidden="true"
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl dark:bg-blue-950"
          >
            🔐
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">
            Create New Password
          </h1>

          <p className="mt-3 leading-7 text-gray-500 dark:text-gray-400">
            Create a secure password that you can
            use for future logins.
          </p>
        </div>

        {checkingSession ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-8 rounded-xl bg-blue-50 p-5 text-center text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <div
              aria-hidden="true"
              className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-300"
            />

            <p className="mt-3">
              Verifying your secure sign-in link...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleCreatePassword}
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
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={
                    !sessionReady || loading
                  }
                  placeholder="Enter at least 8 characters"
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 pr-20 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (current) => !current
                    )
                  }
                  disabled={
                    !sessionReady || loading
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400"
                >
                  {showNewPassword
                    ? "Hide"
                    : "Show"}
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
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={
                    !sessionReady || loading
                  }
                  placeholder="Enter the password again"
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 pr-20 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={
                    !sessionReady || loading
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400"
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your password must contain at least
              8 characters.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 p-4 leading-6 text-red-700 dark:bg-red-950/40 dark:text-red-300"
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
              disabled={
                !sessionReady || loading
              }
              className="w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating Password..."
                : "Create New Password"}
            </button>
          </form>
        )}

        {!checkingSession &&
          !sessionReady && (
            <div className="mt-7 text-center">
              <Link
                href="/forgot-password"
                className="font-semibold text-blue-600 transition hover:underline dark:text-blue-400"
              >
                Request a new secure sign-in link
              </Link>
            </div>
          )}
      </section>
    </main>
  );
}