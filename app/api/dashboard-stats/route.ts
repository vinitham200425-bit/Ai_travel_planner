import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const trips = await prisma.trip.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        destination: true,
        days: true,
        budget: true,
        travelers: true,
        travelStyle: true,
        hotelCategory: true,
        createdAt: true,
      },
    });

    const uniqueDestinations = new Set(
      trips.map((trip) => trip.destination.trim().toLowerCase())
    ).size;

    const totalBudget = trips.reduce(
      (total, trip) => total + trip.budget,
      0
    );

    const latestTrip = trips.length > 0 ? trips[0] : null;

    const recentTrips = trips.slice(0, 5);

    return NextResponse.json({
      totalTrips: trips.length,
      uniqueDestinations,
      totalBudget,
      latestTrip,
      recentTrips,
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return NextResponse.json(
      {
        error: "Unable to load dashboard statistics.",
      },
      { status: 500 }
    );
  }
}