import { NextRequest, NextResponse } from "next/server";

type PhotonProperties = {
  osm_id?: number;
  osm_type?: string;
  osm_key?: string;
  osm_value?: string;
  type?: string;
  name?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  postcode?: string;
  extent?: number[];
};

type PhotonFeature = {
  type: "Feature";
  geometry?: {
    type: "Point";
    coordinates?: number[];
  };
  properties?: PhotonProperties;
};

type PhotonResponse = {
  type: "FeatureCollection";
  features?: PhotonFeature[];
};

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function formatCategory(value: string): string {
  if (!value) {
    return "Destination";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDescription(properties: PhotonProperties): string {
  return [
    properties.name,
    properties.city,
    properties.county,
    properties.state,
    properties.country,
  ]
    .map(cleanText)
    .filter(Boolean)
    .filter(
      (value, index, values) =>
        values.findIndex(
          (item) => item.toLowerCase() === value.toLowerCase()
        ) === index
    )
    .join(", ");
}

export async function GET(request: NextRequest) {
  try {
    const query = cleanText(
      request.nextUrl.searchParams.get("query")
    );

    const countryCode = cleanText(
      request.nextUrl.searchParams.get("countryCode")
    ).toUpperCase();

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        places: [],
      });
    }

    if (!countryCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Country code is required.",
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      q: query,
      limit: "10",
      lang: "en",
    });

    const response = await fetch(
      `https://photon.komoot.io/api/?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Destination search failed with status ${response.status}.`
      );
    }

    const data = (await response.json()) as PhotonResponse;

    const seen = new Set<string>();

    const places = (data.features ?? [])
      .map((feature) => {
        const properties = feature.properties ?? {};
        const coordinates = feature.geometry?.coordinates ?? [];

        const longitude = Number(coordinates[0]);
        const latitude = Number(coordinates[1]);

        const resultCountryCode = cleanText(
          properties.countrycode
        ).toUpperCase();

        if (
          resultCountryCode &&
          resultCountryCode !== countryCode
        ) {
          return null;
        }

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return null;
        }

        const name =
          cleanText(properties.name) ||
          cleanText(properties.city);

        if (!name) {
          return null;
        }

        const duplicateKey = `${name.toLowerCase()}-${latitude.toFixed(
          4
        )}-${longitude.toFixed(4)}`;

        if (seen.has(duplicateKey)) {
          return null;
        }

        seen.add(duplicateKey);

        const placeType =
          cleanText(properties.type) ||
          cleanText(properties.osm_value);

        return {
          id: `photon-${
            properties.osm_type ?? "place"
          }-${properties.osm_id ?? duplicateKey}`,
          name,
          countryName:
            cleanText(properties.country) || countryCode,
          countryCode:
            resultCountryCode || countryCode,
          stateOrRegion:
            cleanText(properties.state) ||
            cleanText(properties.county),
          description:
            getDescription(properties) || name,
          categories: [formatCategory(placeType)],
          latitude,
          longitude,
          imageUrl: "",
          source: "Photon / OpenStreetMap",
        };
      })
      .filter(
        (
          place
        ): place is {
          id: string;
          name: string;
          countryName: string;
          countryCode: string;
          stateOrRegion: string;
          description: string;
          categories: string[];
          latitude: number;
          longitude: number;
          imageUrl: string;
          source: string;
        } => place !== null
      )
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      places,
    });
  } catch (error) {
    console.error("Destination search error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to search destinations.",
      },
      { status: 500 }
    );
  }
}