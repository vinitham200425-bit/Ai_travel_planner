import {
  LoaderCircle,
  Plane,
} from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-950">
      <div className="text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <LoaderCircle
            size={88}
            className="animate-spin text-blue-200 dark:text-blue-950"
          />

          <span className="absolute flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <Plane size={27} />
          </span>
        </div>

        <h2 className="mt-7 text-2xl font-bold text-gray-900 dark:text-white">
          Preparing your journey
        </h2>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please wait a moment…
        </p>
      </div>
    </main>
  );
}