"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { TouristPlace } from "@/lib/tourist-place";

type Props = {
  countryCode: string;
  countryName: string;
  selectedPlaces: TouristPlace[];
  disabled?: boolean;
  onChange: (places: TouristPlace[]) => void;
};

function PlaceCard({
  place,
  selected,
  disabled,
  onClick,
}: {
  place: TouristPlace;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`overflow-hidden rounded-2xl border text-left transition ${
        selected
          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-950"
          : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {place.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={place.imageUrl}
          alt={place.name}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              {place.name}
            </p>

            {place.stateOrRegion && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {place.stateOrRegion}
              </p>
            )}
          </div>

          <span className="text-xl">
            {selected ? "✅" : "➕"}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {place.description}
        </p>

        {typeof place.distanceKm === "number" && (
          <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Approximately {place.distanceKm} km away
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {place.categories.slice(0, 4).map((category) => (
            <span
              key={category}
              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function GlobalTouristDestinationSelector({
  countryCode,
  countryName,
  selectedPlaces,
  disabled = false,
  onChange,
}: Props) {
  const [allPlaces, setAllPlaces] = useState<TouristPlace[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<TouristPlace[]>([]);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [message, setMessage] = useState("");

  const selectedIds = useMemo(
    () => new Set(selectedPlaces.map((place) => place.id)),
    [selectedPlaces]
  );

  const primaryPlace = selectedPlaces[0] ?? null;

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(allPlaces.flatMap((place) => place.categories))
      ).sort(),
    ],
    [allPlaces]
  );

  const visiblePlaces = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return allPlaces.filter((place) => {
      const matchesText =
        !query ||
        place.name.toLowerCase().includes(query) ||
        place.stateOrRegion.toLowerCase().includes(query) ||
        place.categories.some((item) =>
          item.toLowerCase().includes(query)
        );

      return (
        matchesText &&
        (category === "All" ||
          place.categories.includes(category))
      );
    });
  }, [allPlaces, searchText, category]);

  useEffect(() => {
    setAllPlaces([]);
    setNearbyPlaces([]);
    setSearchText("");
    setCategory("All");
    setMessage("");
    onChange([]);

    if (!countryCode || !countryName) return;

    const controller = new AbortController();

    async function loadCountryDestinations() {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          countryCode,
          countryName,
          limit: "40",
        });

        const response = await fetch(
          `/api/locations/global-tourist-destinations?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load tourist destinations."
          );
        }

        setAllPlaces(data.places ?? []);
        setMessage(data.message ?? "");
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load tourist destinations."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCountryDestinations();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, countryName]);

  useEffect(() => {
    if (!primaryPlace) {
      setNearbyPlaces([]);
      return;
    }

    const controller = new AbortController();

    async function loadNearby() {
      try {
        setLoadingNearby(true);

        const params = new URLSearchParams({
          countryCode,
          countryName,
          latitude: String(primaryPlace!.latitude),
          longitude: String(primaryPlace!.longitude),
          radiusKm: "100",
          limit: "12",
        });

        const response = await fetch(
          `/api/locations/nearby-tourist-places?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load nearby tourist places."
          );
        }

        setNearbyPlaces(
          (data.places ?? []).filter(
            (place: TouristPlace) =>
              place.id !== primaryPlace!.id
          )
        );
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load nearby tourist places."
        );
      } finally {
        setLoadingNearby(false);
      }
    }

    void loadNearby();

    return () => controller.abort();
  }, [countryCode, countryName, primaryPlace]);

  function togglePlace(place: TouristPlace) {
    if (selectedIds.has(place.id)) {
      onChange(
        selectedPlaces.filter((item) => item.id !== place.id)
      );
      return;
    }

    if (selectedPlaces.length >= 5) {
      toast.error("You can select up to 5 destinations.");
      return;
    }

    onChange([...selectedPlaces, place]);
  }

  if (!countryCode) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Select a country to automatically load its tourist destinations.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={`Search destinations in ${countryName}`}
            disabled={loading || disabled}
            className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={loading || disabled}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Destinations are loaded automatically from Wikidata.
        </p>
      </div>

      {selectedPlaces.length > 0 && (
        <div>
          <p className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            Selected destinations
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                disabled={disabled}
                onClick={() => togglePlace(place)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {place.name} ×
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
          Tourist destinations in {countryName}
        </p>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 p-8 text-center text-gray-500 dark:border-gray-700">
            Loading worldwide destination data...
          </div>
        ) : visiblePlaces.length > 0 ? (
          <div className="grid max-h-[620px] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                selected={selectedIds.has(place.id)}
                disabled={disabled}
                onClick={() => togglePlace(place)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {message ||
              "No matching destinations were returned."}
          </div>
        )}
      </div>

      {primaryPlace && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Nearby tourist places around {primaryPlace.name}
          </p>

          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
            OpenTripMap is used when available; otherwise Wikidata is used.
          </p>

          {loadingNearby ? (
            <p className="mt-4 text-sm text-gray-500">
              Finding nearby places...
            </p>
          ) : nearbyPlaces.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  selected={selectedIds.has(place.id)}
                  disabled={disabled}
                  onClick={() => togglePlace(place)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No nearby places were returned for this location.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
