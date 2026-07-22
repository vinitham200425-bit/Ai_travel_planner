import {
  formatDistance,
  formatDuration,
} from "@/lib/map";
import type { RouteData } from "@/types/map";

type Props = {
  route: RouteData | null;
  loading: boolean;
  warning?: string;
};

export default function RouteSummary({
  route,
  loading,
  warning,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 p-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Calculating the route, distance and travel time...
      </div>
    );
  }

  if (!route) return null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-950 dark:bg-blue-950/30">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total distance
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatDistance(route.distanceMeters)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estimated driving time
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatDuration(route.durationSeconds)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Route source
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {route.source === "osrm"
              ? "Road route"
              : "Approximate route"}
          </p>
        </div>
      </div>

      {warning && (
        <p className="mt-4 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          {warning}
        </p>
      )}

      {route.legs.length > 0 && (
        <div className="mt-5 space-y-3">
          {route.legs.map((leg, index) => (
            <div
              key={`${leg.from}-${leg.to}-${index}`}
              className="flex flex-col justify-between gap-1 rounded-xl bg-white px-4 py-3 dark:bg-gray-900 sm:flex-row sm:items-center"
            >
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {index + 1}. {leg.from} → {leg.to}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formatDistance(leg.distanceMeters)} ·{" "}
                {formatDuration(leg.durationSeconds)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
