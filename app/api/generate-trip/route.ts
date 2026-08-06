import { prisma } from "@/lib/prisma";
import { buildTripPrompt } from "@/lib/ai/prompts";
import { generateTrip } from "@/lib/ai/generateTrip";

const fallbackImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

type SelectedDestination = {
  id?: string;
  name?: string;
  stateOrRegion?: string;
  categories?: string[];
  latitude?: number;
  longitude?: number;
};

type WeatherForecastDay = {
  date?: string;
  condition?: string;
  minimumTemperature?: number;
  maximumTemperature?: number;
};

type GenerateTripBody = {
  userId?: string;
  userEmail?: string;
  country?: string;
  destinations?: SelectedDestination[];
  destination?: string;
  days?: number | string;
  budget?: number | string;
  travelers?: string;
  travelStyle?: string;
  hotelCategory?: string;
  startDate?: string;
  endDate?: string;
  weatherForecast?: WeatherForecastDay[];
};

async function getDestinationImage(
  destination: string,
  country: string
): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn(
      "UNSPLASH_ACCESS_KEY is missing. Using fallback image."
    );

    return fallbackImage;
  }

  try {
    const params = new URLSearchParams({
      query: `${destination}, ${country} travel landscape`,
      page: "1",
      per_page: "1",
      orientation: "landscape",
      content_filter: "high",
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "UNSPLASH API ERROR:",
        response.status,
        response.statusText
      );

      return fallbackImage;
    }

    const data = (await response.json()) as {
      results?: Array<{
        urls?: {
          regular?: string;
        };
      }>;
    };

    return data.results?.[0]?.urls?.regular || fallbackImage;
  } catch (error) {
    console.error("DESTINATION IMAGE ERROR:", error);

    return fallbackImage;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown server error";
}

export async function POST(request: Request) {
  try {
    console.log("GENERATE TRIP: Request received.");

    const body = (await request.json()) as GenerateTripBody;

    const userId = body.userId?.trim() ?? "";
    const userEmail = body.userEmail?.trim() ?? "";
    const country = body.country?.trim() ?? "";
    const travelers = body.travelers?.trim() ?? "";
    const travelStyle = body.travelStyle?.trim() ?? "";
    const hotelCategory = body.hotelCategory?.trim() ?? "";
    const startDate = body.startDate?.trim() ?? "";
    const endDate = body.endDate?.trim() ?? "";

    const destinations =
      body.destinations
        ?.filter((destination) => destination.name?.trim())
        .map((destination) => ({
          name: destination.name!.trim(),
          stateOrRegion:
            destination.stateOrRegion?.trim() || "",
          categories: destination.categories ?? [],
          latitude: destination.latitude,
          longitude: destination.longitude,
        })) ?? [];

    /*
      Backward compatibility with the previous
      single-destination request format.
    */
    if (
      destinations.length === 0 &&
      body.destination?.trim()
    ) {
      destinations.push({
        name: body.destination.trim(),
        stateOrRegion: "",
        categories: [],
        latitude: undefined,
        longitude: undefined,
      });
    }

    if (
      !userId ||
      !userEmail ||
      !country ||
      destinations.length === 0 ||
      body.days === undefined ||
      body.budget === undefined ||
      !travelers ||
      !travelStyle ||
      !hotelCategory ||
      !startDate ||
      !endDate
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Please log in and fill all required trip fields.",
        },
        { status: 400 }
      );
    }

    const parsedDays = Number(body.days);
    const parsedBudget = Number(body.budget);

    if (
      !Number.isInteger(parsedDays) ||
      parsedDays <= 0
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Please enter a valid number of trip days.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(parsedBudget) ||
      parsedBudget <= 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Please enter a valid trip budget.",
        },
        { status: 400 }
      );
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return Response.json(
        {
          success: false,
          message: "Please select valid travel dates.",
        },
        { status: 400 }
      );
    }

    if (parsedEndDate < parsedStartDate) {
      return Response.json(
        {
          success: false,
          message:
            "The end date cannot be before the start date.",
        },
        { status: 400 }
      );
    }

    const destinationNames = destinations
      .map((destination) => destination.name)
      .join(", ");

    console.log(
      "GENERATE TRIP: Building prompt for:",
      destinationNames
    );

    const prompt = buildTripPrompt({
      country,
      destinations,
      days: parsedDays,
      budget: parsedBudget,
      travelers,
      travelStyle,
      hotelCategory,
      startDate,
      endDate,
      weatherForecast: body.weatherForecast,
    });

    console.log("GENERATE TRIP: Starting Gemini request.");

    const [itinerary, imageUrl] = await Promise.all([
      generateTrip(prompt),
      getDestinationImage(
        destinations[0].name,
        country
      ),
    ]);

    console.log(
      "GENERATE TRIP: Gemini request completed."
    );

    if (!itinerary.trim()) {
      throw new Error(
        "Gemini returned an empty itinerary."
      );
    }

    console.log(
      "GENERATE TRIP: Saving trip to database."
    );

    const savedTrip = await prisma.trip.create({
      data: {
        userId,
        userEmail,
        destination: destinationNames,
        country,

        startDate: parsedStartDate,
        endDate: parsedEndDate,

        days: parsedDays,
        budget: parsedBudget,

        travelers,
        travelStyle,
        hotelCategory,

        itinerary,
        imageUrl,

        isFavorite: false,
      },
    });

    console.log(
      "GENERATE TRIP: Trip saved successfully:",
      savedTrip.id
    );

    return Response.json(
      {
        success: true,
        itinerary,
        trip: savedTrip,
        selectedDestinations: destinations,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "GENERATE TRIP API ERROR:",
      error
    );

    const errorMessage = getErrorMessage(error);
    const normalizedMessage =
      errorMessage.toLowerCase();

    if (
      normalizedMessage.includes(
        "gemini_api_key is not configured"
      ) ||
      normalizedMessage.includes(
        "invalid gemini api key"
      ) ||
      normalizedMessage.includes("api key not valid") ||
      normalizedMessage.includes("api_key_invalid") ||
      normalizedMessage.includes("401")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "The Gemini API key is invalid or missing. Check GEMINI_API_KEY in Vercel Environment Variables.",
        },
        { status: 401 }
      );
    }

    if (
      normalizedMessage.includes("access denied") ||
      normalizedMessage.includes(
        "permission denied"
      ) ||
      normalizedMessage.includes("forbidden") ||
      normalizedMessage.includes("403")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Gemini API access was denied. Check the API key and Google AI Studio project permissions.",
        },
        { status: 403 }
      );
    }

    if (
      normalizedMessage.includes("quota") ||
      normalizedMessage.includes(
        "resource_exhausted"
      ) ||
      normalizedMessage.includes("rate limit") ||
      normalizedMessage.includes("429")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "The Gemini API quota has been reached. Please wait and try again or review the Gemini API quota.",
        },
        { status: 429 }
      );
    }

    if (
      normalizedMessage.includes("empty itinerary") ||
      normalizedMessage.includes("empty response")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Gemini returned an empty itinerary. Please try generating the trip again.",
        },
        { status: 502 }
      );
    }

    if (
      normalizedMessage.includes("model") &&
      normalizedMessage.includes("not found")
    ) {
      return Response.json(
        {
          success: false,
          message:
            "The configured Gemini model is unavailable. Check GEMINI_MODEL in lib/ai/gemini.ts.",
        },
        { status: 502 }
      );
    }

    /*
      Temporary debugging response.

      This exposes the real server error so we can identify
      whether Gemini, Prisma or another service is failing.

      After the problem is fixed, replace errorMessage below
      with a generic user-friendly message.
    */
    return Response.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}