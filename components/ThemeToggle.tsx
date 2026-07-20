"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Loading theme"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800"
      >
        <Sun size={19} />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      title={isDark ? "Light mode" : "Dark mode"}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700"
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}