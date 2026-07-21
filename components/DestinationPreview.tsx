"use client";

type WeatherPreview = {
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode?: number;
  description: string;
  icon: string;
  units: {
    temperature: string;
    apparentTemperature: string;
    humidity: string;
    windSpeed: string;
  };
};

export type DestinationPreviewData = {
  destination: string;
  country: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  imageUrl: string | null;
  wikipediaUrl: string | null;
  weather: WeatherPreview | null;
  bestSeason: {
    months: string;
    note: string;
  };
};

type DestinationPreviewProps = {
  preview: DestinationPreviewData | null;
  loading: boolean;
  error: string;
};

export default function DestinationPreview({
  preview,
  loading,
  error,
}: DestinationPreviewProps) {
  if (loading) {
    return (
      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-4 p-6">
          <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <p className="font-semibold">
          Destination preview unavailable
        </p>

        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-cyan-500 sm:h-80">
        {preview.imageUrl ? (
          <img
            src={preview.imageUrl}
            alt={`${preview.destination}, ${preview.country}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white">
              <span className="text-6xl">🌍</span>

              <p className="mt-3 text-2xl font-bold">
                {preview.destination}
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-sm font-medium uppercase tracking-wider text-white/80">
            Selected destination
          </p>

          <h3 className="mt-1 text-3xl font-bold sm:text-4xl">
            {preview.destination}
          </h3>

          <p className="mt-1 text-white/90">
            📍 {preview.country}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <p className="leading-7 text-gray-600 dark:text-gray-300">
          {preview.description}
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/40">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              🌡 Current weather
            </p>

            {preview.weather ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl">
                    {preview.weather.icon}
                  </span>

                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {preview.weather.temperature}
                      {
                        preview.weather.units
                          .temperature
                      }
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {preview.weather.description}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Feels like{" "}
                  {
                    preview.weather
                      .apparentTemperature
                  }
                  {
                    preview.weather.units
                      .apparentTemperature
                  }
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Weather information is currently unavailable.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-green-50 p-5 dark:bg-green-950/40">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">
              📅 General best season
            </p>

            <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
              {preview.bestSeason.months}
            </p>

            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {preview.bestSeason.note}
            </p>
          </div>

          <div className="rounded-2xl bg-purple-50 p-5 sm:col-span-2 lg:col-span-1 dark:bg-purple-950/40">
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              🧭 Location
            </p>

            <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">
              Latitude:{" "}
              {preview.latitude.toFixed(4)}
            </p>

            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
              Longitude:{" "}
              {preview.longitude.toFixed(4)}
            </p>

            {preview.wikipediaUrl && (
              <a
                href={preview.wikipediaUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-purple-700 hover:underline dark:text-purple-300"
              >
                Read more about this destination ↗
              </a>
            )}
          </div>
        </div>

        {preview.weather && (
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-700">
              💧 Humidity:{" "}
              {preview.weather.humidity}
              {preview.weather.units.humidity}
            </span>

            <span className="rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-700">
              💨 Wind:{" "}
              {preview.weather.windSpeed}
              {" "}
              {preview.weather.units.windSpeed}
            </span>
          </div>
        )}

        <p className="mt-5 text-xs text-gray-400">
          The best-season suggestion is a general regional
          guide. Local weather and peak seasons can vary.
        </p>
      </div>
    </div>
  );
}