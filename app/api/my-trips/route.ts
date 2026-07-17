import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json(
        {
          success: false,
          message: "You must be logged in.",
        },
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
    });

    return Response.json({
      success: true,
      trips,
    });
  } catch (error) {
    console.error("MY TRIPS API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load trips.",
      },
      { status: 500 }
    );
  }
}