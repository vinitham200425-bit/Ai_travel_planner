"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import type {
  CountryOption,
  TouristPlace,
} from "@/lib/tourist-place";
import GlobalTouristDestinationSelector from "./GlobalTouristDestinationSelector";
import TripMap from "./map/TripMap";
import TripResult from "./TripResult";
import TripWeatherForecast, {
  type WeatherForecastDay,
} from "./weather/TripWeatherForecast";

type GeneratedTrip = {
  destination: string;
  country: string;
  days: number;
  budget: string;
  travelers: string;
  travelStyle: string;
  hotelCategory: string;
  itinerary: string[];
};

type AuthUser = {
  id: string;
  email: string;
};

function getTodayDate(): string {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;

  return new Date(today.getTime() - timezoneOffset)
    .toISOString()
    .split("T")[0];
}

function calculateTripDays(
  startDate: string,
  endDate: string
): number {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end.getTime() < start.getTime()
  ) {
    return 0;
  }

  const difference =
    end.getTime() - start.getTime();

  return (
    Math.floor(difference / (1000 * 60 * 60 * 24)) + 1
  );
}

export default function TripForm() {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<
    TouristPlace[]
  >([]);
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [travelStyle, setTravelStyle] = useState("Family");
  const [hotelCategory, setHotelCategory] =
    useState("3 Star");
  const [weatherForecast, setWeatherForecast] = useState<
    WeatherForecastDay[]
  >([]);
  const [trip, setTrip] = useState<GeneratedTrip | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [countriesLoading, setCountriesLoading] =
    useState(true);

  const todayDate = useMemo(() => getTodayDate(), []);

  const days = useMemo(
    () => calculateTripDays(startDate, endDate),
    [startDate, endDate]
  );

  const selectedCountry = useMemo(
    () =>
      countries.find(
        (country) => country.code === countryCode
      ) ?? null,
    [countries, countryCode]
  );

  const primaryDestination = selectedPlaces[0] ?? null;

  useEffect(() => {
    void loadCurrentUser();
    void loadCountries();
  }, []);

  async function loadCurrentUser() {
    try {
      setAuthLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id || !user.email) {
        setAuthUser(null);
        return;
      }

      setAuthUser({
        id: user.id,
        email: user.email,
      });
    } catch {
      setAuthUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadCountries() {
    try {
      setCountriesLoading(true);

      const response = await fetch(
        "/api/locations/countries",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load countries."
        );
      }

      setCountries(data.countries ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load countries."
      );
    } finally {
      setCountriesLoading(false);
    }
  }

  const handleWeatherForecastChange = useCallback(
    (forecast: WeatherForecastDay[]) => {
      setWeatherForecast(forecast);
    },
    []
  );

  function handleStartDateChange(value: string) {
    setStartDate(value);
    setTrip(null);

    if (endDate && value > endDate) {
      setEndDate("");
    }
  }

  function handleEndDateChange(value: string) {
    setEndDate(value);
    setTrip(null);
  }

  async function handleGenerateTrip() {
    const parsedBudget = Number(budget);

    if (!authUser) {
      toast.error(
        "Please log in before generating a trip."
      );
      return;
    }

    if (!selectedCountry) {
      toast.error("Please select a country.");
      return;
    }

    if (selectedPlaces.length === 0) {
      toast.error("Please select your main destination.");
      return;
    }

    if (!startDate) {
      toast.error("Please select the trip start date.");
      return;
    }

    if (!endDate) {
      toast.error("Please select the trip end date.");
      return;
    }

    if (endDate < startDate) {
      toast.error(
        "Trip end date cannot be before the start date."
      );
      return;
    }

    if (days < 1) {
      toast.error("Please select valid travel dates.");
      return;
    }

    if (days > 30) {
      toast.error(
        "Please limit one itinerary to a maximum of 30 days."
      );
      return;
    }

    if (
      !Number.isFinite(parsedBudget) ||
      parsedBudget <= 0
    ) {
      toast.error("Please enter a valid budget.");
      return;
    }

    const loadingToast = toast.loading(
      "Building your weather-aware itinerary..."
    );

    try {
      setLoading(true);

      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: authUser.id,
          userEmail: authUser.email,
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          destinations: selectedPlaces.map((place) => ({
            id: place.id,
            name: place.name,
            stateOrRegion: place.stateOrRegion,
            categories: place.categories,
            latitude: place.latitude,
            longitude: place.longitude,
          })),
          startDate,
          endDate,
          days,
          budget: parsedBudget,
          travelers,
          travelStyle,
          hotelCategory,
          weatherForecast,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate itinerary."
        );
      }

      setTrip({
        country: selectedCountry.name,
        destination: selectedPlaces
          .map((place) => place.name)
          .join(", "),
        days,
        budget,
        travelers,
        travelStyle,
        hotelCategory,
        itinerary: [data.itinerary],
      });

      toast.success(
        "Weather-aware itinerary generated and saved!",
        {
          id: loadingToast,
        }
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate your itinerary.",
        {
          id: loadingToast,
        }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="trip-form"
      className="bg-gray-100 py-20 dark:bg-gray-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 sm:p-10">
          <h2 className="text-center text-3xl font-bold text-blue-600 dark:text-blue-400 sm:text-4xl">
            ✈️ Plan Your Dream Trip
          </h2>

          <p className="mb-10 mt-3 text-center text-gray-500 dark:text-gray-400">
            Choose your destination, travel dates and nearby
            places to create a weather-aware AI itinerary.
          </p>

          <div>
            <label
              htmlFor="country"
              className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
            >
              🌍 Country
            </label>

            <select
              id="country"
              value={countryCode}
              onChange={(event) => {
                setCountryCode(event.target.value);
                setSelectedPlaces([]);
                setWeatherForecast([]);
                setTrip(null);
              }}
              disabled={loading || countriesLoading}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">
                {countriesLoading
                  ? "Loading countries..."
                  : "Select a country"}
              </option>

              {countries.map((country) => (
                <option
                  key={country.code}
                  value={country.code}
                >
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8">
            <GlobalTouristDestinationSelector
              countryCode={countryCode}
              countryName={selectedCountry?.name ?? ""}
              selectedPlaces={selectedPlaces}
              disabled={loading}
              onChange={(places) => {
                setSelectedPlaces(places);
                setWeatherForecast([]);
                setTrip(null);
              }}
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="trip-start-date"
                className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
              >
                📅 Trip Start Date
              </label>

              <input
                id="trip-start-date"
                type="date"
                value={startDate}
                min={todayDate}
                disabled={loading}
                onChange={(event) =>
                  handleStartDateChange(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="trip-end-date"
                className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
              >
                📅 Trip End Date
              </label>

              <input
                id="trip-end-date"
                type="date"
                value={endDate}
                min={startDate || todayDate}
                disabled={loading || !startDate}
                onChange={(event) =>
                  handleEndDateChange(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {days > 0 && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-900 dark:bg-blue-950/30">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🗓️ Your trip duration
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
                {days} {days === 1 ? "Day" : "Days"}
              </p>
            </div>
          )}

          {primaryDestination && (
            <TripWeatherForecast
              destinationName={primaryDestination.name}
              latitude={primaryDestination.latitude}
              longitude={primaryDestination.longitude}
              startDate={startDate}
              endDate={endDate}
              disabled={loading}
              onForecastChange={
                handleWeatherForecastChange
              }
            />
          )}

          <div className="mt-10">
            <TripMap
              destinations={selectedPlaces.map((place) => ({
                id: place.id,
                name: place.name,
                countryName: place.countryName,
                stateOrRegion: place.stateOrRegion,
                latitude: place.latitude,
                longitude: place.longitude,
                categories: place.categories,
              }))}
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-gray-700 dark:text-gray-200">
                💰 Budget (₹)
              </label>

              <input
                type="number"
                min="1"
                value={budget}
                disabled={loading}
                onChange={(event) => {
                  setBudget(event.target.value);
                  setTrip(null);
                }}
                placeholder="Example: 40000"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700 dark:text-gray-200">
                👨‍👩‍👧 Travelers
              </label>

              <select
                value={travelers}
                disabled={loading}
                onChange={(event) =>
                  setTravelers(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="1">1 Traveler</option>
                <option value="2">2 Travelers</option>
                <option value="3">3 Travelers</option>
                <option value="4">4 Travelers</option>
                <option value="5+">5+ Travelers</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700 dark:text-gray-200">
                🎒 Travel Style
              </label>

              <select
                value={travelStyle}
                disabled={loading}
                onChange={(event) =>
                  setTravelStyle(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Family">Family</option>
                <option value="Relax">Relax</option>
                <option value="Adventure">Adventure</option>
                <option value="Pilgrimage">
                  Pilgrimage
                </option>
                <option value="Luxury">Luxury</option>
                <option value="Romantic">Romantic</option>
                <option value="Solo">Solo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700 dark:text-gray-200">
                🏨 Hotel Category
              </label>

              <select
                value={hotelCategory}
                disabled={loading}
                onChange={(event) =>
                  setHotelCategory(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Budget">Budget</option>
                <option value="3 Star">3 Star</option>
                <option value="4 Star">4 Star</option>
                <option value="5 Star">5 Star</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleGenerateTrip()}
            disabled={
              loading ||
              authLoading ||
              countriesLoading ||
              !authUser
            }
            className="mt-10 w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "Generating weather-aware itinerary..."
              : "🚀 Generate AI Itinerary"}
          </button>

          {!authLoading && !authUser && (
            <p className="mt-3 text-center text-sm text-red-500">
              Please log in to generate and save a trip.
            </p>
          )}
        </div>

        {trip && <TripResult trip={trip} />}
      </div>
    </section>
  );
}