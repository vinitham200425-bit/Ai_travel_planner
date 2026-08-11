import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { createSupabaseServerClient } from "@/lib/server/supabase";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.aitrips.in"
  );
}

function createShareToken(): string {
  return randomBytes(24).toString("hex");
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Trip ID is required.",
        },
        { status: 400 }
      );
    }

    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in before sharing a trip.",
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
        shareToken: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Trip not found or you do not have permission to share it.",
        },
        { status: 404 }
      );
    }

    let shareToken = trip.shareToken;

    if (!shareToken) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const candidate = createShareToken();

        const existing =
          await prisma.trip.findUnique({
            where: {
              shareToken: candidate,
            },
            select: {
              id: true,
            },
          });

        if (!existing) {
          shareToken = candidate;
          break;
        }
      }
    }

    if (!shareToken) {
      throw new Error(
        "Unable to create a secure share token."
      );
    }

    await prisma.trip.update({
      where: {
        id,
      },
      data: {
        isPublic: true,
        shareToken,
      },
    });

    const shareUrl =
      `${getSiteUrl()}/shared-trip/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareUrl,
    });
  } catch (error) {
    console.error("SHARE TRIP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to share this trip.",
      },
      { status: 500 }
    );
  }
}