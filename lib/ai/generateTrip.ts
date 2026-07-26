import { gemini, GEMINI_MODEL } from "./gemini";

function getStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  return undefined;
}

function getMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to generate itinerary.";
}

export async function generateTrip(prompt: string): Promise<string> {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const itinerary = response.text?.trim();

    if (!itinerary) {
      throw new Error("Gemini returned an empty itinerary.");
    }

    return itinerary;
  } catch (error: unknown) {
    console.error("Gemini Error:", error);

    const status = getStatus(error);

    switch (status) {
      case 401:
        throw new Error("Invalid Gemini API Key.");

      case 403:
        throw new Error(
          "Gemini API access denied. Check your API key and Google AI Studio project."
        );

      case 429:
        throw new Error(
          "Gemini API quota exceeded. Please try again later."
        );

      default:
        throw new Error(getMessage(error));
    }
  }
}