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
        destination.categories &&
        destination.categories.length > 0
          ? ` — ${destination.categories.join(", ")}`
          : "";

      return `${index + 1}. ${destination.name}${region}${categories}`;
    })
    .join("\n");
}

function buildWeatherSummary(
  weatherForecast?: PromptWeatherDay[]
): string {
  if (!weatherForecast || weatherForecast.length === 0) {
    return "Weather forecast is not available.";
  }

  return weatherForecast
    .map((day) => {
      const date = day.date || "Date unavailable";
      const condition = day.condition || "Condition unavailable";

      const minimumTemperature =
        typeof day.minimumTemperature === "number"
          ? `${day.minimumTemperature}°C`
          : "N/A";

      const maximumTemperature =
        typeof day.maximumTemperature === "number"
          ? `${day.maximumTemperature}°C`
          : "N/A";

      return `${date} - ${condition}, ${minimumTemperature} to ${maximumTemperature}`;
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
You are an experienced Indian and international travel planner.

Create a realistic, practical and route-aware travel itinerary using the trip information below.

TRIP INFORMATION

Country:
${input.country}

Selected destinations:
${destinationSummary}

Duration:
${input.days} days

Total budget:
₹${input.budget}

Travelers:
${input.travelers}

Travel style:
${input.travelStyle}

Hotel category:
${input.hotelCategory}

Travel dates:
${input.startDate} to ${input.endDate}

EXPECTED WEATHER

${weatherSummary}

PLANNING REQUIREMENTS

1. Arrange all selected destinations in the most practical travel order.

2. Consider the geographical location of each destination and avoid unnecessary backtracking.

3. Include realistic travel times and suitable transport options between destinations.

4. Cover important attractions within every selected destination.

5. Add nearby attractions only when they fit naturally within the available duration and budget.

6. Respect the destination categories, including:
   - pilgrimage
   - nature
   - hill station
   - beach
   - heritage
   - wildlife
   - adventure
   - shopping
   - relaxation
   - family-friendly activities

7. For temples, churches, mosques and other religious places:
   - provide practical visiting guidance
   - mention suitable clothing where relevant
   - advise travelers to verify current opening, prayer, entry or darshan timings

8. Create a detailed plan for every day.

9. Each day must include:
   - day number
   - location
   - morning plan
   - afternoon plan
   - evening plan
   - estimated local travel time
   - breakfast suggestion
   - lunch suggestion
   - dinner suggestion
   - hotel area or accommodation suggestion
   - weather guidance
   - optional activities where suitable

10. Do not overcrowd the itinerary.

11. Clearly identify optional attractions or activities.

12. If the selected destinations cannot realistically be covered within ${
    input.days
  } days:
   - clearly explain the limitation
   - prioritize the most practical destinations
   - create the best feasible itinerary

WEATHER REQUIREMENTS

1. Schedule outdoor sightseeing during pleasant weather whenever possible.

2. Prefer museums, shopping centres, cultural attractions or other indoor locations during rainy or extremely hot periods.

3. Mention when travelers should carry:
   - an umbrella
   - rainwear
   - sunscreen
   - a hat
   - warm clothing
   - a light jacket
   - suitable walking shoes

4. Include weather precautions naturally inside each day's plan.

BUDGET REQUIREMENTS

1. Keep the complete itinerary reasonably close to the total budget of ₹${
    input.budget
  }.

2. Provide an approximate budget breakdown for:
   - accommodation
   - intercity transport
   - local transport
   - food
   - attractions and activities
   - miscellaneous expenses

3. Clearly mention when the requested hotel category or itinerary may exceed the available budget.

4. Suggest practical cost-saving alternatives where required.

5. Do not invent exact flight, train, hotel or ticket prices.

6. Clearly label all prices as approximate and advise users to verify current prices before booking.

ADDITIONAL REQUIREMENTS

Include:

- a short trip overview
- the recommended destination order
- a complete day-by-day itinerary
- transport guidance
- hotel-area recommendations
- meal suggestions
- approximate budget breakdown
- packing checklist
- safety guidance
- local travel tips
- weather precautions
- important booking reminders

OUTPUT FORMAT

Return clean, readable Markdown.

Use the following heading structure:

# Trip Overview

# Recommended Route

# Day-by-Day Itinerary

## Day 1 – Location

### Morning

### Afternoon

### Evening

### Meals

### Transport

### Stay

### Weather Advice

### Optional Activities

Repeat the same structure for every day.

After the daily itinerary, include:

# Approximate Budget Breakdown

# Packing Checklist

# Safety and Practical Tips

# Important Booking Reminders

Do not include code fences.

Do not include JSON.

Do not include unsupported claims about current prices, opening hours, availability or visa rules.

Use concise paragraphs and bullet points.

Make the itinerary helpful, realistic and easy to follow.
`.trim();
}