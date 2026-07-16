"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
      setCheckingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLoggedIn(Boolean(session));
    } catch (error) {
      console.error("Navbar Session Error:", error);
      setLoggedIn(false);
    } finally {
      setCheckingSession(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setLoggedIn(false);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="fixed left-0 top-0 z-50 w-full bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <Link
          href="/"
          className="text-3xl font-bold text-blue-600"
        >
          ✈️ AI Travel Planner
        </Link>

        <div className="hidden items-center gap-7 text-lg md:flex">
          <Link
            href="/"
            className="transition hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="/#features"
            className="transition hover:text-blue-600"
          >
            Features
          </Link>

          <Link
            href="/#pricing"
            className="transition hover:text-blue-600"
          >
            Pricing
          </Link>

          <Link
            href="/#contact"
            className="transition hover:text-blue-600"
          >
            Contact
          </Link>

          {!checkingSession && loggedIn && (
            <>
              <Link
                href="/dashboard"
                className="transition hover:text-blue-600"
              >
                Dashboard
              </Link>

              <Link
                href="/my-trips"
                className="transition hover:text-blue-600"
              >
                My Trips
              </Link>

              <Link
                href="/profile"
                className="transition hover:text-blue-600"
              >
                Profile
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={loggedIn ? "/#trip-form" : "/login"}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
          >
            Generate Trip
          </Link>

          {!checkingSession &&
            (loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-500 px-5 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-blue-600 px-5 py-2 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="rounded-xl bg-green-600 px-5 py-2 text-white transition hover:bg-green-700"
                >
                  Sign Up
                </Link>
              </>
            ))}
        </div>
      </div>
    </nav>
  );
}