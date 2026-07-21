import { NextRequest, NextResponse } from "next/server";

type WikipediaPage = {
  pageid?: number;
  title?: string;
  extract?: string;
  fullurl?: string;
  thumbnail?: {
    source?: string;
    width?: number;
    height?: number;
  };
  original?: {
    source?: string;
    width?: number;
    height?: number;
  };
};

type WikipediaResponse = {
  query?: {
    pages?: Record<string, WikipediaPage>;
  };
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    is_day?: number;
  };
  current_units?: {
    temperature_2m?: string;
    apparent_temperature?: string;
    relative_humidity_2m?: string;
    wind_speed_10m?: string;
  };
};

function getWeatherDescription(code?: number) {
  if (code === undefined) {
    return "Weather unavailable";
  }

  const weatherDescriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    56: "Light freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Light snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    99: "Thunderstorm with heavy hail",
  };

  return weatherDescriptions[code] ?? "Current weather";
}

function getWeatherIcon(code?: number, isDay = true) {
  if (code === undefined) {
    return "🌤️";
  }

  if (code === 0) {
    return isDay ? "☀️" : "🌙";
  }

  if ([1, 2].includes(code)) {
    return isDay ? "🌤️" : "☁️";
  }

  if (code === 3) {
    return "☁️";
  }

  if ([45, 48].includes(code)) {
    return "🌫️";
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(
      code
    )
  ) {
    return "🌧️";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "❄️";
  }

  if ([95, 96, 99].includes(code)) {
    return "⛈️";
  }

  return "🌤️";
}

function getBestSeason(latitude: number) {
  const absoluteLatitude = Math.abs(latitude);

  if (absoluteLatitude <= 23.5) {
    return {
      months: "November to February",
      note: "Generally cooler and more comfortable in tropical regions.",
    };
  }

  if (latitude > 23.5) {
    return {
      months: "April to June or September to October",
      note: "Spring and autumn generally offer milder weather.",
    };
  }

  return {
    months: "March to May or September to November",
    note: "Autumn and spring generally offer milder weather.",
  };
}

async function fetchWikipediaDetails(
  destination: string,
  country: string
) {
  const searchQuery = `${destination} ${country}`;

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: searchQuery,
    gsrlimit: "1",
    gsrnamespace: "0",
    prop: "extracts|pageimages|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "3",
    piprop: "thumbnail|original",
    pithumbsize: "1200",
    inprop: "url",
    redirects: "1",
  });

  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent":
          "AITravelPlanner/1.0 destination-preview",
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as WikipediaResponse;
  const pages = Object.values(data.query?.pages ?? {});

  const page = pages[0];

  if (!page) {
    return null;
  }

  return {
    title: page.title ?? destination,
    description:
      page.extract?.trim() ||
      `Explore ${destination}, a popular destination in ${country}.`,
    imageUrl:
      page.original?.source ||
      page.thumbnail?.source ||
      null,
    wikipediaUrl: page.fullurl ?? null,
  };
}

async function fetchWeather(
  latitude: number,
  longitude: number
) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
    timezone: "auto",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OpenMeteoResponse;

  if (!data.current) {
    return null;
  }

  return {
    temperature: data.current.temperature_2m ?? null,
    apparentTemperature:
      data.current.apparent_temperature ?? null,
    humidity:
      data.current.relative_humidity_2m ?? null,
    windSpeed: data.current.wind_speed_10m ?? null,
    weatherCode: data.current.weather_code,
    description: getWeatherDescription(
      data.current.weather_code
    ),
    icon: getWeatherIcon(
      data.current.weather_code,
      data.current.is_day === 1
    ),
    units: {
      temperature:
        data.current_units?.temperature_2m ?? "°C",
      apparentTemperature:
        data.current_units?.apparent_temperature ?? "°C",
      humidity:
        data.current_units?.relative_humidity_2m ?? "%",
      windSpeed:
        data.current_units?.wind_speed_10m ?? "km/h",
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const destination =
      request.nextUrl.searchParams
        .get("destination")
        ?.trim() ?? "";

    const country =
      request.nextUrl.searchParams
        .get("country")
        ?.trim() ?? "";

    const latitude = Number(
      request.nextUrl.searchParams.get("latitude")
    );

    const longitude = Number(
      request.nextUrl.searchParams.get("longitude")
    );

    if (!destination || !country) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Destination and country are required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid destination coordinates are required.",
        },
        { status: 400 }
      );
    }

    const [wikipedia, weather] = await Promise.all([
      fetchWikipediaDetails(destination, country),
      fetchWeather(latitude, longitude),
    ]);

    const bestSeason = getBestSeason(latitude);

    return NextResponse.json({
      success: true,
      preview: {
        destination,
        country,
        latitude,
        longitude,
        title: wikipedia?.title ?? destination,
        description:
          wikipedia?.description ??
          `Explore ${destination}, a destination located in ${country}.`,
        imageUrl: wikipedia?.imageUrl ?? null,
        wikipediaUrl:
          wikipedia?.wikipediaUrl ?? null,
        weather,
        bestSeason,
      },
    });
  } catch (error) {
    console.error("Destination preview error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while loading the destination preview.",
      },
      { status: 500 }
    );
  }
}