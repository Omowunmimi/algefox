import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

/**
 * OAuth callback handler for Google Sign-In (PKCE flow).
 *
 * Flow:
 *  1. Exchange the code for a session
 *  2. Check if the user has a profile
 *  3a. New user       → create profile + user_stats + streaks → /mascot-intro
 *  3b. Mid-onboarding → /mascot-intro (they never completed intro)
 *  3c. Returning user → /home
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/home';
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  // Exchange code for session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('[auth/callback] Code exchange failed:', exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Get the authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  // Check for existing profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarding_completed, onboarding_step')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    // PGRST116 = row not found; anything else is a real error
    console.error('[auth/callback] Profile query failed:', profileError.message);
    return NextResponse.redirect(`${origin}/login?error=profile_error`);
  }

  // ── New user: no profile yet ─────────────────────────────
  if (!profile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      username: generateUsername(user),
      avatar_id: 'avatar-01',
      auth_provider: 'google',
      onboarding_step: 0,
      onboarding_completed: false,
    });

    if (insertError) {
      console.error('[auth/callback] Profile insert failed:', insertError.message);
      return NextResponse.redirect(`${origin}/login?error=profile_create_failed`);
    }

    // Create user_stats row
    await supabase.from('user_stats').insert({
      user_id: user.id,
      total_xp: 0,
      level: 1,
      hearts: 5,
      max_hearts: 5,
    });

    // Create streaks row
    await supabase.from('streaks').insert({
      user_id: user.id,
      current_streak: 0,
      longest_streak: 0,
    });

    // New user → Foxy intro screen
    return NextResponse.redirect(`${origin}/mascot-intro`);
  }

  // ── Mid-onboarding: never saw the intro → send there ─────
  if (!profile.onboarding_completed) {
    return NextResponse.redirect(`${origin}/mascot-intro`);
  }

  // ── Returning user: go home (or intended destination) ────
  // Validate the `next` param to prevent open redirects
  const safeNext = next.startsWith('/') ? next : '/home';
  return NextResponse.redirect(`${origin}${safeNext}`);
}

/* ── Helpers ───────────────────────────────────────────────── */

function generateUsername(user: { email?: string; user_metadata?: { full_name?: string; name?: string } }): string {
  // Try to derive a username from Google metadata
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'student';

  // Clean: lowercase, replace spaces with underscores, keep alphanumeric + underscores
  const cleaned = name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);

  // Append random 4-digit suffix to reduce collisions
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleaned}_${suffix}`;
}
