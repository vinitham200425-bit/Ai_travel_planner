"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Map,
  UserRound,
} from "lucide-react";

type ProfileDropdownProps = {
  name: string;
  email: string;
  onLogout: () => Promise<void>;
};

export default function ProfileDropdown({
  name,
  email,
  onLogout,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = name.trim() || email.split("@")[0] || "Traveler";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogoutClick() {
    try {
      setLoggingOut(true);
      setOpen(false);
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 pr-3 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          {initial}
        </span>

        <span className="hidden max-w-28 truncate text-sm font-semibold text-gray-700 lg:block">
          {displayName}
        </span>

        <ChevronDown
          size={17}
          className={`text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="border-b border-gray-100 px-5 py-4">
            <p className="truncate font-semibold text-gray-900">
              {displayName}
            </p>

            <p className="mt-1 truncate text-sm text-gray-500">{email}</p>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </Link>

            <Link
              href="/my-trips"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <Map size={19} />
              My Trips
            </Link>

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <UserRound size={19} />
              Profile
            </Link>
          </div>

          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              onClick={handleLogoutClick}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={19} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}