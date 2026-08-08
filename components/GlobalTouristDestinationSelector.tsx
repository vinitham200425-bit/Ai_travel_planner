"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

import {
  getTouristDestinations,
  type TouristDestinationOption,
} from "@/lib/tourist-destinations";
import type { TouristPlace } from "@/lib/tourist-place";

type Props = {
  countryCode: string;
  countryName: string;
  selectedPlaces: TouristPlace[];
  disabled?: boolean;
  onChange: (places: TouristPlace[]) => void;
};

type PlacesResponse = {
  success: boolean;
  places?: TouristPlace[];
  message?: string;
};

type PlaceCardProps = {
  place: TouristPlace;
  selected: boolean;
  disabled: boolean;
  isMainDestination?: boolean;
  onClick: () => void;
};

const OTHER_VALUE = "__OTHER__";

function PlaceCard({
  place,
  selected,
  disabled,
  isMainDestination = false,
  onClick,
}: PlaceCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border transition ${
        selected
          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-950"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      }`}
    >
      {place.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={place.imageUrl}
          alt={place.name}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-gray-900 dark:text-white">
                {place.name}
              </p>

              {isMainDestination && (
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                  Main destination
                </span>
              )}
            </div>

            {place.stateOrRegion && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {place.stateOrRegion}
              </p>
            )}
          </div>

          {!isMainDestination && (
            <button
              type="button"
              disabled={disabled}
              onClick={onClick}
              aria-pressed={selected}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/60 dark:text-red-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {selected ? "Remove" : "+ Add"}
            </button>
          )}
        </div>

        {place.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {place.description}
          </p>
        )}

        {typeof place.distanceKm === "number" && (
          <p className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Approximately {Math.round(place.distanceKm)} km away
          </p>
        )}

        {place.categories?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {place.categories.slice(0, 4).map((category) => (
              <span
                key={category}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function GlobalTouristDestinationSelector({
  countryCode,
  countryName,
  selectedPlaces,
  disabled = false,
  onChange,
}: Props) {
  const [dropdownValue, setDropdownValue] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualDestination, setManualDestination] =
    useState("");
  const [resolvingDestination, setResolvingDestination] =
    useState(false);

  const [nearbyPlaces, setNearbyPlaces] = useState<TouristPlace[]>(
    []
  );
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const primaryPlace = selectedPlaces[0] ?? null;

  const selectedIds = useMemo(
    () => new Set(selectedPlaces.map((place) => place.id)),
    [selectedPlaces]
  );

  const destinationOptions = useMemo(
    () => getTouristDestinations(countryCode),
    [countryCode]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDropdownValue("");
      setManualMode(false);
      setManualDestination("");
      setNearbyPlaces([]);
      onChangeRef.current([]);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [countryCode, countryName]);

  const resolveDestination = useCallback(
    async (
      option: TouristDestinationOption | { name: string },
      fallbackToManual: boolean
    ) => {
      const name = option.name.trim();

      if (!name) {
        return;
      }

      try {
        setResolvingDestination(true);

        const params = new URLSearchParams({
          query: `${name}, ${countryName}`,
          countryCode,
        });

        const response = await fetch(
          `/api/locations/search-destinations?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data = (await response.json()) as PlacesResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to resolve this destination."
          );
        }

        const resolved = data.places?.[0];

        if (resolved) {
          onChange([resolved]);
          setDropdownValue(name);
          setNearbyPlaces([]);
          setManualMode(false);
          return;
        }

        if (!fallbackToManual) {
          throw new Error(
            `We could not locate ${name}. Please use Other / Not Listed.`
          );
        }

        const manualPlace: TouristPlace = {
          id: `manual-${Date.now()}`,
          name,
          countryCode,
          countryName,
          stateOrRegion: "",
          latitude: 0,
          longitude: 0,
          categories: ["Custom Destination"],
          description: `${name}, ${countryName}`,
          imageUrl: "",
          source: "manual",
        };

        onChange([manualPlace]);
        setDropdownValue(OTHER_VALUE);
        setNearbyPlaces([]);

        toast(
          "Destination added. Map, weather and nearby suggestions may be unavailable if the location could not be resolved."
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to select this destination."
        );
      } finally {
        setResolvingDestination(false);
      }
    },
    [countryCode, countryName, onChange]
  );

  useEffect(() => {
    if (
      !primaryPlace ||
      !countryCode ||
      !countryName ||
      primaryPlace.source === "manual"
    ) {
      const timer = window.setTimeout(() => {
        setNearbyPlaces([]);
        setNearbyLoading(false);
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }

    const controller = new AbortController();

    async function loadNearbyPlaces() {
      try {
        setNearbyLoading(true);

        const params = new URLSearchParams({
          countryCode,
          countryName,
          latitude: String(primaryPlace.latitude),
          longitude: String(primaryPlace.longitude),
          radiusKm: "120",
          limit: "20",
        });

        const response = await fetch(
          `/api/locations/nearby-tourist-places?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = (await response.json()) as PlacesResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load nearby tourist places."
          );
        }

        const results = (data.places ?? []).filter(
          (place) =>
            place.id !== primaryPlace.id &&
            place.name.toLowerCase() !==
              primaryPlace.name.toLowerCase()
        );

        setNearbyPlaces(results);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setNearbyPlaces([]);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load nearby tourist places."
        );
      } finally {
        if (!controller.signal.aborted) {
          setNearbyLoading(false);
        }
      }
    }

    void loadNearbyPlaces();

    return () => {
      controller.abort();
    };
  }, [countryCode, countryName, primaryPlace]);

  const handleDropdownChange = useCallback(
    (value: string) => {
      setDropdownValue(value);

      if (!value) {
        setManualMode(false);
        setManualDestination("");
        setNearbyPlaces([]);
        onChange([]);
        return;
      }

      if (value === OTHER_VALUE) {
        setManualMode(true);
        setManualDestination("");
        setNearbyPlaces([]);
        onChange([]);
        return;
      }

      setManualMode(false);
      setManualDestination("");

      const selectedOption = destinationOptions.find(
        (option) => option.name === value
      );

      if (!selectedOption) {
        toast.error("Unable to find the selected destination.");
        return;
      }

      void resolveDestination(selectedOption, false);
    },
    [destinationOptions, onChange, resolveDestination]
  );

  const handleManualDestination = useCallback(() => {
    const value = manualDestination.trim();

    if (value.length < 2) {
      toast.error("Please enter your destination.");
      return;
    }

    void resolveDestination(
      {
        name: value,
      },
      true
    );
  }, [manualDestination, resolveDestination]);

  const toggleNearbyPlace = useCallback(
    (place: TouristPlace) => {
      if (!primaryPlace) {
        toast.error("Please select a main destination first.");
        return;
      }

      if (selectedIds.has(place.id)) {
        onChange(
          selectedPlaces.filter(
            (selectedPlace) => selectedPlace.id !== place.id
          )
        );
        return;
      }

      if (selectedPlaces.length >= 6) {
        toast.error(
          "You can add up to 5 nearby places with the main destination."
        );
        return;
      }

      onChange([...selectedPlaces, place]);
    },
    [
      onChange,
      primaryPlace,
      selectedIds,
      selectedPlaces,
    ]
  );

  const clearMainDestination = useCallback(() => {
    setDropdownValue("");
    setManualMode(false);
    setManualDestination("");
    setNearbyPlaces([]);
    onChange([]);
  }, [onChange]);

  const removeSelectedPlace = useCallback(
    (place: TouristPlace) => {
      if (place.id === primaryPlace?.id) {
        clearMainDestination();
        return;
      }

      onChange(
        selectedPlaces.filter(
          (selectedPlace) => selectedPlace.id !== place.id
        )
      );
    },
    [
      clearMainDestination,
      onChange,
      primaryPlace?.id,
      selectedPlaces,
    ]
  );

  if (!countryCode) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-7 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Select a country before choosing your main destination.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <label
          htmlFor="main-destination"
          className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
        >
          📍 Main Destination
        </label>

        <div className="relative">
          <select
            id="main-destination"
            value={dropdownValue}
            disabled={disabled || resolvingDestination}
            onChange={(event) =>
              handleDropdownChange(event.target.value)
            }
            className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="">
              Select a tourist destination in {countryName}
            </option>

            {destinationOptions.map((option) => (
              <option key={option.name} value={option.name}>
                {option.label ?? option.name}
              </option>
            ))}

            <option value={OTHER_VALUE}>
              Other / Not Listed
            </option>
          </select>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {resolvingDestination ? "◌" : "⌄"}
          </div>
        </div>

        {destinationOptions.length === 0 && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            A curated dropdown is not available for {countryName} yet.
            Choose Other / Not Listed and enter your destination manually.
          </p>
        )}

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Select from the tourist destinations below. If the place you
          want is not listed, choose Other / Not Listed.
        </p>

        {manualMode && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <label
              htmlFor="manual-destination"
              className="block text-sm font-bold text-amber-900 dark:text-amber-100"
            >
              Enter destination manually
            </label>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="manual-destination"
                type="text"
                value={manualDestination}
                onChange={(event) =>
                  setManualDestination(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleManualDestination();
                  }
                }}
                placeholder={`Enter any tourist destination in ${countryName}`}
                disabled={disabled || resolvingDestination}
                className="min-w-0 flex-1 rounded-xl border border-amber-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 dark:border-amber-800 dark:bg-gray-900 dark:text-white"
              />

              <button
                type="button"
                disabled={disabled || resolvingDestination}
                onClick={handleManualDestination}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resolvingDestination
                  ? "Finding..."
                  : "Use Destination"}
              </button>
            </div>
          </div>
        )}
      </div>

      {primaryPlace && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              Your main destination
            </p>

            <button
              type="button"
              disabled={disabled}
              onClick={clearMainDestination}
              className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400"
            >
              Change destination
            </button>
          </div>

          <PlaceCard
            place={primaryPlace}
            selected
            disabled={disabled}
            isMainDestination
            onClick={() => undefined}
          />
        </div>
      )}

      {selectedPlaces.length > 1 && (
        <div>
          <p className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            Added to your itinerary
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedPlaces.slice(1).map((place) => (
              <button
                key={place.id}
                type="button"
                disabled={disabled}
                onClick={() => removeSelectedPlace(place)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {place.name} ×
              </button>
            ))}
          </div>
        </div>
      )}

      {primaryPlace && primaryPlace.source !== "manual" && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <div>
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-100">
              ✨ Places near {primaryPlace.name}
            </h3>

            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              Add nearby places you would like included in the AI
              itinerary.
            </p>
          </div>

          {nearbyLoading ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-white/70 p-7 text-center dark:border-amber-900 dark:bg-gray-900/50">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Finding nearby tourist places...
              </p>
            </div>
          ) : nearbyPlaces.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  selected={selectedIds.has(place.id)}
                  disabled={disabled}
                  onClick={() => toggleNearbyPlace(place)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-amber-300 p-6 text-center text-sm text-gray-600 dark:border-amber-800 dark:text-gray-300">
              No nearby suggestions were returned for this destination.
            </div>
          )}
        </section>
      )}
    </div>
  );
}