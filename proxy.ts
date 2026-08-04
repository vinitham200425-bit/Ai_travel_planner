import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest
) {
  const requestUrl = new URL(request.url);
  const code =
    requestUrl.searchParams.get("code");

  if (!code) {
    console.error(
      "Magic-link callback: code is missing."
    );

    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=missing_code",
        request.url
      )
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(
      code
    );

  if (error) {
    console.error(
      "Magic-link callback exchange failed:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=invalid_or_expired_link",
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL("/set-password", request.url)
  );
}