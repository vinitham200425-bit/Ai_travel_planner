import { NextRequest, NextResponse } from "next/server";
import {
  type TouristPlace,
  uniqueTouristPlaces,
} from "@/lib/tourist-place";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";
const OPENTRIPMAP_BASE =
  "https://api.opentripmap.com/0.1/en/places";

type WikidataBinding = {
  place?: { value?: string };
  placeLabel?: { value?: string };
  coord?: { value?: string };
  image?: { value?: string };
  article?: { value?: string };
  distance?: { value?: string };
  classLabel?: { value?: string };
};

type WikidataResponse = {
  results?: { bindings?: WikidataBinding[] };
};

type OpenTripMapItem = {
  xid?: string;
  name?: string;
  kinds?: string;
  dist?: number;
  point?: { lat?: number; lon?: number };
  address?: {
    country_code?: string;
    state?: string;
    region?: string;
    city?: string;
  };
  wikipedia_extracts?: { text?: string };
  info?: { descr?: string };
};

function parsePoint(
  point?: string
): { latitude: number; longitude: number } | null {
  if (!point) return null;

  const match = point.match(
    /^Point\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)$/
  );

  if (!match) return null;

  return {
    longitude: Number(match[1]),
    latitude: Number(match[2]),
  };
}

function getQid(entityUrl?: string): string {
  return entityUrl?.split("/").pop() ?? "";
}

function humanizeKinds(kinds?: string): string[] {
  if (!kinds) return ["Tourist Attraction"];

  const ignored = new Set([
    "interesting_places",
    "other",
    "unclassified_objects",
    "tourist_facilities",
  ]);

  const labels = kinds
    .split(",")
    .map((kind) => kind.trim())
    .filter(Boolean)
    .filter((kind) => !ignored.has(kind))
    .map((kind) =>
      kind
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    );

  return [...new Set(labels)].slice(0, 5).length
    ? [...new Set(labels)].slice(0, 5)
    : ["Tourist Attraction"];
}

