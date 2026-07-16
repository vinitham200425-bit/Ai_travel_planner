import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }

    const trips = await prisma.trip.findMany({
      where: {
        userId,
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
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch trips.",
      },
      {
        status: 500,
      }
    );
  }
}