"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import type { TouristPlace } from "@/lib/tourist-place";

type Props = {
  countryCode: string;
  countryName: string;
  selectedPlaces: TouristPlace[];
  disabled?: boolean;
  onChange: (places: TouristPlace[]) => void;
};

type SearchResponse = {
  success: boolean;
  places?: TouristPlace[];
  message?: string;
};

type NearbyResponse = {
  success: boolean;
  places?: TouristPlace[];
  message?: string;
};

function PlaceCard({
  place,
  selected,
  disabled,
  isMainDestination = false,
  onClick,
}: {
  place: TouristPlace;
  selected: boolean;
  disabled: boolean;
  isMainDestination?: boolean;
  onClick: () => void;
}) {
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
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<TouristPlace[]>(
    []
  );
  const [nearbyPlaces, setNearbyPlaces] = useState<TouristPlace[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const primaryPlace = selectedPlaces[0] ?? null;

  const selectedIds = useMemo(
    () => new Set(selectedPlaces.map((place) => place.id)),
    [selectedPlaces]
  );

  /*
   * Clear the selected destination whenever the country changes.
   */
  useEffect(() => {
    setSearchText("");
    setSuggestions([]);
    setNearbyPlaces([]);
    setSearchMessage("");
    setShowSuggestions(false);
    onChange([]);

    // onChange is intentionally excluded because it is recreated
    // by the parent component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, countryName]);

  /*
   * Close autocomplete when the user clicks outside the search area.
   */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * Search destinations after a short delay.
   */
  useEffect(() => {
    const query = searchText.trim();

    if (
      !countryCode ||
      query.length < 2 ||
      primaryPlace?.name === query
    ) {
      setSuggestions([]);
      setSearchMessage("");
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchMessage("");

        const params = new URLSearchParams({
          query,
          countryCode,
        });

        const response = await fetch(
          `/api/locations/search-destinations?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = (await response.json()) as SearchResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to search destinations."
          );
        }

        const places = data.places ?? [];

        setSuggestions(places);
        setShowSuggestions(true);

        if (places.length === 0) {
          setSearchMessage(
            `No destinations found for "${query}".`
          );
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setSuggestions([]);
        setSearchMessage(
          error instanceof Error
            ? error.message
            : "Unable to search destinations."
        );
      } finally {
        setSearchLoading(false);
      }
    }, 700);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [countryCode, searchText, primaryPlace?.name]);

  /*
   * Load nearby trip options when the main destination is selected.
   */
  useEffect(() => {
    if (!primaryPlace || !countryCode || !countryName) {
      setNearbyPlaces([]);
      return;
    }

    const controller = new AbortController();

    async function loadNearbyPlaces() {
      try {
        setNearbyLoading(true);

        const params = new URLSearchParams({
          countryCode,
          countryName,
          latitude: String(primaryPlace!.latitude),
          longitude: String(primaryPlace!.longitude),
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

        const data = (await response.json()) as NearbyResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load nearby tourist places."
          );
        }

        const results = (data.places ?? []).filter(
          (place) =>
            place.id !== primaryPlace!.id &&
            place.name.toLowerCase() !==
              primaryPlace!.name.toLowerCase()
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
        setNearbyLoading(false);
      }
    }

    void loadNearbyPlaces();

    return () => controller.abort();
  }, [countryCode, countryName, primaryPlace]);

  function selectMainDestination(place: TouristPlace) {
    setSearchText(place.name);
    setSuggestions([]);
    setNearbyPlaces([]);
    setShowSuggestions(false);
    setSearchMessage("");

    onChange([place]);
  }

  function toggleNearbyPlace(place: TouristPlace) {
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
  }

  function removeSelectedPlace(place: TouristPlace) {
    if (place.id === primaryPlace?.id) {
      clearMainDestination();
      return;
    }

    onChange(
      selectedPlaces.filter(
        (selectedPlace) => selectedPlace.id !== place.id
      )
    );
  }

  function clearMainDestination() {
    setSearchText("");
    setSuggestions([]);
    setNearbyPlaces([]);
    setSearchMessage("");
    setShowSuggestions(false);
    onChange([]);
  }

  if (!countryCode) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-7 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Select a country before searching for your main
        destination.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div ref={searchBoxRef} className="relative">
        <label
          htmlFor="destination-search"
          className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
        >
          📍 Main Destination
        </label>

        <div className="relative">
          <input
            id="destination-search"
            type="search"
            autoComplete="off"
            value={searchText}
            disabled={disabled}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onChange={(event) => {
              const value = event.target.value;

              setSearchText(value);
              setShowSuggestions(true);

              if (
                primaryPlace &&
                value.trim() !== primaryPlace.name
              ) {
                onChange([]);
                setNearbyPlaces([]);
              }
            }}
            placeholder={`Example: Ooty, Munnar or Goa`}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
          />

          {searchLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Type at least two letters and select the correct
          destination from the suggestions.
        </p>

        {showSuggestions &&
          (suggestions.length > 0 ||
            searchLoading ||
            searchMessage) && (
            <div className="absolute z-[1000] mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
              {searchLoading && suggestions.length === 0 && (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  Searching destinations...
                </p>
              )}

              {!searchLoading && searchMessage && (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  {searchMessage}
                </p>
              )}

              {suggestions.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => selectMainDestination(place)}
                  className="block w-full border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    📍 {place.name}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {place.description}
                  </p>
                </button>
              ))}
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
              className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-60 dark:text-red-400"
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
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {place.name} ×
              </button>
            ))}
          </div>
        </div>
      )}

      {primaryPlace && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <div>
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-100">
              ✨ Places near {primaryPlace.name}
            </h3>

            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              Add any places you would like included in the AI
              itinerary.
            </p>
          </div>

          {nearbyLoading ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-white/70 p-7 text-center dark:border-amber-900 dark:bg-gray-900/50">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Finding nearby cities, attractions and day-trip
                destinations...
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
              No nearby suggestions were returned for this
              destination.
            </div>
          )}
        </section>
      )}
    </div>
  );
}