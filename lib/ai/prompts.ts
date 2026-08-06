export type PromptDestination = {
  name: string;
  stateOrRegion?: string;
  categories?: string[];
  latitude?: number;
  longitude?: number;
};

export type PromptWeatherDay = {
  date?: string;
  condition?: string;
  minimumTemperature?: number;
  maximumTemperature?: number;
};

export type BuildTripPromptInput = {
  country: string;
  destinations: PromptDestination[];
  days: number;
  budget: number;
  travelers: string;
  travelStyle: string;
  hotelCategory: string;
  startDate: string;
  endDate: string;
  weatherForecast?: PromptWeatherDay[];
};

function buildDestinationSummary(
  destinations: PromptDestination[]
): string {
  return destinations
    .map((destination, index) => {
      const region = destination.stateOrRegion
        ? `, ${destination.stateOrRegion}`
        : "";

      const categories =
        destination.categories?.length
          ? ` — ${destination.categories.join(", ")}`
          : "";

      return `${index + 1}. ${destination.name}${region}${categories}`;
    })
    .join("\n");
}

function buildWeatherSummary(
  weatherForecast?: PromptWeatherDay[]
): string {
  if (!weatherForecast?.length) {
    return "Weather forecast is not available.";
  }

  return weatherForecast
    .map((day) => {
      const date = day.date || "Date unavailable";
      const condition = day.condition || "Condition unavailable";
      const minimum =
        typeof day.minimumTemperature === "number"
          ? `${day.minimumTemperature}°C`
          : "N/A";
      const maximum =
        typeof day.maximumTemperature === "number"
          ? `${day.maximumTemperature}°C`
          : "N/A";

      return `${date}: ${condition}, ${minimum} to ${maximum}`;
    })
    .join("\n");
}

export function buildTripPrompt(
  input: BuildTripPromptInput
): string {
  const destinationSummary = buildDestinationSummary(
    input.destinations
  );
  const weatherSummary = buildWeatherSummary(
    input.weatherForecast
  );

  return `
You are an expert Indian and international travel planner.

Create a COMPLETE but SHORT AND CRISP itinerary for the trip below.

TRIP DETAILS
Country: ${input.country}
Destinations:
${destinationSummary}
Dates: ${input.startDate} to ${input.endDate}
Duration: ${input.days} days
Budget: ₹${input.budget}
Travelers: ${input.travelers}
Travel style: ${input.travelStyle}
Hotel category: ${input.hotelCategory}

WEATHER
${weatherSummary}

CORE RULES
1. Be practical, route-aware and realistic.
2. Avoid long paragraphs, repetition and filler.
3. Each activity must be a short actionable sentence.
4. Do not overcrowd any day.
5. Include all essential details, but keep the whole response concise.
6. Keep daily activities to a maximum of:
   - 3 morning items
   - 3 afternoon items
   - 3 evening items
7. Use approximate costs only. Never invent exact live prices.
8. Mention "Verify current price/timing before booking" where relevant.
9. Respect pilgrimage, beach, hill station, nature, wildlife, heritage,
   shopping, adventure, relaxation and family-friendly preferences.
10. If all selected destinations cannot fit, prioritize the best feasible
    route and explain this briefly in tripOverview.feasibilityNote.
11. Schedule outdoor activities for pleasant weather and indoor options
    for rain or extreme heat.
12. Include umbrella, sunscreen, jacket or walking-shoe advice only when relevant.

RETURN ONLY VALID JSON.
Do not use Markdown.
Do not use code fences.
Do not add text before or after the JSON.

Use exactly this JSON structure:

{
  "tripOverview": {
    "title": "string",
    "route": ["string"],
    "summary": "Maximum 2 short sentences",
    "feasibilityNote": "One short sentence or empty string"
  },
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "location": "string",
      "morning": ["short activity"],
      "afternoon": ["short activity"],
      "evening": ["short activity"],
      "meals": {
        "breakfast": "short suggestion",
        "lunch": "short suggestion",
        "dinner": "short suggestion"
      },
      "transport": "short transport and approximate travel-time guidance",
      "stay": "recommended hotel area or accommodation type",
      "weatherAdvice": "one short practical sentence",
      "optional": ["maximum 2 optional activities"],
      "estimatedDailyCost": "approximate INR range"
    }
  ],
  "hotels": [
    {
      "nameOrArea": "hotel example or recommended area",
      "category": "Budget, Mid-range or Luxury",
      "approximateNightlyCost": "INR range",
      "bestFor": "short phrase"
    }
  ],
  "budget": {
    "accommodation": "INR amount or range",
    "intercityTransport": "INR amount or range",
    "localTransport": "INR amount or range",
    "food": "INR amount or range",
    "attractions": "INR amount or range",
    "miscellaneous": "INR amount or range",
    "estimatedTotal": "INR amount or range",
    "budgetNote": "one short sentence"
  },
  "transportTips": ["maximum 5 short bullets"],
  "mustTryFood": ["maximum 6 items with veg/non-veg label where useful"],
  "packingChecklist": ["maximum 10 essential items"],
  "safetyTips": ["maximum 6 short practical tips"],
  "bookingReminders": ["maximum 6 short reminders"],
  "quickTips": ["maximum 8 short local tips"]
}

VALIDATION RULES
- The days array must contain exactly ${input.days} entries.
- Day numbers must start at 1 and be sequential.
- Use the supplied travel dates.
- Keep JSON strings concise.
- Use empty arrays instead of omitting optional list fields.
- Use an empty string when feasibilityNote is not needed.
- Keep recommendations close to the ₹${input.budget} total budget.
`.trim();
}
