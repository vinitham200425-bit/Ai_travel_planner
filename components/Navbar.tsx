"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map,
  Menu,
  Plane,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (
  error &&
  error.message !== "Auth session missing!"
) {
  console.error("Unable to load user:", error.message);
}

        if (active) {
          setUser(currentUser ?? null);
        }
      } catch (error) {
        console.error("Unable to load user:", error);

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);

      toast.success("Logged out successfully.");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to log out."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  function closeMenus() {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }

  function goToLogin() {
    closeMenus();
    router.push("/login");
  }

  function goToSignup() {
    closeMenus();
    router.push("/signup");
  }

  const userEmail = user?.email ?? "";

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    userEmail.split("@")[0] ||
    "Traveller";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-xl transition-colors dark:border-gray-800 dark:bg-gray-950/90">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMenus}
          className="flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
            <Plane size={23} />
          </span>

          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              AI Travel Planner
            </p>

            <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
              Plan smarter. Travel better.
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <NavLink href="/#home">Home</NavLink>
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/#pricing">Pricing</NavLink>
          <NavLink href="/#contact">Contact</NavLink>

          {user && (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/my-trips">My Trips</NavLink>
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          {authLoading && (
            <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
          )}

          {!authLoading && !user && (
            <>
              <button
                type="button"
                onClick={goToLogin}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <LogIn size={18} />
                Login
              </button>

              <button
                type="button"
                onClick={goToSignup}
                className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Sign Up
              </button>
            </>
          )}

          {!authLoading && user && (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen((current) => !current)
                }
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white">
                  {avatarLetter}
                </span>

                <span className="max-w-32 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {displayName}
                </span>

                <ChevronDown
                  size={17}
                  className={`text-gray-500 transition-transform ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {displayName}
                    </p>

                    <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                      {userEmail}
                    </p>
                  </div>

                  <div className="py-2">
                    <DropdownLink
                      href="/dashboard"
                      icon={<LayoutDashboard size={18} />}
                    >
                      Dashboard
                    </DropdownLink>

                    <DropdownLink
                      href="/my-trips"
                      icon={<Map size={18} />}
                    >
                      My Trips
                    </DropdownLink>

                    <DropdownLink
                      href="/profile"
                      icon={<UserCircle size={18} />}
                    >
                      Profile
                    </DropdownLink>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950/40"
                  >
                    <LogOut size={18} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((current) => !current)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-5 shadow-lg dark:border-gray-800 dark:bg-gray-950 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-2">
            <MobileNavLink href="/#home" onClick={closeMenus}>
              Home
            </MobileNavLink>

            <MobileNavLink href="/#features" onClick={closeMenus}>
              Features
            </MobileNavLink>

            <MobileNavLink href="/#pricing" onClick={closeMenus}>
              Pricing
            </MobileNavLink>

            <MobileNavLink href="/#contact" onClick={closeMenus}>
              Contact
            </MobileNavLink>

            {user && (
              <>
                <MobileNavLink
                  href="/dashboard"
                  onClick={closeMenus}
                >
                  Dashboard
                </MobileNavLink>

                <MobileNavLink
                  href="/my-trips"
                  onClick={closeMenus}
                >
                  My Trips
                </MobileNavLink>

                <MobileNavLink
                  href="/profile"
                  onClick={closeMenus}
                >
                  Profile
                </MobileNavLink>
              </>
            )}

            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
              {authLoading && (
                <div className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
              )}

              {!authLoading && !user && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <LogIn size={18} />
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={goToSignup}
                    className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {!authLoading && user && (
                <div>
                  <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white">
                      {avatarLetter}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">
                        {displayName}
                      </p>

                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={18} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

type NavLinkProps = {
  href: string;
  children: ReactNode;
};

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="font-medium text-gray-600 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
    >
      {children}
    </Link>
  );
}

type MobileNavLinkProps = {
  href: string;
  children: ReactNode;
  onClick: () => void;
};

function MobileNavLink({
  href,
  children,
  onClick,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-blue-400"
    >
      {children}
    </Link>
  );
}

type DropdownLinkProps = {
  href: string;
  icon: ReactNode;
  children: ReactNode;
};

function DropdownLink({
  href,
  icon,
  children,
}: DropdownLinkProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 rounded-xl px-3 py-3 font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      <span className="text-blue-600 dark:text-blue-400">
        {icon}
      </span>

      {children}
    </Link>
  );
}