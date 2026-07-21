import { NextResponse } from "next/server";

type GeoNamesCountry = {
  countryCode?: string;
  countryName?: string;
  continent?: string;
  capital?: string;
  population?: string;
  geonameId?: number;
};

type GeoNamesCountryResponse = {
  geonames?: GeoNamesCountry[];
  status?: {
    message?: string;
    value?: number;
  };
};

export async function GET() {
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

    const searchParams = new URLSearchParams({
      username,
      lang: "en",
    });

    const response = await fetch(
      `https://secure.geonames.org/countryInfoJSON?${searchParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to load countries from GeoNames.",
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as GeoNamesCountryResponse;

    if (data.status) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.status.message ||
            "GeoNames rejected the countries request.",
        },
        { status: 502 }
      );
    }

    const countries = (data.geonames ?? [])
      .filter(
        (country) =>
          country.countryCode?.trim() &&
          country.countryName?.trim()
      )
      .map((country) => ({
        code: country.countryCode!.trim(),
        name: country.countryName!.trim(),
        continent: country.continent?.trim() || "",
        capital: country.capital?.trim() || "",
      }))
      .sort((firstCountry, secondCountry) =>
        firstCountry.name.localeCompare(secondCountry.name)
      );

    return NextResponse.json({
      success: true,
      countries,
    });
  } catch (error) {
    console.error("Countries API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while loading countries.",
      },
      { status: 500 }
    );
  }
}