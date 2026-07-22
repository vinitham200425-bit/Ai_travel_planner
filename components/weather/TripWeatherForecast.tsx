"use client";

import { useEffect, useMemo, useState } from "react";

export type WeatherForecastDay = {
  date: string;
  weatherCode: number;
  condition: string;
  icon: string;
  maximumTemperature: number | null;
  minimumTemperature: number | null;
  rainProbability: number | null;
  precipitation: number | null;
  maximumWindSpeed: number | null;
};

type WeatherApiResponse = {
  success: boolean;
  available?: boolean;
  reason?: string;
  message?: string;
  timezone?: string;
  forecast?: WeatherForecastDay[];
};

type Props = {
  destinationName: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
  disabled?: boolean;
  onForecastChange?: (forecast: WeatherForecastDay[]) => void;
};

function formatDisplayDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTemperature(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "--";
  }

  return `${Math.round(value)}°C`;
}

export default function TripWeatherForecast({
  destinationName,
  latitude,
  longitude,
  startDate,
  endDate,
  disabled = false,
  onForecastChange,
}: Props) {
  const [forecast, setForecast] = useState<WeatherForecastDay[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !startDate ||
      !endDate
    ) {
      setForecast([]);
      setUnavailableReason("");
      setErrorMessage("");
      onForecastChange?.([]);
      return;
    }

    const controller = new AbortController();

    async function loadForecast() {
      try {
        setLoading(true);
        setErrorMessage("");
        setUnavailableReason("");

        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          startDate,
          endDate,
        });

        const response = await fetch(
          `/api/weather/trip-forecast?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data =
          (await response.json()) as WeatherApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load weather forecast."
          );
        }

        if (!data.available) {
          setForecast([]);
          setUnavailableReason(
            data.reason ||
              "Weather forecast is unavailable for these dates."
          );
          onForecastChange?.([]);
          return;
        }

        const nextForecast = data.forecast ?? [];

        setForecast(nextForecast);
        onForecastChange?.(nextForecast);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setForecast([]);
        onForecastChange?.([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load weather forecast."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadForecast();

    return () => controller.abort();
  }, [
    latitude,
    longitude,
    startDate,
    endDate,
    onForecastChange,
  ]);

  const advisory = useMemo(() => {
    if (forecast.length === 0) {
      return null;
    }

    const rainyDays = forecast.filter(
      (day) =>
        (day.rainProbability ?? 0) >= 50 ||
        [
          51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81,
          82, 95, 96, 99,
        ].includes(day.weatherCode)
    );

    const hotDays = forecast.filter(
      (day) => (day.maximumTemperature ?? 0) >= 34
    );

    const coldDays = forecast.filter(
      (day) => (day.minimumTemperature ?? 100) <= 12
    );

    if (rainyDays.length > 0) {
      return {
        icon: "☔",
        title: "Rain may affect your trip",
        message: `${rainyDays.length} day${
          rainyDays.length > 1 ? "s have" : " has"
        } a possibility of rain. Carry an umbrella and keep indoor alternatives ready.`,
      };
    }

    if (hotDays.length > 0) {
      return {
        icon: "☀️",
        title: "Hot weather expected",
        message:
          "Carry water, sunscreen and plan demanding outdoor activities during the morning.",
      };
    }

    if (coldDays.length > 0) {
      return {
        icon: "🧥",
        title: "Cool weather expected",
        message:
          "Carry warm clothing, especially for mornings and evenings.",
      };
    }

    return {
      icon: "✅",
      title: "Weather looks suitable",
      message:
        "The current forecast does not show major weather concerns.",
    };
  }, [forecast]);

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return null;
  }

  if (!startDate || !endDate) {
    return (
      <section className="mt-10 rounded-2xl border border-dashed border-sky-300 bg-sky-50 p-6 text-center dark:border-sky-900 dark:bg-sky-950/20">
        <p className="font-semibold text-sky-900 dark:text-sky-200">
          🌦️ Select your travel dates to view the forecast for{" "}
          {destinationName}.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-5 dark:border-sky-900 dark:from-sky-950/30 dark:to-blue-950/20 sm:p-7">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🌦️ Weather forecast for {destinationName}
        </h3>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Forecast based on your selected travel dates.
        </p>
      </div>

      {loading && (
        <div className="mt-5 rounded-2xl bg-white/80 p-8 text-center dark:bg-gray-900/70">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Checking the weather...
          </p>
        </div>
      )}

      {!loading && unavailableReason && (
        <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            📅 Forecast not available yet
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-300">
            {unavailableReason}
          </p>
        </div>
      )}

      {!loading && errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <p className="font-semibold text-red-800 dark:text-red-300">
            Unable to retrieve weather
          </p>

          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
            {errorMessage}
          </p>
        </div>
      )}

      {!loading && forecast.length > 0 && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {forecast.map((day) => (
              <article
                key={day.date}
                className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {formatDisplayDate(day.date)}
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl">{day.icon}</span>

                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatTemperature(
                        day.maximumTemperature
                      )}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Low{" "}
                      {formatTemperature(
                        day.minimumTemperature
                      )}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                  {day.condition}
                </p>

                <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p>
                    ☔ Rain chance:{" "}
                    {day.rainProbability === null
                      ? "--"
                      : `${Math.round(
                          day.rainProbability
                        )}%`}
                  </p>

                  <p>
                    💨 Wind:{" "}
                    {day.maximumWindSpeed === null
                      ? "--"
                      : `${Math.round(
                          day.maximumWindSpeed
                        )} km/h`}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {advisory && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-white/80 p-5 dark:border-blue-900 dark:bg-gray-900/70">
              <p className="font-bold text-gray-900 dark:text-white">
                {advisory.icon} {advisory.title}
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {advisory.message}
              </p>
            </div>
          )}
        </>
      )}

      {disabled && (
        <p className="mt-3 text-xs text-gray-500">
          Forecast editing is disabled while the itinerary is being
          generated.
        </p>
      )}
    </section>
  );
}