import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!trip) {
      return Response.json(
        {
          success: false,
          message: "Trip not found.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      trip,
    });
  } catch (error) {
    console.error("TRIP DETAILS API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load trip details.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isFavorite } = body;

    if (typeof isFavorite !== "boolean") {
      return Response.json(
        {
          success: false,
          message: "A valid favorite status is required.",
        },
        { status: 400 }
      );
    }

    const existingTrip = await prisma.trip.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingTrip) {
      return Response.json(
        {
          success: false,
          message: "Trip not found.",
        },
        { status: 404 }
      );
    }

    const updatedTrip = await prisma.trip.update({
      where: {
        id: existingTrip.id,
      },
      data: {
        isFavorite,
      },
    });

    return Response.json({
      success: true,
      message: isFavorite
        ? "Trip added to favorites."
        : "Trip removed from favorites.",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("UPDATE FAVORITE API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to update favorite status.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!trip) {
      return Response.json(
        {
          success: false,
          message: "Trip not found.",
        },
        { status: 404 }
      );
    }

    await prisma.trip.delete({
      where: {
        id: trip.id,
      },
    });

    return Response.json({
      success: true,
      message: "Trip deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE TRIP API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to delete the trip.",
      },
      { status: 500 }
    );
  }
}