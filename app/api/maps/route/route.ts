import { NextRequest, NextResponse } from "next/server";
import { createStraightLineRoute } from "@/lib/map";
import type { MapDestination, RouteData } from "@/types/map";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OsrmRoute = {
  distance: number;
  duration: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  legs: Array<{
    distance: number;
    duration: number;
  }>;
};

type OsrmResponse = {
  code?: string;
  message?: string;
  routes?: OsrmRoute[];
};

function isValidDestination(
  value: unknown
): value is MapDestination {
  if (!value || typeof value !== "object") return false;

  const destination = value as Partial<MapDestination>;

  return (
    typeof destination.id === "string" &&
    typeof destination.name === "string" &&
    typeof destination.latitude === "number" &&
    Number.isFinite(destination.latitude) &&
    destination.latitude >= -90 &&
    destination.latitude <= 90 &&
    typeof destination.longitude === "number" &&
    Number.isFinite(destination.longitude) &&
    destination.longitude >= -180 &&
    destination.longitude <= 180
  );
}

export async function POST(request: NextRequest) {
  let destinations: MapDestination[] = [];

  try {
    const body = (await request.json()) as {
      destinations?: unknown[];
    };

    destinations = Array.isArray(body.destinations)
      ? body.destinations.filter(isValidDestination)
      : [];

    if (destinations.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least two valid destinations are required.",
        },
        { status: 400 }
      );
    }

    if (destinations.length > 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A maximum of 10 destinations is supported.",
        },
        { status: 400 }
      );
    }

    const coordinates = destinations
      .map(
        (destination) =>
          `${destination.longitude},${destination.latitude}`
      )
      .join(";");

    const params = new URLSearchParams({
      alternatives: "false",
      steps: "false",
      geometries: "geojson",
      overview: "full",
    });

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `OSRM returned status ${response.status}.`
      );
    }

    const data = (await response.json()) as OsrmResponse;
    const route = data.routes?.[0];

    if (data.code !== "Ok" || !route) {
      throw new Error(
        data.message || "No driving route was found."
      );
    }

    const result: RouteData = {
      geometry: route.geometry,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      legs: route.legs.map((leg, index) => ({
        from: destinations[index].name,
        to: destinations[index + 1].name,
        distanceMeters: leg.distance,
        durationSeconds: leg.duration,
      })),
      source: "osrm",
    };

    return NextResponse.json({
      success: true,
      route: result,
    });
  } catch (error) {
    console.warn(
      "OSRM route failed. Returning straight-line fallback:",
      error
    );

    if (destinations.length >= 2) {
      return NextResponse.json({
        success: true,
        route: createStraightLineRoute(destinations),
        warning:
          "Road routing is temporarily unavailable, so approximate straight-line distances are shown.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to calculate the route.",
      },
      { status: 500 }
    );
  }
}
