/**
 * Research Dashboard
 * Protected with RESEARCH_EXPORT_KEY env variable.
 *
 * Access: /research?key={RESEARCH_EXPORT_KEY}
 */
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Research Dashboard — AlgeFox',
};

/* ── Types ─────────────────────────────────────────────────── */

interface Profile {
  id: string;
  participant_id: string | null;
  skill_level: string | null;
  created_at: string;
  onboarding_completed: boolean;
}

interface UserStat {
  user_id: string;
  total_xp: number;
  level: number;
  lessons_completed: number;
  questions_answered: number;
  questions_correct: number;
}

interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface SurveyResponse {
  user_id: string | null;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  q5: number | null;
  open_text: string | null;
  submitted_at: string;
}

interface ParticipantRow {
  id: string;
  participantId: string;
  skillLevel: string | null;
  totalXp: number;
  level: number;
  lessonsCompleted: number;
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  hasSurvey: boolean;
  createdAt: string;
}

/* ── Helpers ────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function calcAccuracy(correct: number, answered: number): number {
  if (!answered) return 0;
  return Math.round((correct / answered) * 100);
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function avgOf(rows: ParticipantRow[], key: keyof ParticipantRow): number {
  if (!rows.length) return 0;
  const sum = rows.reduce((acc, r) => acc + (r[key] as number), 0);
  return Math.round(sum / rows.length);
}

/* ── Skill badge ────────────────────────────────────────────── */

function SkillBadge({ level }: { level: string | null }) {
  const colors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
  };
  const label = level ?? 'unknown';
  const cls = colors[label] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function ResearchPage({ searchParams }: Props) {
  const { key } = await searchParams;
  const validKey = process.env.RESEARCH_EXPORT_KEY;

  if (!validKey || key !== validKey) {
    redirect('/home');
  }

  /* ── Fetch data ─────────────────────────────────────────── */

  let participants: ParticipantRow[] = [];
  let dbError = false;

  try {
    const supabase = await createClient();

    const [
      profilesRes,
      statsRes,
      streaksRes,
      surveysRes,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, participant_id, skill_level, created_at, onboarding_completed'),
      supabase
        .from('user_stats')
        .select('user_id, total_xp, level, lessons_completed, questions_answered, questions_correct'),
      supabase
        .from('streaks')
        .select('user_id, current_streak, longest_streak, last_activity_date'),
      supabase
        .from('survey_responses')
        .select('user_id, q1, q2, q3, q4, q5, open_text, submitted_at'),
    ]);

    // Surface any hard errors
    const firstError = [profilesRes, statsRes, streaksRes, surveysRes].find((r) => r.error);
    if (firstError?.error) throw new Error(firstError.error.message);

    const profiles: Profile[] = profilesRes.data ?? [];
    const statsMap = new Map<string, UserStat>(
      (statsRes.data ?? []).map((s: UserStat) => [s.user_id, s]),
    );
    const streakMap = new Map<string, Streak>(
      (streaksRes.data ?? []).map((s: Streak) => [s.user_id, s]),
    );
    const surveySet = new Set<string>(
      (surveysRes.data ?? []).flatMap((s: SurveyResponse) => s.user_id ? [s.user_id] : []),
    );

    participants = profiles.map((p) => {
      const stat = statsMap.get(p.id);
      const streak = streakMap.get(p.id);
      const answered = stat?.questions_answered ?? 0;
      const correct = stat?.questions_correct ?? 0;
      return {
        id: p.id,
        participantId: p.participant_id ?? shortId(p.id),
        skillLevel: p.skill_level,
        totalXp: stat?.total_xp ?? 0,
        level: stat?.level ?? 1,
        lessonsCompleted: stat?.lessons_completed ?? 0,
        questionsAnswered: answered,
        questionsCorrect: correct,
        accuracy: calcAccuracy(correct, answered),
        currentStreak: streak?.current_streak ?? 0,
        longestStreak: streak?.longest_streak ?? 0,
        hasSurvey: surveySet.has(p.id),
        createdAt: p.created_at,
      };
    });
  } catch {
    dbError = true;
  }

  /* ── Summary stats ──────────────────────────────────────── */

  const totalParticipants = participants.length;
  const avgXp = avgOf(participants, 'totalXp');
  const avgAccuracy = avgOf(participants, 'accuracy');
  const surveyCount = participants.filter((p) => p.hasSurvey).length;
  const surveyRate = totalParticipants
    ? Math.round((surveyCount / totalParticipants) * 100)
    : 0;
  const keyBadge = validKey.slice(-4);

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Research Dashboard
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1 text-xs font-mono text-gray-600 border border-gray-200">
          key: ••••{keyBadge}
        </span>
      </div>

      {dbError ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-amber-800 font-ui text-sm">
          <p className="font-semibold mb-1">Database not yet seeded</p>
          <p className="text-amber-700">
            The required tables (profiles, user_stats, streaks, survey_responses) have not been
            created yet. Run the database migrations and try again.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <SummaryCard label="Participants" value={String(totalParticipants)} />
            <SummaryCard label="Avg XP" value={avgXp.toLocaleString()} />
            <SummaryCard label="Avg Accuracy" value={`${avgAccuracy}%`} />
            <SummaryCard label="Survey Rate" value={`${surveyRate}%`} suffix={`${surveyCount}/${totalParticipants}`} />
          </div>

          {/* Data table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-ui">
                <thead>
                  <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 whitespace-nowrap">ID</th>
                    <th className="px-4 py-3 whitespace-nowrap">Skill Level</th>
                    <th className="px-4 py-3 whitespace-nowrap">XP</th>
                    <th className="px-4 py-3 whitespace-nowrap">Level</th>
                    <th className="px-4 py-3 whitespace-nowrap">Lessons</th>
                    <th className="px-4 py-3 whitespace-nowrap">Accuracy</th>
                    <th className="px-4 py-3 whitespace-nowrap">Streak</th>
                    <th className="px-4 py-3 whitespace-nowrap">Survey</th>
                    <th className="px-4 py-3 whitespace-nowrap">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                        No participants yet.
                      </td>
                    </tr>
                  ) : (
                    participants.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                          {p.participantId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <SkillBadge level={p.skillLevel} />
                        </td>
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                          {p.totalXp.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                          {p.level}
                        </td>
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                          {p.lessonsCompleted}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={
                              p.questionsAnswered === 0
                                ? 'text-gray-400'
                                : p.accuracy >= 80
                                ? 'text-green-700 font-medium'
                                : p.accuracy >= 60
                                ? 'text-amber-700'
                                : 'text-red-600'
                            }
                          >
                            {p.questionsAnswered === 0 ? '—' : `${p.accuracy}%`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                          {p.currentStreak > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <span>🔥</span>
                              {p.currentStreak}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {p.hasSurvey ? (
                            <span className="text-green-600 font-semibold">✓</span>
                          ) : (
                            <span className="text-gray-300">✗</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(p.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CSV download */}
          <div className="mt-4 flex justify-end">
            <a
              href={`/api/research-export?key=${encodeURIComponent(key ?? '')}`}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Download CSV
            </a>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function SummaryCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <p className="text-xs font-ui font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-display font-semibold text-gray-900">{value}</p>
      {suffix && <p className="text-xs text-gray-400 mt-0.5">{suffix}</p>}
    </div>
  );
}
