import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Trip ID is required.",
        },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: {
        id,
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
    console.error("GET TRIP ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load the trip.",
      },
      { status: 500 }
    );
  }
}