async function getOpenTripMapNearby(args: {
  apiKey: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  radiusKm: number;
  limit: number;
}): Promise<TouristPlace[]> {
  const params = new URLSearchParams({
    radius: String(Math.round(args.radiusKm * 1000)),
    lon: String(args.longitude),
    lat: String(args.latitude),
    kinds: [
      "interesting_places",
      "cultural",
      "historic",
      "natural",
      "religion",
      "architecture",
      "museums",
      "amusements",
      "beaches",
      "view_points",
      "water",
      "mountain_peaks",
      "national_parks",
    ].join(","),
    rate: "2",
    limit: String(args.limit),
    format: "json",
    apikey: args.apiKey,
  });

  const response = await fetch(
    `${OPENTRIPMAP_BASE}/radius?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(
      `OpenTripMap nearby request failed (${response.status}).`
    );
  }

  const raw = (await response.json()) as OpenTripMapItem[];

  return raw
    .map((item): TouristPlace | null => {
      const name = item.name?.trim();
      const latitude = item.point?.lat;
      const longitude = item.point?.lon;
      const returnedCountry =
        item.address?.country_code?.toUpperCase();

      if (
        !item.xid ||
        !name ||
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        (returnedCountry &&
          returnedCountry !== args.countryCode)
      ) {
        return null;
      }

      return {
        id: item.xid,
        name,
        countryCode: returnedCountry ?? args.countryCode,
        countryName: "",
        stateOrRegion:
          item.address?.state ??
          item.address?.region ??
          item.address?.city ??
          "",
        latitude,
        longitude,
        categories: humanizeKinds(item.kinds),
        description:
          item.wikipedia_extracts?.text ??
          item.info?.descr ??
          "Nearby tourist place.",
        distanceKm:
          typeof item.dist === "number"
            ? Math.round((item.dist / 1000) * 10) / 10
            : undefined,
        source: "opentripmap",
      };
    })
    .filter((place): place is TouristPlace => Boolean(place));
}

async function getWikidataNearby(args: {
  latitude: number;
  longitude: number;
  countryCode: string;
  countryName: string;
  radiusKm: number;
  limit: number;
}): Promise<TouristPlace[]> {
  const query = `
SELECT DISTINCT
  ?place
  ?placeLabel
  ?coord
  ?image
  ?article
  ?distance
  ?classLabel
WHERE {
  ?country wdt:P297 "${args.countryCode}".

  VALUES ?class {
    wd:Q570116
    wd:Q46169
    wd:Q8502
    wd:Q23397
    wd:Q23442
    wd:Q40080
    wd:Q839954
    wd:Q33506
    wd:Q16970
    wd:Q32815
    wd:Q842402
  }

  ?place wdt:P17 ?country;
         wdt:P31 ?class;
         wdt:P625 ?coord.

  SERVICE wikibase:around {
    ?place wdt:P625 ?coord.
    bd:serviceParam
      wikibase:center "Point(${args.longitude} ${args.latitude})"^^geo:wktLiteral;
      wikibase:radius "${args.radiusKm}";
      wikibase:distance ?distance.
  }

  OPTIONAL { ?place wdt:P18 ?image. }

  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en".
    ?place rdfs:label ?placeLabel.
    ?class rdfs:label ?classLabel.
  }
}
ORDER BY ASC(?distance)
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
          "AITravelPlanner/1.0 (contact: vinitham200425@gmail.com)",
      },
      next: { revalidate: 43200 },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Wikidata nearby request failed (${response.status}).`
    );
  }

  const data = (await response.json()) as WikidataResponse;

  return (data.results?.bindings ?? [])
    .map((binding): TouristPlace | null => {
      const coordinates = parsePoint(binding.coord?.value);
      const name = binding.placeLabel?.value?.trim();
      const id = getQid(binding.place?.value);

      if (!coordinates || !name || !id) return null;

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
        description: `${name} is a nearby ${category.toLowerCase()} that may be suitable for this trip.`,
        imageUrl: binding.image?.value,
        wikipediaUrl: binding.article?.value,
        distanceKm: binding.distance?.value
          ? Math.round(Number(binding.distance.value) * 10) / 10
          : undefined,
        source: "wikidata",
      };
    })
    .filter((place): place is TouristPlace => Boolean(place));
}

export async function GET(request: NextRequest) {
  try {
    const latitude = Number(
      request.nextUrl.searchParams.get("latitude")
    );
    const longitude = Number(
      request.nextUrl.searchParams.get("longitude")
    );
    const countryCode =
      request.nextUrl.searchParams
        .get("countryCode")
        ?.trim()
        .toUpperCase() ?? "";
    const countryName =
      request.nextUrl.searchParams.get("countryName")?.trim() ?? "";
    const radiusKm = Math.min(
      Math.max(
        Number(request.nextUrl.searchParams.get("radiusKm") ?? 100),
        5
      ),
      200
    );
    const limit = Math.min(
      Math.max(
        Number(request.nextUrl.searchParams.get("limit") ?? 12),
        1
      ),
      20
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !/^[A-Z]{2}$/.test(countryCode)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid coordinates and a country code are required.",
        },
        { status: 400 }
      );
    }

    const openTripMapKey =
      process.env.OPENTRIPMAP_API_KEY?.trim();

    if (openTripMapKey) {
      try {
        const openTripMapPlaces = await getOpenTripMapNearby({
          apiKey: openTripMapKey,
          latitude,
          longitude,
          countryCode,
          radiusKm,
          limit,
        });

        if (openTripMapPlaces.length > 0) {
          return NextResponse.json({
            success: true,
            places: uniqueTouristPlaces(openTripMapPlaces),
            source: "opentripmap",
          });
        }
      } catch (error) {
        console.warn(
          "OpenTripMap failed; using Wikidata fallback:",
          error
        );
      }
    }

    const wikidataPlaces = await getWikidataNearby({
      latitude,
      longitude,
      countryCode,
      countryName,
      radiusKm,
      limit,
    });

    return NextResponse.json({
      success: true,
      places: uniqueTouristPlaces(wikidataPlaces),
      source: "wikidata",
    });
  } catch (error) {
    console.error("NEARBY TOURIST PLACES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load nearby tourist places.",
      },
      { status: 500 }
    );
  }
}
