import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log("AUTH CALLBACK OPENED:", requestUrl.toString());
  console.log("AUTH CALLBACK CODE PRESENT:", Boolean(code));

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=missing_code",
        request.url
      )
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "AUTH CALLBACK EXCHANGE ERROR:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=callback_failed",
        request.url
      )
    );
  }

  console.log(
    "AUTH CALLBACK SUCCESS: redirecting to set-password"
  );

  return NextResponse.redirect(
    new URL("/set-password", request.url)
  );
}