import { NextRequest, NextResponse } from "next/server";

type OpenMeteoDaily = {
  time?: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_probability_max?: number[];
  precipitation_sum?: number[];
  wind_speed_10m_max?: number[];
};

type OpenMeteoResponse = {
  timezone?: string;
  daily?: OpenMeteoDaily;
  daily_units?: {
    temperature_2m_max?: string;
    temperature_2m_min?: string;
    precipitation_probability_max?: string;
    precipitation_sum?: string;
    wind_speed_10m_max?: string;
  };
};

function parseDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getUtcToday(): Date {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );
}

function getDifferenceInDays(start: Date, end: Date): number {
  return Math.floor(
    (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function getWeatherCondition(code: number): {
  condition: string;
  icon: string;
} {
  if (code === 0) {
    return {
      condition: "Clear sky",
      icon: "☀️",
    };
  }

  if (code === 1) {
    return {
      condition: "Mainly clear",
      icon: "🌤️",
    };
  }

  if (code === 2) {
    return {
      condition: "Partly cloudy",
      icon: "⛅",
    };
  }

  if (code === 3) {
    return {
      condition: "Overcast",
      icon: "☁️",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      condition: "Foggy",
      icon: "🌫️",
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      condition: "Drizzle",
      icon: "🌦️",
    };
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return {
      condition: "Rain",
      icon: "🌧️",
    };
  }

  if ([71, 73, 75, 77].includes(code)) {
    return {
      condition: "Snow",
      icon: "❄️",
    };
  }

  if ([80, 81, 82].includes(code)) {
    return {
      condition: "Rain showers",
      icon: "🌦️",
    };
  }

  if ([85, 86].includes(code)) {
    return {
      condition: "Snow showers",
      icon: "🌨️",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      condition: "Thunderstorm",
      icon: "⛈️",
    };
  }

  return {
    condition: "Weather information available",
    icon: "🌤️",
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const latitude = Number(searchParams.get("latitude"));
    const longitude = Number(searchParams.get("longitude"));
    const startDateText = searchParams.get("startDate")?.trim() ?? "";
    const endDateText = searchParams.get("endDate")?.trim() ?? "";

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid latitude is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid longitude is required.",
        },
        { status: 400 }
      );
    }

    const startDate = parseDate(startDateText);
    const endDate = parseDate(endDateText);

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid start and end dates are required.",
        },
        { status: 400 }
      );
    }

    if (endDate.getTime() < startDate.getTime()) {
      return NextResponse.json(
        {
          success: false,
          message: "End date cannot be before the start date.",
        },
        { status: 400 }
      );
    }

    const tripLength = getDifferenceInDays(startDate, endDate) + 1;

    if (tripLength > 16) {
      return NextResponse.json({
        success: true,
        available: false,
        reason:
          "Weather forecast is currently limited to trips of 16 days or fewer.",
        forecast: [],
      });
    }

    const today = getUtcToday();
    const lastForecastDate = new Date(today);

    lastForecastDate.setUTCDate(lastForecastDate.getUTCDate() + 15);

    if (startDate.getTime() < today.getTime()) {
      return NextResponse.json({
        success: true,
        available: false,
        reason:
          "Weather forecasting is not available for past travel dates.",
        forecast: [],
      });
    }

    if (endDate.getTime() > lastForecastDate.getTime()) {
      return NextResponse.json({
        success: true,
        available: false,
        reason:
          "The selected dates are outside the current 16-day forecast window. Check again closer to your trip.",
        forecast: [],
        forecastAvailableFrom: formatDate(today),
        forecastAvailableUntil: formatDate(lastForecastDate),
      });
    }

    const params = new URLSearchParams({
  latitude: String(latitude),
  longitude: String(longitude),
  start_date: startDateText,
  end_date: endDateText,
  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_probability_max",
    "precipitation_sum",
    "wind_speed_10m_max",
  ].join(","),
  timezone: "auto",
});

const weatherUrl =
  `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

console.log("Open-Meteo request:", weatherUrl);

const response = await fetch(weatherUrl, {
  headers: {
    Accept: "application/json",
  },
  cache: "no-store",
});

if (!response.ok) {
  const errorBody = await response.text();

  console.error(
    `Open-Meteo Error ${response.status}:`,
    errorBody
  );

  throw new Error(
    `Weather provider rejected the request: ${errorBody}`
  );
}

const data = (await response.json()) as OpenMeteoResponse;

    const dates = data.daily?.time ?? [];
    const weatherCodes = data.daily?.weather_code ?? [];
    const maximumTemperatures =
      data.daily?.temperature_2m_max ?? [];
    const minimumTemperatures =
      data.daily?.temperature_2m_min ?? [];
    const rainProbabilities =
      data.daily?.precipitation_probability_max ?? [];
    const precipitationTotals =
      data.daily?.precipitation_sum ?? [];
    const maximumWindSpeeds =
      data.daily?.wind_speed_10m_max ?? [];

    const forecast = dates.map((date, index) => {
      const weatherCode = weatherCodes[index] ?? -1;
      const weather = getWeatherCondition(weatherCode);

      return {
        date,
        weatherCode,
        condition: weather.condition,
        icon: weather.icon,
        maximumTemperature:
          maximumTemperatures[index] ?? null,
        minimumTemperature:
          minimumTemperatures[index] ?? null,
        rainProbability: rainProbabilities[index] ?? null,
        precipitation: precipitationTotals[index] ?? null,
        maximumWindSpeed: maximumWindSpeeds[index] ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      available: forecast.length > 0,
      timezone: data.timezone ?? "",
      forecast,
      units: {
        maximumTemperature:
          data.daily_units?.temperature_2m_max ?? "°C",
        minimumTemperature:
          data.daily_units?.temperature_2m_min ?? "°C",
        rainProbability:
          data.daily_units?.precipitation_probability_max ?? "%",
        precipitation:
          data.daily_units?.precipitation_sum ?? "mm",
        maximumWindSpeed:
          data.daily_units?.wind_speed_10m_max ?? "km/h",
      },
    });
  } catch (error) {
    console.error("Trip weather forecast error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve the weather forecast.",
      },
      { status: 500 }
    );
  }
}