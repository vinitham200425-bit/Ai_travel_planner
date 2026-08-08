"use client";

import {
  useCallback,
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

        {typeof place.distanceKm ===
          "number" && (
          <p className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Approximately{" "}
            {Math.round(place.distanceKm)} km away
          </p>
        )}

        {place.categories?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {place.categories
              .slice(0, 4)
              .map((category) => (
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
  const [searchText, setSearchText] =
    useState("");
  const [countryPlaces, setCountryPlaces] =
    useState<TouristPlace[]>([]);
  const [suggestions, setSuggestions] =
    useState<TouristPlace[]>([]);
  const [nearbyPlaces, setNearbyPlaces] =
    useState<TouristPlace[]>([]);

  const [countryPlacesLoading, setCountryPlacesLoading] =
    useState(false);
  const [searchLoading, setSearchLoading] =
    useState(false);
  const [nearbyLoading, setNearbyLoading] =
    useState(false);

  const [showSuggestions, setShowSuggestions] =
    useState(false);
  const [searchMessage, setSearchMessage] =
    useState("");

  const [manualMode, setManualMode] =
    useState(false);
  const [manualDestination, setManualDestination] =
    useState("");
  const [manualLoading, setManualLoading] =
    useState(false);

  const searchBoxRef =
    useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const primaryPlace =
    selectedPlaces[0] ?? null;

  const selectedIds = useMemo(
    () =>
      new Set(
        selectedPlaces.map(
          (place) => place.id
        )
      ),
    [selectedPlaces]
  );

  const visiblePlaces = useMemo(() => {
    const query = searchText
      .trim()
      .toLowerCase();

    if (query.length >= 2) {
      return suggestions;
    }

    return countryPlaces;
  }, [
    countryPlaces,
    searchText,
    suggestions,
  ]);

  const resetSelector = useCallback(() => {
    setSearchText("");
    setCountryPlaces([]);
    setSuggestions([]);
    setNearbyPlaces([]);
    setSearchMessage("");
    setShowSuggestions(false);
    setManualMode(false);
    setManualDestination("");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      resetSelector();
      onChangeRef.current([]);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    countryCode,
    countryName,
    resetSelector,
  ]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(
          event.target as Node
        )
      ) {
        setShowSuggestions(false);
      }
    }

    function handleEscapeKey(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setShowSuggestions(false);
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

  const loadCountryPlaces =
    useCallback(async () => {
      if (
        !countryCode ||
        countryPlacesLoading ||
        countryPlaces.length > 0
      ) {
        return;
      }

      try {
        setCountryPlacesLoading(true);
        setSearchMessage("");

        const params =
          new URLSearchParams({
            countryCode,
            countryName,
            limit: "300",
          });

        const response = await fetch(
          `/api/locations/country-tourist-places?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as PlacesResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load tourist places."
          );
        }

        const places =
          data.places ?? [];

        setCountryPlaces(places);

        if (places.length === 0) {
          setSearchMessage(
            `No tourist places were returned for ${countryName}. You can use "Other / Not Listed".`
          );
        }
      } catch (error) {
        setCountryPlaces([]);

        setSearchMessage(
          error instanceof Error
            ? error.message
            : "Unable to load tourist places."
        );
      } finally {
        setCountryPlacesLoading(false);
      }
    }, [
      countryCode,
      countryName,
      countryPlaces,
      countryPlacesLoading,
    ]);

  useEffect(() => {
    const query = searchText.trim();

    if (
      !countryCode ||
      query.length < 2 ||
      primaryPlace?.name === query
    ) {
      const timer =
        window.setTimeout(() => {
          setSuggestions([]);
          setSearchLoading(false);
        }, 0);

      return () =>
        window.clearTimeout(timer);
    }

    const controller =
      new AbortController();

    const timer =
      window.setTimeout(async () => {
        try {
          setSearchLoading(true);
          setSearchMessage("");

          const localMatches =
            countryPlaces
              .filter((place) => {
                const searchable =
                  [
                    place.name,
                    place.description,
                    place.stateOrRegion,
                    ...place.categories,
                  ]
                    .join(" ")
                    .toLowerCase();

                return searchable.includes(
                  query.toLowerCase()
                );
              })
              .slice(0, 50);

          if (localMatches.length > 0) {
            setSuggestions(
              localMatches
            );
            setShowSuggestions(true);
          }

          const params =
            new URLSearchParams({
              query,
              countryCode,
            });

          const response = await fetch(
            `/api/locations/search-destinations?${params.toString()}`,
            {
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

          const data =
            (await response.json()) as PlacesResponse;

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                "Unable to search destinations."
            );
          }

          const remote =
            data.places ?? [];

          const merged = [
            ...localMatches,
            ...remote,
          ];

          const seen =
            new Set<string>();

          const unique =
            merged.filter((place) => {
              const key =
                `${place.name.toLowerCase()}-${place.latitude.toFixed(
                  3
                )}-${place.longitude.toFixed(
                  3
                )}`;

              if (seen.has(key)) {
                return false;
              }

              seen.add(key);
              return true;
            });

          setSuggestions(unique);
          setShowSuggestions(true);

          if (unique.length === 0) {
            setSearchMessage(
              `No listed destination found for "${query}". Choose "Other / Not Listed" to enter it manually.`
            );
          }
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }

          setSearchMessage(
            error instanceof Error
              ? error.message
              : "Unable to search destinations."
          );
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setSearchLoading(false);
          }
        }
      }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    countryCode,
    countryPlaces,
    primaryPlace?.name,
    searchText,
  ]);

  useEffect(() => {
    if (
      !primaryPlace ||
      !countryCode ||
      !countryName ||
      primaryPlace.source === "manual"
    ) {
      const timer =
        window.setTimeout(() => {
          setNearbyPlaces([]);
          setNearbyLoading(false);
        }, 0);

      return () =>
        window.clearTimeout(timer);
    }

    const controller =
      new AbortController();

    async function loadNearbyPlaces() {
      try {
        setNearbyLoading(true);

        const params =
          new URLSearchParams({
            countryCode,
            countryName,
            latitude: String(
              primaryPlace.latitude
            ),
            longitude: String(
              primaryPlace.longitude
            ),
            radiusKm: "120",
            limit: "20",
          });

        const response = await fetch(
          `/api/locations/nearby-tourist-places?${params.toString()}`,
          {
            cache: "no-store",
            signal:
              controller.signal,
          }
        );

        const data =
          (await response.json()) as PlacesResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load nearby tourist places."
          );
        }

        const results =
          (data.places ?? []).filter(
            (place) =>
              place.id !==
                primaryPlace.id &&
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
        if (
          !controller.signal.aborted
        ) {
          setNearbyLoading(false);
        }
      }
    }

    void loadNearbyPlaces();

    return () => {
      controller.abort();
    };
  }, [
    countryCode,
    countryName,
    primaryPlace,
  ]);

  const selectMainDestination =
    useCallback(
      (place: TouristPlace) => {
        setSearchText(place.name);
        setSuggestions([]);
        setNearbyPlaces([]);
        setShowSuggestions(false);
        setSearchMessage("");
        setManualMode(false);
        setManualDestination("");

        onChange([place]);
      },
      [onChange]
    );

  const handleManualDestination =
    useCallback(async () => {
      const query =
        manualDestination.trim();

      if (query.length < 2) {
        toast.error(
          "Please enter a destination."
        );
        return;
      }

      try {
        setManualLoading(true);

        const params =
          new URLSearchParams({
            query,
            countryCode,
          });

        const response = await fetch(
          `/api/locations/search-destinations?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as PlacesResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to find this destination."
          );
        }

        const resolved =
          data.places?.[0];

        if (resolved) {
          selectMainDestination(
            resolved
          );
          return;
        }

        const manualPlace: TouristPlace =
          {
            id: `manual-${Date.now()}`,
            name: query,
            countryCode,
            countryName,
            stateOrRegion: "",
            latitude: 0,
            longitude: 0,
            categories: [
              "Custom Destination",
            ],
            description:
              `${query}, ${countryName}`,
            imageUrl: "",
            source: "manual",
          };

        selectMainDestination(
          manualPlace
        );

        toast(
          "Destination added manually. Map, weather or nearby suggestions may be unavailable if the location could not be resolved."
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to add this destination."
        );
      } finally {
        setManualLoading(false);
      }
    }, [
      countryCode,
      countryName,
      manualDestination,
      selectMainDestination,
    ]);

  const toggleNearbyPlace =
    useCallback(
      (place: TouristPlace) => {
        if (!primaryPlace) {
          toast.error(
            "Please select a main destination first."
          );
          return;
        }

        if (
          selectedIds.has(place.id)
        ) {
          onChange(
            selectedPlaces.filter(
              (selectedPlace) =>
                selectedPlace.id !==
                place.id
            )
          );
          return;
        }

        if (
          selectedPlaces.length >= 6
        ) {
          toast.error(
            "You can add up to 5 nearby places with the main destination."
          );
          return;
        }

        onChange([
          ...selectedPlaces,
          place,
        ]);
      },
      [
        onChange,
        primaryPlace,
        selectedIds,
        selectedPlaces,
      ]
    );

  const clearMainDestination =
    useCallback(() => {
      resetSelector();
      onChange([]);
    }, [onChange, resetSelector]);

  const removeSelectedPlace =
    useCallback(
      (place: TouristPlace) => {
        if (
          place.id ===
          primaryPlace?.id
        ) {
          clearMainDestination();
          return;
        }

        onChange(
          selectedPlaces.filter(
            (selectedPlace) =>
              selectedPlace.id !==
              place.id
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
        Select a country before choosing
        your main destination.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        ref={searchBoxRef}
        className="relative"
      >
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
            role="combobox"
            autoComplete="off"
            value={searchText}
            disabled={disabled}
            aria-autocomplete="list"
            aria-controls="destination-suggestions"
            aria-expanded={
              showSuggestions
            }
            onFocus={() => {
              setShowSuggestions(true);

              if (
                countryPlaces.length === 0
              ) {
                void loadCountryPlaces();
              }
            }}
            onChange={(event) => {
              const value =
                event.target.value;

              setSearchText(value);
              setShowSuggestions(true);
              setManualMode(false);

              if (
                primaryPlace &&
                value.trim() !==
                  primaryPlace.name
              ) {
                onChange([]);
                setNearbyPlaces([]);
              }

              if (
                value.trim().length < 2 &&
                countryPlaces.length === 0
              ) {
                void loadCountryPlaces();
              }
            }}
            placeholder={`Choose a tourist place in ${countryName}`}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
          />

          {(searchLoading ||
            countryPlacesLoading) && (
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Click to browse tourist places
          for {countryName}, or type to
          search. If your destination is
          missing, choose &quot;Other / Not
          Listed&quot;.
        </p>

        {showSuggestions && (
          <div
            id="destination-suggestions"
            role="listbox"
            className="absolute z-[1000] mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            {(countryPlacesLoading ||
              searchLoading) &&
              visiblePlaces.length ===
                0 && (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading tourist
                  places...
                </p>
              )}

            {!countryPlacesLoading &&
              !searchLoading &&
              searchMessage && (
                <p className="border-b border-gray-100 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  {searchMessage}
                </p>
              )}

            {visiblePlaces.map(
              (place) => (
                <button
                  key={place.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() =>
                    selectMainDestination(
                      place
                    )
                  }
                  className="block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    📍 {place.name}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    {place.stateOrRegion && (
                      <span>
                        {place.stateOrRegion}
                      </span>
                    )}

                    {place.categories?.[0] && (
                      <span>
                        · {place.categories[0]}
                      </span>
                    )}
                  </div>
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => {
                setManualMode(true);
                setShowSuggestions(
                  false
                );
                setSearchText("");
                setSuggestions([]);
              }}
              className="sticky bottom-0 block w-full bg-amber-50 px-4 py-4 text-left font-bold text-amber-800 transition hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900"
            >
              ➕ Other / Not Listed
              <span className="mt-1 block text-xs font-normal">
                Enter any tourist
                destination manually
              </span>
            </button>
          </div>
        )}

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
                value={
                  manualDestination
                }
                onChange={(event) =>
                  setManualDestination(
                    event.target.value
                  )
                }
                placeholder={`Example: a temple, beach, island or attraction in ${countryName}`}
                disabled={
                  disabled ||
                  manualLoading
                }
                className="min-w-0 flex-1 rounded-xl border border-amber-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 dark:border-amber-800 dark:bg-gray-900 dark:text-white"
              />

              <button
                type="button"
                disabled={
                  disabled ||
                  manualLoading
                }
                onClick={() =>
                  void handleManualDestination()
                }
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {manualLoading
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
              onClick={
                clearMainDestination
              }
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
            {selectedPlaces
              .slice(1)
              .map((place) => (
                <button
                  key={place.id}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    removeSelectedPlace(
                      place
                    )
                  }
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {place.name} ×
                </button>
              ))}
          </div>
        </div>
      )}

      {primaryPlace &&
        primaryPlace.source !== "manual" && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
            <div>
              <h3 className="text-lg font-bold text-amber-950 dark:text-amber-100">
                ✨ Places near{" "}
                {primaryPlace.name}
              </h3>

              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                Add any nearby places you
                would like included in
                the AI itinerary.
              </p>
            </div>

            {nearbyLoading ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-white/70 p-7 text-center dark:border-amber-900 dark:bg-gray-900/50">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Finding nearby tourist
                  places...
                </p>
              </div>
            ) : nearbyPlaces.length >
              0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nearbyPlaces.map(
                  (place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      selected={selectedIds.has(
                        place.id
                      )}
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        toggleNearbyPlace(
                          place
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-amber-300 p-6 text-center text-sm text-gray-600 dark:border-amber-800 dark:text-gray-300">
                No nearby suggestions
                were returned for this
                destination.
              </div>
            )}
          </section>
        )}
    </div>
  );
}