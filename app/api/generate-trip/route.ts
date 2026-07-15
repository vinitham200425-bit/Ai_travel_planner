import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      destination,
      days,
      budget,
      travelers,
      travelStyle,
      hotelCategory,
    } = body;

    // Validate input
    if (
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
You are an expert AI Travel Planner.

Create a professional travel itinerary using the following details.

Destination: ${destination}
Duration: ${days} days
Budget: ₹${budget}
Travelers: ${travelers}
Travel Style: ${travelStyle}
Hotel Category: ${hotelCategory}

Generate:

📍 Trip Overview

🗓️ Day-wise Itinerary
For every day include:
- Morning
- Afternoon
- Evening
- Dinner

🏨 Recommend 3 hotels

🍽️ Recommend local foods

💰 Budget Breakdown

🚕 Transportation

🎒 Packing Checklist

⚠️ Important Travel Tips

Return the response in a clean, well-formatted manner.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return Response.json({
      success: true,
      itinerary: response.output_text,
    });
  } catch (error: any) {
    console.error("=======================================");
    console.error("OPENAI API ERROR");
    console.error(error);
    console.error("=======================================");

    return Response.json(
      {
        success: false,
        message: error?.message || "Unknown error occurred.",
        details: error?.status || "",
      },
      { status: 500 }
    );
  }
}