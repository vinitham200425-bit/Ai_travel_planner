import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
weatherForecast?: any[];
};

async function getDestinationImage(
  destination: string,
  country: string
): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
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
      return fallbackImage;
    }

    const data = await response.json();
    return data.results?.[0]?.urls?.regular || fallbackImage;
  } catch {
    return fallbackImage;
  }
}

export async function POST(request: Request) {
  try {
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
          stateOrRegion: destination.stateOrRegion?.trim() || "",
          categories: destination.categories ?? [],
          latitude: destination.latitude,
          longitude: destination.longitude,
        })) ?? [];

    // Backward compatibility with the previous single-destination form.
    if (destinations.length === 0 && body.destination?.trim()) {
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
      parsedDays <= 0 ||
      !Number.isFinite(parsedBudget) ||
      parsedBudget <= 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Please enter valid days and budget values.",
        },
        { status: 400 }
      );
    }

    const destinationSummary = destinations
      .map(
        (destination, index) =>
          `${index + 1}. ${destination.name}${
            destination.stateOrRegion
              ? `, ${destination.stateOrRegion}`
              : ""
          }${
            destination.categories.length
              ? ` — ${destination.categories.join(", ")}`
              : ""
          }`
      )
      .join("\n");

    const destinationNames = destinations
      .map((destination) => destination.name)
      .join(", ");

    const prompt = `
You are a professional Indian and international multi-destination travel planner.

Create a practical, route-aware itinerary for the following trip.

Country: ${country}
Selected destinations:
${destinationSummary}

Duration: ${parsedDays} days
Total budget: ₹${parsedBudget}
Travelers: ${travelers}
Travel style: ${travelStyle}
Hotel category: ${hotelCategory}
Travel Dates:
${startDate} to ${endDate}

Expected Weather:
${body.weatherForecast
  ?.map(
    (day) =>
      `${day.date} - ${day.condition}, ${day.minimumTemperature}°C to ${day.maximumTemperature}°C`
  )
  .join("\n") ?? "Not Available"}

Weather Instructions:

- Plan outdoor sightseeing on pleasant weather days.
- Use indoor attractions on rainy days.
- Mention if an umbrella or jacket is recommended.
- Include weather precautions naturally inside the itinerary.
Requirements:

1. Arrange the selected destinations in the most practical travel order.
2. Include realistic travel time and suitable transport between destinations.
3. Include the top attractions within every selected destination.
4. Add worthwhile nearby attractions only when they fit the available days and budget.
5. Respect destination types such as pilgrimage, nature, hill station, beach, heritage, wildlife and adventure.
6. For holy places, mention practical visiting guidance and advise the traveler to verify current opening and darshan timings.
7. Provide a day-by-day itinerary with morning, afternoon and evening plans.
8. Include breakfast, lunch and dinner suggestions.
9. Recommend suitable hotel areas or example hotel types.
10. Provide an approximate cost breakdown that stays close to the total budget.
11. Include local transport guidance, packing checklist and important travel tips.
12. Do not overcrowd the schedule. Clearly mark optional activities.
13. If the number of selected destinations is unrealistic for ${parsedDays} days, say so and create the best feasible plan.

Return the response in clean, beautiful markdown.
`;

    const [openAiResponse, imageUrl] = await Promise.all([
      openAiClient.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
      getDestinationImage(destinations[0].name, country),
    ]);

    const itinerary = openAiResponse.output_text?.trim();

    if (!itinerary) {
      return Response.json(
        {
          success: false,
          message: "The itinerary response was empty. Please try again.",
        },
        { status: 502 }
      );
    }

    /*
      This first version keeps the existing Prisma schema unchanged.
      Multiple destination names are stored in the current destination String field.
    */
    const savedTrip = await prisma.trip.create({
  data: {
    userId,
    userEmail,
    destination: destinationNames,
    country,

    startDate: new Date(startDate),
    endDate: new Date(endDate),

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

    return Response.json({
      success: true,
      itinerary,
      trip: savedTrip,
      selectedDestinations: destinations,
    });
  } catch (error) {
    console.error("GENERATE TRIP API ERROR:", error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return Response.json(
          {
            success: false,
            message: "The OpenAI API key is invalid.",
          },
          { status: 401 }
        );
      }

      if (error.status === 429) {
        return Response.json(
          {
            success: false,
            message:
              "OpenAI billing or quota is unavailable. Activate billing before generating a new itinerary.",
          },
          { status: 429 }
        );
      }
    }

    return Response.json(
      {
        success: false,
        message: "Unable to generate itinerary.",
      },
      { status: 500 }
    );
  }
}
