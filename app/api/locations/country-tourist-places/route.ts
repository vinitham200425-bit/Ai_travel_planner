import { NextRequest, NextResponse } from "next/server";
import {
  type TouristPlace,
  uniqueTouristPlaces,
} from "@/lib/tourist-place";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIKIDATA_ENDPOINT =
  "https://query.wikidata.org/sparql";

type WikidataBinding = {
  place?: { value?: string };
  placeLabel?: { value?: string };
  coord?: { value?: string };
  image?: { value?: string };
  article?: { value?: string };
  classLabel?: { value?: string };
  sitelinks?: { value?: string };
};

type WikidataResponse = {
  results?: {
    bindings?: WikidataBinding[];
  };
};

function parsePoint(
  point?: string
): { latitude: number; longitude: number } | null {
  if (!point) {
    return null;
  }

  const match = point.match(
    /^Point\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)$/
  );

  if (!match) {
    return null;
  }

  return {
    longitude: Number(match[1]),
    latitude: Number(match[2]),
  };
}

function getQid(entityUrl?: string): string {
  return entityUrl?.split("/").pop() ?? "";
}

async function getWikidataCountryPlaces(args: {
  countryCode: string;
  countryName: string;
  limit: number;
}): Promise<TouristPlace[]> {
  const query = `
SELECT DISTINCT
  ?place
  ?placeLabel
  ?coord
  ?image
  ?article
  ?classLabel
  ?sitelinks
WHERE {
  ?country wdt:P297 "${args.countryCode}".

  VALUES ?class {
    wd:Q570116
    wd:Q46169
    wd:Q33506
    wd:Q16970
    wd:Q842402
    wd:Q23397
    wd:Q23442
    wd:Q40080
    wd:Q8502
    wd:Q32815
    wd:Q839954
    wd:Q483110
    wd:Q16560
    wd:Q22698
    wd:Q4989906
    wd:Q9259
    wd:Q44613
    wd:Q35509
    wd:Q22746
  }

  ?place wdt:P17 ?country;
         wdt:P31 ?class;
         wdt:P625 ?coord.

  OPTIONAL { ?place wdt:P18 ?image. }

  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  OPTIONAL {
    ?place wikibase:sitelinks ?sitelinks.
  }

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en".
    ?place rdfs:label ?placeLabel.
    ?class rdfs:label ?classLabel.
  }
}
ORDER BY DESC(?sitelinks)
LIMIT ${args.limit}
`;

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
          "AITravelPlanner/1.0 (travel planner application)",
      },
      next: {
        revalidate: 43200,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Wikidata country tourist-place request failed (${response.status}).`
    );
  }

  const data =
    (await response.json()) as WikidataResponse;

  return (data.results?.bindings ?? [])
    .map((binding): TouristPlace | null => {
      const coordinates =
        parsePoint(binding.coord?.value);
      const name =
        binding.placeLabel?.value?.trim();
      const id = getQid(binding.place?.value);

      if (!coordinates || !name || !id) {
        return null;
      }

      const category =
        binding.classLabel?.value?.trim() ??
        "Tourist Attraction";

      return {
        id,
        name,
        countryCode: args.countryCode,
        countryName: args.countryName,
        stateOrRegion: "",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        categories: [category],
        description: `${name} — ${category}.`,
        imageUrl: binding.image?.value,
        wikipediaUrl: binding.article?.value,
        source: "wikidata",
      };
    })
    .filter(
      (place): place is TouristPlace =>
        Boolean(place)
    );
}

export async function GET(
  request: NextRequest
) {
  try {
    const countryCode =
      request.nextUrl.searchParams
        .get("countryCode")
        ?.trim()
        .toUpperCase() ?? "";

    const countryName =
      request.nextUrl.searchParams
        .get("countryName")
        ?.trim() ?? "";

    const requestedLimit = Number(
      request.nextUrl.searchParams.get("limit") ??
        300
    );

    const limit = Math.min(
      Math.max(
        Number.isFinite(requestedLimit)
          ? requestedLimit
          : 300,
        50
      ),
      500
    );

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid two-letter country code is required.",
        },
        { status: 400 }
      );
    }

    const places = uniqueTouristPlaces(
      await getWikidataCountryPlaces({
        countryCode,
        countryName:
          countryName || countryCode,
        limit,
      })
    ).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({
      success: true,
      places,
      source: "wikidata",
    });
  } catch (error) {
    console.error(
      "COUNTRY TOURIST PLACES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load tourist places for this country.",
      },
      { status: 500 }
    );
  }
}