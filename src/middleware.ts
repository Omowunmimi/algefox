import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/* ============================================================
   ROUTE GROUPS
   ============================================================ */

/** Routes that require an authenticated session. */
const PROTECTED_ROUTES = [
  '/home',
  '/learn',
  '/lesson',
  '/achievements',
  '/progress',
  '/daily-challenge',
  '/challenges',
  '/leaderboard',
  '/profile',
  '/reward',
  '/survey',
  '/research',
];

/** Routes only for unauthenticated users (redirect away if logged in). */
const AUTH_ROUTES = ['/login', '/signup'];

/** Onboarding routes — require auth but redirect based on step. */
const ONBOARDING_ROUTES = ['/onboarding', '/mascot-intro'];

/* ============================================================
   MIDDLEWARE
   ============================================================ */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the auth token (IMPORTANT: do not remove this call)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Unauthenticated access to protected routes ──────────────
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isOnboarding = ONBOARDING_ROUTES.some((r) => pathname.startsWith(r));

  if ((isProtected || isOnboarding) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ── Authenticated users visiting auth routes → check onboarding ─────
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && user) {
    // Check onboarding status before bouncing to home
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      // Still needs to see the Foxy intro
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/mascot-intro';
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/home';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

/* ============================================================
   MATCHER — skip static assets and API internals
   ============================================================ */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|sounds|avatars|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
