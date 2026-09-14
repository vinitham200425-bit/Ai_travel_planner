"use client";

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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";

import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isHomePage = pathname === "/";

  const closeMenus = useCallback(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, []);

  const goToLogin = useCallback(() => {
    closeMenus();
    router.push("/login");
  }, [closeMenus, router]);

  const goToSignup = useCallback(() => {
    closeMenus();
    router.push("/signup");
  }, [closeMenus, router]);

  const handleLogout = useCallback(async () => {
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
      closeMenus();

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
  }, [closeMenus, loggingOut, router]);

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
          console.error(
            "Unable to load user:",
            error.message
          );
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

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setUser(session?.user ?? null);
          setAuthLoading(false);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscapeKey
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscapeKey
      );
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      closeMenus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [closeMenus, pathname]);

  const userEmail = user?.email ?? "";

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    userEmail.split("@")[0] ||
    "Traveller";

  const avatarLetter =
    displayName.charAt(0).toUpperCase() || "T";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isHomePage
          ? "border-b border-white/10 bg-black/10 backdrop-blur-md"
          : "border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90"
      }`}
    >
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMenus}
          className="flex items-center gap-3"
          aria-label="AI Travel Planner home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
            <Plane
              size={23}
              aria-hidden="true"
            />
          </span>

          <div>
            <p
              className={`text-xl font-bold ${
                isHomePage
                  ? "text-white"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              AI Travel Planner
            </p>

            <p
              className={`hidden text-xs sm:block ${
                isHomePage
                  ? "text-white/75"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Plan smarter. Travel better.
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-7 lg:flex">
          <NavLink
            href="/#home"
            isHomePage={isHomePage}
          >
            Home
          </NavLink>

          <NavLink
            href="/#features"
            isHomePage={isHomePage}
          >
            Features
          </NavLink>

          <NavLink
            href="/#pricing"
            isHomePage={isHomePage}
          >
            Pricing
          </NavLink>

          <NavLink
            href="/#contact"
            isHomePage={isHomePage}
          >
            Contact
          </NavLink>

          {user && (
            <>
              <NavLink
                href="/dashboard"
                isHomePage={isHomePage}
              >
                Dashboard
              </NavLink>

              <NavLink
                href="/my-trips"
                isHomePage={isHomePage}
              >
                My Trips
              </NavLink>
            </>
          )}
        </div>

        {/* DESKTOP ACCOUNT AREA */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          {authLoading && (
            <div
              className={`h-10 w-28 animate-pulse rounded-xl ${
                isHomePage
                  ? "bg-white/20"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
              aria-label="Loading account"
            />
          )}

          {!authLoading && !user && (
            <>
              <button
                type="button"
                onClick={goToLogin}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition ${
                  isHomePage
                    ? "text-white hover:bg-white/15"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <LogIn
                  size={18}
                  aria-hidden="true"
                />
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
            <div
              ref={profileMenuRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen(
                    (current) => !current
                  )
                }
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2 transition ${
                  isHomePage
                    ? "border-white/20 bg-white/10 hover:bg-white/20"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                }`}
                aria-label="Open user menu"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                aria-controls="profile-menu"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white">
                  {avatarLetter}
                </span>

                <span
                  className={`max-w-32 truncate text-sm font-semibold ${
                    isHomePage
                      ? "text-white"
                      : "text-gray-800 dark:text-gray-100"
                  }`}
                >
                  {displayName}
                </span>

                <ChevronDown
                  size={17}
                  aria-hidden="true"
                  className={`transition-transform ${
                    isHomePage
                      ? "text-white/80"
                      : "text-gray-500"
                  } ${
                    profileMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {profileMenuOpen && (
                <div
                  id="profile-menu"
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
                      icon={
                        <LayoutDashboard
                          size={18}
                          aria-hidden="true"
                        />
                      }
                    >
                      Dashboard
                    </DropdownLink>

                    <DropdownLink
                      href="/my-trips"
                      icon={
                        <Map
                          size={18}
                          aria-hidden="true"
                        />
                      }
                    >
                      My Trips
                    </DropdownLink>

                    <DropdownLink
                      href="/profile"
                      icon={
                        <UserCircle
                          size={18}
                          aria-hidden="true"
                        />
                      }
                    >
                      Profile
                    </DropdownLink>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleLogout()
                    }
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950/40"
                  >
                    <LogOut
                      size={18}
                      aria-hidden="true"
                    />

                    {loggingOut
                      ? "Logging out..."
                      : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current
              )
            }
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              isHomePage
                ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X
                size={22}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={22}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className={`border-t px-4 py-5 shadow-lg lg:hidden ${
            isHomePage
              ? "border-white/10 bg-black/80 backdrop-blur-xl"
              : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
          }`}
        >
          <div className="mx-auto max-w-7xl space-y-2">
            <MobileNavLink
              href="/#home"
              onClick={closeMenus}
              isHomePage={isHomePage}
            >
              Home
            </MobileNavLink>

            <MobileNavLink
              href="/#features"
              onClick={closeMenus}
              isHomePage={isHomePage}
            >
              Features
            </MobileNavLink>

            <MobileNavLink
              href="/#pricing"
              onClick={closeMenus}
              isHomePage={isHomePage}
            >
              Pricing
            </MobileNavLink>

            <MobileNavLink
              href="/#contact"
              onClick={closeMenus}
              isHomePage={isHomePage}
            >
              Contact
            </MobileNavLink>

            {user && (
              <>
                <MobileNavLink
                  href="/dashboard"
                  onClick={closeMenus}
                  isHomePage={isHomePage}
                >
                  Dashboard
                </MobileNavLink>

                <MobileNavLink
                  href="/my-trips"
                  onClick={closeMenus}
                  isHomePage={isHomePage}
                >
                  My Trips
                </MobileNavLink>

                <MobileNavLink
                  href="/profile"
                  onClick={closeMenus}
                  isHomePage={isHomePage}
                >
                  Profile
                </MobileNavLink>
              </>
            )}

            <div
              className={`mt-4 border-t pt-4 ${
                isHomePage
                  ? "border-white/10"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {authLoading && (
                <div
                  className={`h-12 animate-pulse rounded-xl ${
                    isHomePage
                      ? "bg-white/20"
                      : "bg-gray-200 dark:bg-gray-800"
                  }`}
                  aria-label="Loading account"
                />
              )}

              {!authLoading && !user && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${
                      isHomePage
                        ? "border-white/30 text-white hover:bg-white/10"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <LogIn
                      size={18}
                      aria-hidden="true"
                    />
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
                  <div
                    className={`mb-4 flex items-center gap-3 rounded-2xl p-3 ${
                      isHomePage
                        ? "bg-white/10"
                        : "bg-gray-50 dark:bg-gray-900"
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white">
                      {avatarLetter}
                    </span>

                    <div className="min-w-0">
                      <p
                        className={`truncate font-semibold ${
                          isHomePage
                            ? "text-white"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {displayName}
                      </p>

                      <p
                        className={`truncate text-sm ${
                          isHomePage
                            ? "text-white/70"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleLogout()
                    }
                    disabled={loggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut
                      size={18}
                      aria-hidden="true"
                    />

                    {loggingOut
                      ? "Logging out..."
                      : "Logout"}
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
  isHomePage: boolean;
};

function NavLink({
  href,
  children,
  isHomePage,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`font-medium transition ${
        isHomePage
          ? "text-white/90 hover:text-white"
          : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
      }`}
    >
      {children}
    </Link>
  );
}

type MobileNavLinkProps = {
  href: string;
  children: ReactNode;
  onClick: () => void;
  isHomePage: boolean;
};

function MobileNavLink({
  href,
  children,
  onClick,
  isHomePage,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-xl px-4 py-3 font-medium transition ${
        isHomePage
          ? "text-white hover:bg-white/10"
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-blue-400"
      }`}
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