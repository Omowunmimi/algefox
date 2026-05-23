'use client';

import { useUserStore, selectAccuracy } from '@/stores/useUserStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { SectionProgress } from '@/types/lesson.types';

/* ── Mock data (used until DB is seeded) ───────────────────── */
const MOCK_SECTIONS: SectionProgress[] = [
  {
    sectionId: 'sec1',
    sectionSlug: 'fractions-intro',
    sectionTitle: 'Introduction to Fractions',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: true,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec2',
    sectionSlug: 'fractions-operations',
    sectionTitle: 'Fraction Operations',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec3',
    sectionSlug: 'algebra-intro',
    sectionTitle: 'Introduction to Algebra',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
  {
    sectionId: 'sec4',
    sectionSlug: 'algebra-expressions',
    sectionTitle: 'Algebraic Expressions',
    currentLevel: 1,
    highestLevel: 0,
    isUnlocked: false,
    isCompleted: false,
    progressPercent: 0,
  },
];

function getSubjectVariant(sectionSlug: string): 'primary' | 'secondary' {
  return sectionSlug.startsWith('algebra') ? 'secondary' : 'primary';
}

/* ── Summary stat card ──────────────────────────────────────── */
function SummaryCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-100 mb-5"
      style={{ boxShadow: 'var(--shadow-elevation-1)' }}
    >
      {children}
    </div>
  );
}

function SummaryStat({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className={`font-display text-3xl font-bold ${color}`}>{value}</span>
      <span className="font-ui text-xs text-gray-500 text-center mt-0.5">{label}</span>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function ProgressPage() {
  const stats = useUserStore((s) => s.stats);
  const accuracy = useUserStore(selectAccuracy);

  const totalXp = stats?.totalXp ?? 0;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;
  const questionsAnswered = stats?.questionsAnswered ?? 0;

  // Mock recent sessions (empty for now)
  const recentSessions: Array<{
    id: string;
    date: string;
    sectionTitle: string;
    xpEarned: number;
    accuracy: number;
  }> = [];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Page header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 mb-4">
        <h1 className="font-display text-2xl font-bold text-gray-900">My Progress</h1>
        <p className="font-ui text-sm text-gray-500 mt-0.5">Track your learning journey</p>
      </div>

      <div className="px-5">
        {/* ── Overall stats summary ── */}
        <h2 className="font-display text-base font-bold text-gray-800 mb-3">Overall</h2>
        <SummaryCard>
          <div className="grid grid-cols-3 gap-4 divide-x divide-gray-100">
            <SummaryStat value={totalXp} label="Total XP" color="text-primary" />
            <SummaryStat value={`${accuracy}%`} label="Accuracy" color="text-success" />
            <SummaryStat value={lessonsCompleted} label="Lessons done" color="text-secondary" />
          </div>

          {/* Extra: questions answered */}
          {questionsAnswered > 0 && (
            <p className="font-ui text-xs text-center text-gray-400 mt-4">
              {questionsAnswered} questions answered in total
            </p>
          )}
        </SummaryCard>

        {/* ── Section progress bars ── */}
        <h2 className="font-display text-base font-bold text-gray-800 mb-3">Sections</h2>
        <div
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 space-y-5"
          style={{ boxShadow: 'var(--shadow-elevation-1)' }}
        >
          {MOCK_SECTIONS.map((section) => {
            const pct = section.isUnlocked
              ? Math.round(section.progressPercent * 100)
              : 0;
            const variant = getSubjectVariant(section.sectionSlug);

            return (
              <div key={section.sectionId}>
                <ProgressBar
                  value={pct}
                  variant={variant}
                  size="normal"
                  label={section.sectionTitle}
                  showPercent
                  animated
                />
                {!section.isUnlocked && (
                  <p className="font-ui text-xs text-gray-400 mt-1">Locked</p>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Recent activity ── */}
        <h2 className="font-display text-base font-bold text-gray-800 mb-3">Recent Activity</h2>
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: 'var(--shadow-elevation-1)' }}
        >
          {recentSessions.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <span className="text-3xl" aria-hidden="true">📚</span>
              <p className="font-ui text-sm text-gray-500 text-center">
                No lessons completed yet.{'\n'}Start learning to see your activity here!
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentSessions.map((session) => (
                <li key={session.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-sm font-semibold text-gray-900 truncate">
                      {session.sectionTitle}
                    </p>
                    <p className="font-ui text-xs text-gray-500">{session.date}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-ui text-xs font-bold text-success">
                      {session.accuracy}%
                    </span>
                    <span className="font-ui text-xs font-bold text-primary">
                      +{session.xpEarned} XP
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
