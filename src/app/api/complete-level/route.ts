import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * POST /api/complete-level
 * Marks a lesson session as completed and updates user_progress.
 *
 * Body: {
 *   sessionId: string;
 *   sectionId: string;
 *   level: number;
 *   xpEarned: number;
 *   heartsLost: number;
 *   questionsTotal: number;
 *   questionsCorrect: number;
 *   timeTakenSeconds: number;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      sessionId: string;
      sectionId: string;
      level: number;
      xpEarned: number;
      heartsLost: number;
      questionsTotal: number;
      questionsCorrect: number;
      timeTakenSeconds: number;
    };

    const {
      sessionId,
      sectionId,
      level,
      xpEarned,
      heartsLost,
      questionsTotal,
      questionsCorrect,
      timeTakenSeconds,
    } = body;

    // Validate session ownership
    const { data: session } = await supabase
      .from('lesson_sessions')
      .select('user_id, status')
      .eq('id', sessionId)
      .single();

    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json({ error: 'Session already finalised' }, { status: 400 });
    }

    // Mark session as completed
    await supabase
      .from('lesson_sessions')
      .update({
        status: 'completed',
        xp_earned: xpEarned,
        hearts_lost: heartsLost,
        questions_total: questionsTotal,
        questions_correct: questionsCorrect,
        time_taken_seconds: timeTakenSeconds,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    // Upsert user_progress
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('id, current_level, highest_level')
      .eq('user_id', user.id)
      .eq('section_id', sectionId)
      .single();

    if (existingProgress) {
      await supabase
        .from('user_progress')
        .update({
          current_level: Math.max(existingProgress.current_level, level + 1),
          highest_level: Math.max(existingProgress.highest_level, level),
        })
        .eq('id', existingProgress.id);
    } else {
      await supabase.from('user_progress').insert({
        user_id: user.id,
        section_id: sectionId,
        current_level: level + 1,
        highest_level: level,
        is_unlocked: true,
        is_completed: false,
      });
    }

    // Update aggregate stats (best-effort — RPC may not exist yet)
    try {
      await supabase.rpc('increment_user_stats' as never, {
        p_user_id: user.id,
        p_lessons: 1,
        p_questions_answered: questionsTotal,
        p_questions_correct: questionsCorrect,
      } as never);
    } catch {
      // Graceful degradation if RPC doesn't exist in DB yet
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[complete-level] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
