import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * POST /api/award-xp
 * Server-side XP award with validation — prevents client-side manipulation.
 *
 * Body: { sessionId: string; xpAmount: number; reason: string }
 *
 * TODO: Add Supabase Edge Function mirror for extra security (Epic 5)
 */

const MAX_XP_PER_LESSON = 300; // Guard against bogus requests

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      sessionId: string;
      xpAmount: number;
      reason: string;
    };

    const { sessionId, xpAmount } = body;

    if (!sessionId || typeof xpAmount !== 'number' || xpAmount < 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (xpAmount > MAX_XP_PER_LESSON) {
      return NextResponse.json({ error: 'XP amount exceeds maximum' }, { status: 400 });
    }

    // Verify the session belongs to this user
    const { data: session } = await supabase
      .from('lesson_sessions')
      .select('user_id, status')
      .eq('id', sessionId)
      .single();

    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'completed') {
      return NextResponse.json({ error: 'Session not completed' }, { status: 400 });
    }

    // Award XP
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('total_xp, level')
      .eq('user_id', user.id)
      .single();

    if (statsError || !stats) {
      return NextResponse.json({ error: 'Stats not found' }, { status: 404 });
    }

    const newXp = stats.total_xp + xpAmount;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    await supabase
      .from('user_stats')
      .update({ total_xp: newXp, level: newLevel })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      newTotalXp: newXp,
      newLevel,
      levelUp: newLevel > stats.level,
    });
  } catch (error) {
    console.error('[award-xp] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
