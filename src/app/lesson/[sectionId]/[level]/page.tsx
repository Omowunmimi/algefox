'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { InlineMath, BlockMath } from 'react-katex';
import Image from 'next/image';
import {
  useLessonStore,
  selectCurrentQuestion,
} from '@/stores/useLessonStore';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useLesson } from '@/hooks/useLesson';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { FeedbackOverlay } from '@/components/lesson/FeedbackOverlay';
import { QuitConfirmModal } from '@/components/lesson/QuitConfirmModal';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import { createClient } from '@/lib/supabase/client';

// ─── Math text helper ─────────────────────────────────────────────────────────

function renderMathText(text: string): ReactNode {
  if (!text.includes('$')) return text;
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Extract the LaTeX string from the first $...$ block in text, if any */
function extractDisplayMath(text: string): string | null {
  // Collect all $...$ segments and join them to form a display expression
  const matches = [...text.matchAll(/\$([^$]+)\$/g)];
  if (matches.length === 0) return null;
  return matches.map((m) => m[1]).join(' = ');
}

/* ── Mascot + question card ──────────────────────────────────── */

function QuestionCard({
  questionText,
  xpGain,
}: {
  questionText: string;
  xpGain: number;
}) {
  const displayMath = extractDisplayMath(questionText);
  // Non-math part (everything before the first $)
  const instrText = questionText.includes('$')
    ? questionText.split('$')[0].trim().replace(/\?$/, '').trim()
    : questionText;

  return (
    <div
      className="mx-4 rounded-3xl overflow-hidden"
      style={{ background: '#FFFFFF', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
    >
      {/* Mascot + speech bubble row */}
      <div className="flex items-center gap-3 p-4 pb-2">
        {/* Foxy — large */}
        <div className="flex-shrink-0">
          <Image
            src="/mascot/foxy-excited.png"
            alt="Foxy the fox"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </div>

        {/* Speech bubble */}
        <div className="relative flex-1">
          {/* Tail left */}
          <span
            aria-hidden="true"
            className="absolute -left-3 top-1/2 -translate-y-1/2"
            style={{
              width: 0, height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '10px solid #F3F4F6',
            }}
          />
          <div className="rounded-2xl px-4 py-3" style={{ background: '#F3F4F6' }}>
            <p className="font-display text-base font-bold text-gray-900 leading-snug">
              {instrText || 'Let\'s solve this together!'}
            </p>
          </div>
        </div>

        {/* +XP badge */}
        <motion.div
          className="flex-shrink-0 flex items-center gap-1 rounded-xl px-3 py-1.5"
          style={{ background: '#FEF9C3', border: '1.5px solid #FDE047' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-base">⭐</span>
          <span className="font-display text-sm font-bold text-yellow-700">+{xpGain}</span>
        </motion.div>
      </div>

      {/* Large math display (if question has LaTeX) */}
      {displayMath && (
        <div className="px-4 py-4 text-center">
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-3xl font-bold"
            style={{ background: '#F5F0FF' }}
          >
            <BlockMath math={displayMath} />
          </div>
        </div>
      )}

      {/* No-math: show full question text big */}
      {!displayMath && (
        <div className="px-4 pb-4 text-center">
          <p className="font-display text-xl font-bold text-gray-900">
            {renderMathText(questionText)}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Bottom bar ──────────────────────────────────────────────── */

function BottomBar({
  pendingAnswer,
  hintCount,
  onSubmit,
  onHint,
}: {
  pendingAnswer: string | null;
  hintCount: number;
  onSubmit: () => void;
  onHint: () => void;
}) {
  const canSubmit = pendingAnswer !== null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-white flex items-center gap-3 px-4 py-3"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      {/* Encouraging Foxy (small) */}
      <div className="flex-shrink-0">
        <FoxyImage expression="happy" size={56} />
      </div>

      {/* Encouragement text */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-bold text-gray-900 leading-tight">Great thinking!</p>
        <p className="font-ui text-xs text-gray-500 mt-0.5">You&apos;re doing awesome!</p>
      </div>

      {/* Hint button */}
      <div className="relative flex-shrink-0">
        <button
          onClick={onHint}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 font-display font-bold text-sm"
          style={{ background: '#FEF3C7', color: '#92400E' }}
        >
          <span>💡</span>
          <span>Hint</span>
        </button>
        {hintCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs text-white"
            style={{ background: '#8A2BE2' }}
          >
            {hintCount}
          </span>
        )}
      </div>

      {/* Submit Answer button */}
      <motion.button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="flex-shrink-0 flex items-center gap-2 rounded-xl px-5 py-2.5 font-display font-bold text-sm text-white transition-opacity"
        style={{
          background: canSubmit ? 'linear-gradient(135deg, #8A2BE2, #5B1483)' : '#D1D5DB',
          boxShadow: canSubmit ? '0 4px 0 0 #3B0764' : 'none',
          opacity: canSubmit ? 1 : 0.7,
        }}
        whileTap={canSubmit ? { y: 4, boxShadow: 'none' } : undefined}
      >
        <span>Submit Answer</span>
        <span className="text-base">›</span>
      </motion.button>
    </div>
  );
}

/* ── Loading ─────────────────────────────────────────────────── */

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      <p className="font-ui text-gray-500 text-sm">Loading your lesson…</p>
    </div>
  );
}

/* ── Hearts empty ────────────────────────────────────────────── */

function HeartsEmptyScreen({ onQuit }: { onQuit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center px-4">
      <FoxyImage expression="sad" size={110} />
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Out of hearts!</h2>
        <p className="font-ui text-gray-500 text-sm">Hearts refill every 30 minutes.<br />Come back soon!</p>
      </div>
      <button
        onClick={onQuit}
        className="w-full max-w-xs rounded-2xl py-4 font-display font-bold text-white text-lg"
        style={{ background: 'linear-gradient(135deg, #8A2BE2, #5B1483)', boxShadow: '0 4px 0 0 #3B0764' }}
      >
        Go Home
      </button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

export default function LessonPage() {
  const params = useParams<{ sectionId: string; level: string }>();
  const router = useRouter();

  const sectionId = params.sectionId;
  const level = parseInt(params.level, 10);

  const { isLoading: lessonLoading } = useLesson(sectionId, level);

  const phase          = useLessonStore((s) => s.phase);
  const sectionTitle   = useLessonStore((s) => s.sectionTitle);
  const xpEarned       = useLessonStore((s) => s.xpEarned);
  const answers        = useLessonStore((s) => s.answers);
  const questionQueue  = useLessonStore((s) => s.questionQueue);
  const setPhase       = useLessonStore((s) => s.setPhase);
  const submitAnswer   = useLessonStore((s) => s.submitAnswer);
  const advanceQuestion = useLessonStore((s) => s.advanceQuestion);
  const loseHeart      = useLessonStore((s) => s.loseHeart);
  const addXp          = useLessonStore((s) => s.addXp);
  const resetLesson    = useLessonStore((s) => s.resetLesson);

  const currentQuestion = useLessonStore(selectCurrentQuestion);
  const currentIndex   = useLessonStore((s) => s.currentIndex);
  const queueLength    = useLessonStore((s) => s.questionQueue.length);

  const userStats        = useUserStore((s) => s.stats);
  const loseHeartUser    = useUserStore((s) => s.loseHeart);
  const addXpUser        = useUserStore((s) => s.addXp);
  const updateStats      = useUserStore((s) => s.updateStats);
  const completeSection  = useUserStore((s) => s.completeSection);

  // Pending (selected but not yet submitted) answer
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  // The answer that was last submitted (for correct/wrong visual after submit)
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  // Clear pending/submitted answers whenever the question changes
  useEffect(() => {
    setPendingAnswer(null);
    setSubmittedAnswer(null);
    setShowHint(false);
    setHintIndex(0);
  }, [currentIndex]);

  /* ── Lesson complete → reward ───────────────────────────── */
  useEffect(() => {
    if (phase !== 'lesson_complete') return;

    const correct = answers.filter((a) => a.isCorrect).length;
    const total   = questionQueue.length;
    const xpToAward = xpEarned > 0 ? xpEarned : correct * 10;
    const passed = total > 0 && correct / total >= 0.6;

    addXpUser(xpToAward);
    updateStats({
      lessonsCompleted:  (userStats?.lessonsCompleted  ?? 0) + 1,
      questionsAnswered: (userStats?.questionsAnswered ?? 0) + total,
      questionsCorrect:  (userStats?.questionsCorrect  ?? 0) + correct,
    });
    if (passed) completeSection(sectionId, level);

    useStreakStore.getState().recordActivity(new Date().toISOString());

    const startedAt = useLessonStore.getState().startedAt;
    const syncToDb = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const cs = useUserStore.getState().stats;
        const newXp    = cs?.totalXp ?? xpToAward;
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        const ss = useStreakStore.getState();
        const today = new Date().toISOString().split('T')[0];
        await Promise.allSettled([
          supabase.from('user_stats').upsert({ user_id: user.id, total_xp: newXp, level: newLevel,
            lessons_completed: cs?.lessonsCompleted ?? 1, questions_answered: cs?.questionsAnswered ?? total,
            questions_correct: cs?.questionsCorrect ?? correct }),
          supabase.from('streaks').upsert({ user_id: user.id, current_streak: ss.currentStreak,
            longest_streak: ss.longestStreak, last_activity_date: today }),
        ]);
        try {
          const timeTaken = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
          await supabase.from('lesson_sessions').insert({ user_id: user.id, section_id: sectionId, level,
            status: passed ? 'completed' : 'abandoned', xp_earned: xpToAward,
            questions_total: total, questions_correct: correct, time_taken_seconds: timeTaken });
        } catch { /* table may not exist */ }
      } catch { /* non-critical */ }
    };
    void syncToDb();

    const sp = new URLSearchParams({ xp: String(xpToAward), correct: String(correct),
      total: String(total), level: String(level), sectionId, sectionTitle, passed: String(passed) });
    router.push(`/reward?${sp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Submit the pending answer ──────────────────────────── */
  const handleSubmit = useCallback(() => {
    if (!pendingAnswer || !currentQuestion) return;

    const isCorrect =
      pendingAnswer.trim().toLowerCase() ===
      (currentQuestion.correctAnswer ?? '').trim().toLowerCase();

    setSubmittedAnswer(pendingAnswer);
    submitAnswer(pendingAnswer);

    const audio = useAudioStore.getState();
    audio.playSound(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
      loseHeart();
      loseHeartUser();
      if ((userStats?.hearts ?? 5) - 1 <= 0) setPhase('hearts_empty');
    } else {
      addXp(10);
    }
  }, [pendingAnswer, currentQuestion, submitAnswer, loseHeart, loseHeartUser, addXp, setPhase, userStats?.hearts]);

  /* ── Continue (Next →) ──────────────────────────────────── */
  const handleContinue = useCallback(() => {
    setPendingAnswer(null);
    setSubmittedAnswer(null);
    advanceQuestion();
  }, [advanceQuestion]);

  const handleQuit = useCallback(() => {
    resetLesson();
    router.push('/home');
  }, [resetLesson, router]);

  const handleHint = useCallback(() => {
    if (!currentQuestion) return;
    const hints = currentQuestion.hints ?? [];
    if (hints.length === 0) return;
    setHintIndex((prev) => Math.min(prev + 1, hints.length));
    setShowHint(true);
  }, [currentQuestion]);

  /* ── Render ─────────────────────────────────────────────── */
  const isInFeedback = phase === 'feedback_correct' || phase === 'feedback_incorrect';
  const showQuestion = phase === 'question' && !!currentQuestion;
  const hintCount    = (currentQuestion?.hints?.length ?? 0) - hintIndex;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f4f1fb' }}>
      <LessonHeader
        current={currentIndex + 1}
        total={queueLength}
        hearts={userStats?.hearts ?? 5}
        maxHearts={userStats?.maxHearts ?? 5}
        sectionTitle={sectionTitle}
        onClose={() => setShowQuitModal(true)}
      />

      {/* Main scrollable area — pt-16 for the single-row fixed header */}
      <main
        className="flex-1 pt-16 overflow-y-auto"
        style={{ paddingBottom: isInFeedback ? '12px' : '120px' }}
      >
        {(phase === 'loading' || lessonLoading) && <LoadingSpinner />}

        {showQuestion && (
          <div className="flex flex-col gap-4 py-4">
            {/* Mascot + question bubble + XP badge */}
            <QuestionCard
              questionText={currentQuestion.questionText}
              xpGain={10}
            />

            {/* "Select the correct answer" label */}
            <p className="font-display text-sm font-bold text-gray-500 uppercase tracking-widest px-5">
              Select the correct answer
            </p>

            {/* Answer options */}
            <div className="px-4">
              <QuestionRenderer
                question={currentQuestion}
                onAnswer={setPendingAnswer}
                disabled={isInFeedback}
                selectedAnswer={pendingAnswer}
                submittedAnswer={submittedAnswer}
                isCorrect={null}
              />
            </div>

            {/* Hint display */}
            {showHint && currentQuestion.hints?.[hintIndex - 1] && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 rounded-2xl px-4 py-3 flex items-start gap-2"
                style={{ background: '#FEF3C7', border: '1.5px solid #FDE047' }}
              >
                <span className="text-lg">💡</span>
                <p className="font-ui text-sm text-amber-800">
                  {currentQuestion.hints[hintIndex - 1]}
                </p>
              </motion.div>
            )}
          </div>
        )}

        {phase === 'hearts_empty' && (
          <div className="flex items-center justify-center px-4 pt-8">
            <HeartsEmptyScreen onQuit={handleQuit} />
          </div>
        )}
      </main>

      {/* Bottom bar — shown during question phase */}
      {showQuestion && !isInFeedback && (
        <BottomBar
          pendingAnswer={pendingAnswer}
          hintCount={hintCount}
          onSubmit={handleSubmit}
          onHint={handleHint}
        />
      )}

      {/* Feedback overlay */}
      <FeedbackOverlay
        isVisible={isInFeedback}
        isCorrect={phase === 'feedback_correct'}
        explanation={currentQuestion?.explanation ?? ''}
        correctAnswer={currentQuestion?.correctAnswer}
        onContinue={handleContinue}
      />

      <QuitConfirmModal
        isOpen={showQuitModal}
        onConfirm={handleQuit}
        onCancel={() => setShowQuitModal(false)}
      />
    </div>
  );
}
