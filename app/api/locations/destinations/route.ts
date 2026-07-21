import { NextRequest, NextResponse } from "next/server";

type GeoNamesPlace = {
  geonameId?: number;
  name?: string;
  toponymName?: string;
  asciiName?: string;
  countryName?: string;
  countryCode?: string;
  adminName1?: string;
  adminName2?: string;
  population?: number;
  lat?: string;
  lng?: string;
  fcode?: string;
  fcl?: string;
};

type GeoNamesSearchResponse = {
  totalResultsCount?: number;
  geonames?: GeoNamesPlace[];
  status?: {
    message?: string;
    value?: number;
  };
};

export async function GET(request: NextRequest) {
  try {
    const username = process.env.GEONAMES_USERNAME;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message:
            "GeoNames username is missing. Add GEONAMES_USERNAME to .env.local.",
        },
        { status: 500 }
      );
    }

    const countryCode = request.nextUrl.searchParams
      .get("countryCode")
      ?.trim()
      .toUpperCase();

    const query =
      request.nextUrl.searchParams.get("query")?.trim() || "";

    if (!countryCode || countryCode.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid two-letter country code is required.",
        },
        { status: 400 }
      );
    }

    const searchParams = new URLSearchParams({
      username,
      country: countryCode,
      featureClass: "P",
      orderby: "population",
      maxRows: "100",
      lang: "en",
      type: "json",
      style: "FULL",
    });

    /*
     * When the user types in the destination field,
     * GeoNames searches for matching cities inside the selected country.
     *
     * Without a query, GeoNames returns popular populated places
     * ordered by population.
     */
    if (query) {
      searchParams.set("name_startsWith", query);
      searchParams.set("fuzzy", "0.8");
    } else {
      searchParams.set("cities", "cities1000");
    }

    const response = await fetch(
      `https://secure.geonames.org/searchJSON?${searchParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load destinations from GeoNames.",
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as GeoNamesSearchResponse;

    if (data.status) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.status.message ||
            "GeoNames rejected the destinations request.",
        },
        { status: 502 }
      );
    }

    const seenDestinationNames = new Set<string>();

    const destinations = (data.geonames ?? [])
      .filter((place) => {
        const placeName =
          place.name?.trim() || place.toponymName?.trim();

        if (!placeName || !place.geonameId) {
          return false;
        }

        const uniqueKey = `${placeName.toLowerCase()}-${(
          place.adminName1 || ""
        ).toLowerCase()}`;

        if (seenDestinationNames.has(uniqueKey)) {
          return false;
        }

        seenDestinationNames.add(uniqueKey);
        return true;
      })
      .map((place) => {
        const name =
          place.name?.trim() ||
          place.toponymName?.trim() ||
          "";

        const region = place.adminName1?.trim() || "";

        return {
          id: String(place.geonameId),
          name,
          region,
          country: place.countryName?.trim() || "",
          countryCode: place.countryCode?.trim() || countryCode,
          population: Number(place.population) || 0,
          latitude: place.lat || "",
          longitude: place.lng || "",
          label: region ? `${name}, ${region}` : name,
        };
      })
      .slice(0, 50);

    return NextResponse.json({
      success: true,
      destinations,
      totalResults: data.totalResultsCount ?? destinations.length,
    });
  } catch (error) {
    console.error("Destinations API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while loading destinations.",
      },
      { status: 500 }
    );
  }
}