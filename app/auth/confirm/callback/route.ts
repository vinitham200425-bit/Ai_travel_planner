import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const requestedNext =
    requestUrl.searchParams.get("next") ?? "/set-password";

  const nextPath = requestedNext.startsWith("/")
    ? requestedNext
    : "/set-password";

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=invalid_magic_link",
        request.url
      )
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Magic-link callback error:", error);

    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=invalid_or_expired_link",
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(nextPath, request.url)
  );
}