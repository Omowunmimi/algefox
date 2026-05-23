import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * GET /api/research-export?key={RESEARCH_EXPORT_KEY}
 * Returns anonymised participant data as CSV.
 * Protected by RESEARCH_EXPORT_KEY env variable.
 *
 * TODO: Expand with full data aggregation (Epic 7)
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const validKey = process.env.RESEARCH_EXPORT_KEY;

  if (!validKey || key !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Fetch anonymised participant data
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        participant_id,
        skill_level,
        created_at,
        user_stats (
          total_xp,
          level,
          lessons_completed,
          questions_answered,
          questions_correct
        ),
        streaks (
          longest_streak
        )
      `);

    if (error) {
      console.error('[research-export] DB error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Convert to CSV
    const rows = (profiles ?? []).map((p) => {
      const stats = Array.isArray(p.user_stats) ? p.user_stats[0] : p.user_stats;
      const streak = Array.isArray(p.streaks) ? p.streaks[0] : p.streaks;
      const accuracy =
        stats && stats.questions_answered > 0
          ? Math.round((stats.questions_correct / stats.questions_answered) * 100)
          : 0;

      return [
        p.participant_id ?? '',
        p.skill_level ?? '',
        new Date(p.created_at).toISOString().split('T')[0],
        stats?.total_xp ?? 0,
        stats?.level ?? 1,
        stats?.lessons_completed ?? 0,
        stats?.questions_answered ?? 0,
        stats?.questions_correct ?? 0,
        accuracy,
        streak?.longest_streak ?? 0,
      ].join(',');
    });

    const header = [
      'participant_id',
      'skill_level',
      'joined_date',
      'total_xp',
      'level',
      'lessons_completed',
      'questions_answered',
      'questions_correct',
      'accuracy_pct',
      'longest_streak',
    ].join(',');

    const csv = [header, ...rows].join('\n');
    const filename = `algefox-research-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[research-export] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
