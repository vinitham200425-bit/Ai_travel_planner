import { getGeminiClient, GEMINI_MODEL } from "./gemini";

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

function extractJson(text: string): string {
  const trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function validateItinerary(value: unknown): void {
  if (
    typeof value !== "object" ||
    value === null ||
    !("tripOverview" in value) ||
    !("days" in value) ||
    !Array.isArray((value as { days?: unknown }).days)
  ) {
    throw new Error(
      "Gemini returned an invalid itinerary structure."
    );
  }
}

export async function generateTrip(
  prompt: string
): Promise<string> {
  const gemini = getGeminiClient();

  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const responseText = response.text?.trim();

    if (!responseText) {
      throw new Error("Gemini returned an empty itinerary.");
    }

    const jsonText = extractJson(responseText);

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error(
        "Gemini returned an itinerary that is not valid JSON."
      );
    }

    validateItinerary(parsed);

    return JSON.stringify(parsed);
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
