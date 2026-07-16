import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      userEmail,
      destination,
      days,
      budget,
      travelers,
      travelStyle,
      hotelCategory,
    } = body;

    if (
      !userId ||
      !userEmail ||
      !destination ||
      !days ||
      !budget ||
      !travelers ||
      !travelStyle ||
      !hotelCategory
    ) {
      return Response.json(
        {
          success: false,
          message: "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are a professional travel planner.

Generate a detailed travel itinerary.

Destination: ${destination}
Duration: ${days} days
Budget: ₹${budget}
Travelers: ${travelers}
Travel Style: ${travelStyle}
Hotel Category: ${hotelCategory}

Include:

1. Day-wise itinerary
2. Tourist attractions
3. Breakfast, Lunch & Dinner suggestions
4. Hotel recommendations
5. Local transport
6. Budget breakdown
7. Packing checklist
8. Travel tips

Return the response in beautiful markdown.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const itinerary = response.output_text;

    const savedTrip = await prisma.trip.create({
      data: {
        userId,
        userEmail,
        destination,
        days: Number(days),
        budget: Number(budget),
        travelers,
        travelStyle,
        hotelCategory,
        itinerary,
      },
    });

    return Response.json({
      success: true,
      itinerary,
      trip: savedTrip,
    });
  } catch (error) {
    console.error("OPENAI/API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to generate itinerary.",
      },
      {
        status: 500,
      }
    );
  }
}