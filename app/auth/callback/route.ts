import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const requestedNext =
    searchParams.get("next") ?? "/set-password";

  const next = requestedNext.startsWith("/")
    ? requestedNext
    : "/set-password";

  if (!code) {
    console.error("Auth callback: code is missing.");

    return NextResponse.redirect(
      `${origin}/forgot-password?error=missing_code`
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "Auth callback exchange error:",
      error
    );

    return NextResponse.redirect(
      `${origin}/forgot-password?error=callback_failed`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}