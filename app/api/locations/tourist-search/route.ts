import { NextRequest, NextResponse } from "next/server";
import {
  humanizeKinds,
  TOURISM_KINDS,
  type TouristPlace,
} from "@/lib/opentripmap";

const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

type OtmItem = {
  xid?: string;
  name?: string;
  kinds?: string;
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

type GeoName = {
  name?: string;
  country?: string;
  lat?: number;
  lon?: number;
  status?: string;
};

function apiKey() {
  const key = process.env.OPENTRIPMAP_API_KEY?.trim();
  if (!key) throw new Error("OPENTRIPMAP_API_KEY is missing.");
  return key;
}

async function details(xid: string, key: string): Promise<OtmItem | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/xid/${encodeURIComponent(xid)}?apikey=${encodeURIComponent(key)}`,
      { cache: "no-store" }
    );
    return response.ok ? ((await response.json()) as OtmItem) : null;
  } catch {
    return null;
  }
}

function normalize(item: OtmItem, countryCode: string): TouristPlace | null {
  const name = item.name?.trim();
  const lat = item.point?.lat;
  const lon = item.point?.lon;

  if (!item.xid || !name || typeof lat !== "number" || typeof lon !== "number") {
    return null;
  }

  const description =
    item.wikipedia_extracts?.text?.replace(/\s+/g, " ").trim() ||
    item.info?.descr?.replace(/\s+/g, " ").trim() ||
    "Popular tourist or travel place.";

  return {
    id: item.xid,
    name,
    countryCode: (item.address?.country_code ?? countryCode).toUpperCase(),
    stateOrRegion:
      item.address?.state ?? item.address?.region ?? item.address?.city ?? "",
    latitude: lat,
    longitude: lon,
    categories: humanizeKinds(item.kinds),
    description:
      description.length > 180 ? `${description.slice(0, 179).trim()}…` : description,
  };
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
    const countryCode =
      request.nextUrl.searchParams.get("countryCode")?.trim().toUpperCase() ?? "";

    if (query.length < 2 || !countryCode) {
      return NextResponse.json(
        { success: false, message: "Select a country and enter at least 2 characters." },
        { status: 400 }
      );
    }

    const key = apiKey();
    const suggestParams = new URLSearchParams({
      name: query,
      kinds: TOURISM_KINDS,
      rate: "2",
      limit: "12",
      format: "json",
      apikey: key,
    });
    const geonameParams = new URLSearchParams({
      name: query,
      country: countryCode,
      apikey: key,
    });

    const [suggestResponse, geonameResponse] = await Promise.all([
      fetch(`${BASE_URL}/autosuggest?${suggestParams}`, { cache: "no-store" }),
      fetch(`${BASE_URL}/geoname?${geonameParams}`, { cache: "no-store" }),
    ]);

    const suggestions: OtmItem[] = suggestResponse.ok
      ? await suggestResponse.json()
      : [];
    const geoname: GeoName | null = geonameResponse.ok
      ? await geonameResponse.json()
      : null;

    const filtered = Array.isArray(suggestions)
      ? suggestions.filter((item) => {
          const code = item.address?.country_code?.toUpperCase();
          return !code || code === countryCode;
        })
      : [];

    const expanded = await Promise.all(
      filtered.slice(0, 12).map(async (item) =>
        item.xid ? (await details(item.xid, key)) ?? item : item
      )
    );

    const places = expanded
      .map((item) => normalize(item, countryCode))
      .filter((item): item is TouristPlace => Boolean(item));

    if (
      geoname?.status === "OK" &&
      geoname.name &&
      typeof geoname.lat === "number" &&
      typeof geoname.lon === "number"
    ) {
      places.unshift({
        id: `geoname-${countryCode}-${geoname.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: geoname.name,
        countryCode,
        stateOrRegion: "",
        latitude: geoname.lat,
        longitude: geoname.lon,
        categories: ["Travel Destination"],
        description: "Main destination. Select it to discover nearby tourist attractions.",
      });
    }

    const unique = Array.from(
      new Map(
        places.map((place) => [
          `${place.name.toLowerCase()}-${place.latitude.toFixed(3)}-${place.longitude.toFixed(3)}`,
          place,
        ])
      ).values()
    ).slice(0, 12);

    return NextResponse.json({ success: true, places: unique });
  } catch (error) {
    console.error("TOURIST SEARCH ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to search tourist places.",
      },
      { status: 500 }
    );
  }
}
