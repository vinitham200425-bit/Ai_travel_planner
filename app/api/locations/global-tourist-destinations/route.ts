import { NextRequest, NextResponse } from "next/server";
import {
  type TouristPlace,
  uniqueTouristPlaces,
} from "@/lib/tourist-place";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

const DESTINATION_CLASSES = [
  ["Q515", "City"],
  ["Q3957", "Town"],
  ["Q532", "Village"],
  ["Q570116", "Tourist Attraction"],
  ["Q46169", "National Park"],
  ["Q8502", "Mountain"],
  ["Q23397", "Lake"],
  ["Q23442", "Island"],
  ["Q40080", "Beach"],
  ["Q839954", "Archaeological Site"],
  ["Q33506", "Museum"],
  ["Q16970", "Church"],
  ["Q32815", "Mosque"],
  ["Q842402", "Hindu Temple"],
] as const;

type SparqlBinding = {
  place?: { value?: string };
  placeLabel?: { value?: string };
  coord?: { value?: string };
  image?: { value?: string };
  article?: { value?: string };
  sitelinks?: { value?: string };
  adminLabel?: { value?: string };
};

type SparqlResponse = {
  results?: { bindings?: SparqlBinding[] };
};

function escapeSparqlLiteral(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function parsePoint(
  point?: string
): { latitude: number; longitude: number } | null {
  if (!point) return null;

  const match = point.match(
    /^Point\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)$/
  );

  if (!match) return null;

  const longitude = Number(match[1]);
  const latitude = Number(match[2]);

  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null;
}

function getQid(entityUrl?: string): string {
  return entityUrl?.split("/").pop() ?? "";
}

async function runSparql(query: string): Promise<SparqlBinding[]> {
  const params = new URLSearchParams({
    query,
    format: "json",
  });

  const response = await fetch(
    `${WIKIDATA_ENDPOINT}?${params.toString()}`,
    {
      headers: {
        Accept: "application/sparql-results+json",
        "User-Agent":
          "AITravelPlanner/1.0 (contact: vinitham200425@gmail.com)",
      },
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Wikidata request failed with status ${response.status}.`
    );
  }

  const data = (await response.json()) as SparqlResponse;
  return data.results?.bindings ?? [];
}

function buildClassQuery(
  countryCode: string,
  qid: string,
  limit: number
): string {
  const code = escapeSparqlLiteral(countryCode);

  return `
SELECT DISTINCT
  ?place
  ?placeLabel
  ?coord
  ?image
  ?article
  ?sitelinks
  ?adminLabel
WHERE {
  ?country wdt:P297 "${code}".

  ?place wdt:P17 ?country;
         wdt:P31 wd:${qid};
         wdt:P625 ?coord;
         wikibase:sitelinks ?sitelinks.

  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL { ?place wdt:P131 ?admin. }

  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en".
    ?place rdfs:label ?placeLabel.
    ?admin rdfs:label ?adminLabel.
  }

  FILTER(STRLEN(STR(?placeLabel)) > 0)
}
ORDER BY DESC(?sitelinks)
LIMIT ${limit}
`;
}

function mapBinding(
  binding: SparqlBinding,
  countryCode: string,
  countryName: string,
  category: string
): TouristPlace | null {
  const coordinates = parsePoint(binding.coord?.value);
  const name = binding.placeLabel?.value?.trim();
  const id = getQid(binding.place?.value);
  const stateOrRegion = binding.adminLabel?.value?.trim() ?? "";

  if (!coordinates || !name || !id) return null;

  return {
    id,
    name,
    countryCode,
    countryName,
    stateOrRegion,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    categories: [category],
    description: `${name} is a ${category.toLowerCase()}${stateOrRegion ? ` in ${stateOrRegion}` : ""} that can be included in a travel itinerary.`,
    imageUrl: binding.image?.value,
    wikipediaUrl: binding.article?.value,
    source: "wikidata",
  };
}

export async function GET(request: NextRequest) {
  try {
    const countryCode =
      request.nextUrl.searchParams
        .get("countryCode")
        ?.trim()
        .toUpperCase() ?? "";
    const countryName =
      request.nextUrl.searchParams.get("countryName")?.trim() ?? "";
    const limit = Math.min(
      Math.max(
        Number(request.nextUrl.searchParams.get("limit") ?? 40),
        10
      ),
      60
    );

    if (!/^[A-Z]{2}$/.test(countryCode) || !countryName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid country code and country name are required.",
        },
        { status: 400 }
      );
    }

    const requests = DESTINATION_CLASSES.map(
      ([qid, label], index) => ({
        qid,
        label,
        perClassLimit:
          index <= 3
            ? Math.max(5, Math.ceil(limit / 5))
            : Math.max(2, Math.ceil(limit / 14)),
      })
    );

    const settled = await Promise.allSettled(
      requests.map(async ({ qid, label, perClassLimit }) => {
        const bindings = await runSparql(
          buildClassQuery(countryCode, qid, perClassLimit)
        );

        return bindings
          .map((binding) =>
            mapBinding(
              binding,
              countryCode,
              countryName,
              label
            )
          )
          .filter((place): place is TouristPlace => Boolean(place));
      })
    );

    const merged = new Map<string, TouristPlace>();

    for (const result of settled) {
      if (result.status !== "fulfilled") continue;

      for (const place of result.value) {
        const existing = merged.get(place.id);

        if (!existing) {
          merged.set(place.id, place);
          continue;
        }

        existing.categories = [
          ...new Set([...existing.categories, ...place.categories]),
        ];
        existing.imageUrl ||= place.imageUrl;
        existing.wikipediaUrl ||= place.wikipediaUrl;
        existing.stateOrRegion ||= place.stateOrRegion;
      }
    }

    const places = uniqueTouristPlaces([...merged.values()])
      .sort((a, b) => {
        const scoreA =
          (a.imageUrl ? 2 : 0) +
          (a.wikipediaUrl ? 2 : 0) +
          (a.categories.includes("Tourist Attraction") ? 2 : 0) +
          (a.categories.includes("City") ? 1 : 0);
        const scoreB =
          (b.imageUrl ? 2 : 0) +
          (b.wikipediaUrl ? 2 : 0) +
          (b.categories.includes("Tourist Attraction") ? 2 : 0) +
          (b.categories.includes("City") ? 1 : 0);

        return scoreB - scoreA || a.name.localeCompare(b.name);
      })
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      places,
      source: "wikidata",
      message:
        places.length === 0
          ? "No structured tourist destinations were returned for this country."
          : "",
    });
  } catch (error) {
    console.error("GLOBAL TOURIST DESTINATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load worldwide tourist destinations.",
      },
      { status: 500 }
    );
  }
}
