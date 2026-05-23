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
  '/reward',
  '/survey',
  '/research',
];

/** Routes only for unauthenticated users (redirect away if logged in). */
const AUTH_ROUTES = ['/login', '/signup'];

/** Onboarding routes — require auth but redirect based on step. */
const ONBOARDING_ROUTES = ['/onboarding'];

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

  // ── Authenticated users visiting auth routes → /home ────────
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && user) {
    // Check onboarding status before bouncing to home
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed, onboarding_step')
      .eq('id', user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getOnboardingPath(profile.onboarding_step);
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/home';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

/** Maps onboarding_step integer to the correct onboarding route. */
function getOnboardingPath(step: number): string {
  switch (step) {
    case 0:
    case 1:
      return '/onboarding/profile';
    case 2:
      return '/onboarding/skill-level';
    default:
      return '/home';
  }
}

/* ============================================================
   MATCHER — skip static assets and API internals
   ============================================================ */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|sounds|avatars|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
