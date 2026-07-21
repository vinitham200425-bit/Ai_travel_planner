import { NextRequest, NextResponse } from "next/server";

type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type CurrentWeather = {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
};

type DailyWeather = {
  time: string[];
  sunrise: string[];
  sunset: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
};

type WeatherResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyWeather;
};

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    const destination =
      request.nextUrl.searchParams.get("destination")?.trim();

    const country =
      request.nextUrl.searchParams.get("country")?.trim();

    if (!destination) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Search only using the destination name.
     * Example:
     * destination = Kerala
     * country = India
     */
    const geocodingParams = new URLSearchParams({
      name: destination,
      count: "20",
      language: "en",
      format: "json",
    });

    const geocodingResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?${geocodingParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!geocodingResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to search for the destination.",
        },
        { status: 502 }
      );
    }

    const geocodingData =
      (await geocodingResponse.json()) as GeocodingResponse;

    const results = geocodingData.results ?? [];

    let location: GeocodingResult | undefined;

    if (country) {
      const normalizedCountry = normalizeValue(country);

      location = results.find((result) => {
        const resultCountry = result.country
          ? normalizeValue(result.country)
          : "";

        return resultCountry === normalizedCountry;
      });
    }

    /*
     * If no exact country match is found, use the first result.
     * This keeps weather working for destinations without a country.
     */
    if (!location) {
      location = results[0];
    }

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          message: `Weather location could not be found for ${destination}${
            country ? `, ${country}` : ""
          }.`,
        },
        { status: 404 }
      );
    }

    const weatherParams = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m",
      daily:
        "sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone: "auto",
      forecast_days: "1",
    });

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!weatherResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to load weather information.",
        },
        { status: 502 }
      );
    }

    const weatherData =
      (await weatherResponse.json()) as WeatherResponse;

    return NextResponse.json({
      success: true,

      location: {
        name: location.name,
        country: location.country || country || "",
        region: location.admin1 || "",
        latitude: location.latitude,
        longitude: location.longitude,
      },

      weather: {
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        precipitation: weatherData.current.precipitation,
        cloudCover: weatherData.current.cloud_cover,
        weatherCode: weatherData.current.weather_code,
        isDay: weatherData.current.is_day === 1,

        maximumTemperature:
          weatherData.daily.temperature_2m_max?.[0] ?? null,

        minimumTemperature:
          weatherData.daily.temperature_2m_min?.[0] ?? null,

        precipitationProbability:
          weatherData.daily.precipitation_probability_max?.[0] ?? null,

        sunrise: weatherData.daily.sunrise?.[0] ?? null,
        sunset: weatherData.daily.sunset?.[0] ?? null,
        timezone: weatherData.timezone,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load weather information.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}