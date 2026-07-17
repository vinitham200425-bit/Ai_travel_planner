import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing.");
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(name, value, options);
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/my-trips",
    "/profile",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  // Logged-out users cannot access protected pages
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";

    return NextResponse.redirect(loginUrl);
  }

  const authRoutes = ["/login", "/signup"];

  // Logged-in users visiting login/signup go to home
  if (user && authRoutes.includes(pathname)) {
    const homeUrl = request.nextUrl.clone();

    homeUrl.pathname = "/";

    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-trips/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
};