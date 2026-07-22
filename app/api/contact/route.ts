import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type ContactRequestBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequestBody;

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    // Hidden spam field. Real users will leave it empty.
    if (body.website?.trim()) {
      return NextResponse.json(
        { message: "Message received." },
        { status: 200 }
      );
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          error: "Name, email address and message are required.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name is too long." },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (subject.length > 150) {
      return NextResponse.json(
        { error: "Subject is too long." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must contain at least 10 characters." },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { error: "Message must not exceed 3000 characters." },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
      },
    });

    return NextResponse.json(
      {
        message:
          "Thank you for contacting us. Your message has been received.",
      },
      { status: 201 }
    );
  } catch (error) {
  console.error("Contact form error:", error);

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown contact form error";

  return NextResponse.json(
    {
      error:
        process.env.NODE_ENV === "development"
          ? errorMessage
          : "Unable to send your message right now. Please try again.",
    },
    { status: 500 }
  );
}
}