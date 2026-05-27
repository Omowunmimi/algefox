'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineMath, BlockMath } from 'react-katex';
import Image from 'next/image';
import { X, Heart, CheckCircle, Zap, BookOpen, Star, Lightbulb } from 'lucide-react';
import {
  useLessonStore,
  selectCurrentQuestion,
} from '@/stores/useLessonStore';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useLesson } from '@/hooks/useLesson';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
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

function extractDisplayMath(text: string): string | null {
  const matches = [...text.matchAll(/\$([^$]+)\$/g)];
  if (matches.length === 0) return null;
  return matches.map((m) => m[1]).join(' = ');
}

/* ── Lesson Header ───────────────────────────────────────────── */

function LessonTopBar({
  current,
  total,
  hearts,
  maxHearts,
  onClose,
}: {
  current: number;
  total: number;
  hearts: number;
  maxHearts: number;
  onClose: () => void;
}) {
  const progress = total > 0 ? Math.min((current - 1) / total, 1) : 0;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 bg-white flex items-center gap-3 px-4"
      style={{ height: 56, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200"
        aria-label="Quit lesson"
      >
        <X size={18} strokeWidth={2} className="text-gray-500" />
      </button>

      {/* Progress bar — striped texture */}
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `repeating-linear-gradient(
              90deg,
              #8A2BE2 0px,
              #8A2BE2 18px,
              #7B27CC 18px,
              #7B27CC 24px
            )`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Hearts */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {Array.from({ length: maxHearts }).map((_, i) => (
          <Heart
            key={i}
            size={16}
            strokeWidth={1.5}
            fill={i < hearts ? '#FB7185' : 'none'}
            stroke={i < hearts ? '#E11D48' : '#D1D5DB'}
          />
        ))}
        <span className="font-display text-sm font-bold text-gray-700 ml-1">{hearts}</span>
      </div>
    </header>
  );
}

/* ── Mascot + question bubble ────────────────────────────────── */

function QuestionBubble({ questionText, xpGain }: { questionText: string; xpGain: number }) {
  const displayMath = extractDisplayMath(questionText);
  const instrText = questionText.includes('$')
    ? questionText.split('$')[0].trim().replace(/\?$/, '').trim()
    : questionText;

  return (
    <div className="mx-4">
      <div className="flex items-start gap-3">
        {/* Foxy head */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-white"
          style={{ boxShadow: '0 2px 8px rgba(138,43,226,0.2)' }}
        >
          <Image
            src="/mascot/foxy-excited.png"
            alt="Foxy"
            width={56}
            height={56}
            className="object-contain w-full h-full"
            priority
          />
        </div>

        {/* Speech bubble */}
        <div className="flex-1 relative">
          {/* Tail */}
          <span
            aria-hidden="true"
            className="absolute -left-2.5 top-4"
            style={{
              width: 0,
              height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderRight: '10px solid white',
              filter: 'drop-shadow(-2px 0px 1px rgba(0,0,0,0.04))',
            }}
          />
          <div
            className="bg-white rounded-2xl px-4 py-3"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
          >
            <p className="font-display text-base font-bold text-gray-900 leading-snug">
              {instrText || "Let's solve this together!"}
            </p>
          </div>
        </div>

        {/* XP badge */}
        <motion.div
          className="flex-shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1.5"
          style={{ background: '#FEF9C3', border: '1.5px solid #FDE047' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap size={12} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
          <span className="font-display text-xs font-bold text-yellow-700">+{xpGain}</span>
        </motion.div>
      </div>

      {/* Large math display */}
      {displayMath && (
        <div className="mt-4 text-center">
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-3xl font-bold"
            style={{ background: '#F5F0FF' }}
          >
            <BlockMath math={displayMath} />
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Bottom bar (no answer / answer selected) ─────────────────── */

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
      style={{
        boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {canSubmit ? (
        <>
          <div className="flex-shrink-0 w-8 h-8">
            <FoxyImage expression="encouraging" size={32} />
          </div>
          <p className="flex-1 font-display text-sm font-bold text-gray-700">Good thinking!</p>
        </>
      ) : (
        <div className="flex-1" />
      )}

      {/* Hint */}
      <div className="relative flex-shrink-0">
        <button
          onClick={onHint}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 font-display font-bold text-sm"
          style={{ background: '#FEF3C7', color: '#92400E' }}
        >
          <Lightbulb size={15} strokeWidth={2} />
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

      {/* Submit */}
      <motion.button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="flex-shrink-0 rounded-2xl px-6 py-2.5 font-display font-bold text-sm text-white"
        style={{
          background: canSubmit ? '#8A2BE2' : '#D1D5DB',
          boxShadow: canSubmit ? '0 4px 0 0 #5B1483' : 'none',
        }}
        whileTap={canSubmit ? { y: 4, boxShadow: 'none' } : undefined}
      >
        Check
      </motion.button>
    </div>
  );
}

/* ── Correct bottom bar ──────────────────────────────────────── */
function CorrectBar({ explanation, onContinue }: { explanation?: string; onContinue: () => void }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl px-5 py-4"
      style={{
        background: '#F0FDF4',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        borderTop: '2px solid #BBF7D0',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">
          <FoxyImage expression="celebrating" size={44} />
        </div>
        <div className="flex-1">
          <p className="font-display text-lg font-bold" style={{ color: '#15803D' }}>That&apos;s correct!</p>
          {explanation ? (
            <p className="font-ui text-sm mt-0.5 leading-snug" style={{ color: '#16A34A' }}>{explanation}</p>
          ) : (
            <p className="font-ui text-sm mt-0.5" style={{ color: '#16A34A' }}>Well done, keep going!</p>
          )}
        </div>
      </div>
      <motion.button
        onClick={onContinue}
        className="w-full rounded-2xl py-3 font-display font-bold text-white text-sm"
        style={{ background: '#16A34A', boxShadow: '0 4px 0 0 #166534' }}
        whileTap={{ y: 4, boxShadow: 'none' }}
      >
        Next
      </motion.button>
    </motion.div>
  );
}

/* ── Wrong bottom sheet ──────────────────────────────────────── */
function WrongSheet({
  correctAnswer,
  explanation,
  onContinue,
}: {
  correctAnswer?: string;
  explanation?: string;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl px-5 py-4"
      style={{
        background: 'white',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        borderTop: '2px solid #FDE68A',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">
          <FoxyImage expression="sad" size={44} />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-gray-900">Almost there!</p>
          <p className="font-ui text-sm text-gray-500 mt-0.5">Here&apos;s the trick:</p>
        </div>
      </div>

      {correctAnswer && (
        <div
          className="rounded-2xl px-4 py-3 mb-3"
          style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
        >
          <p className="font-ui text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>
            Correct Answer
          </p>
          <p className="font-display text-base font-bold text-gray-900">{correctAnswer}</p>
        </div>
      )}

      {explanation && (
        <p className="font-ui text-sm text-gray-600 mb-3 leading-relaxed">{explanation}</p>
      )}

      <motion.button
        onClick={onContinue}
        className="w-full rounded-2xl py-3 font-display font-bold text-white text-sm"
        style={{ background: '#D97706', boxShadow: '0 4px 0 0 #92400E' }}
        whileTap={{ y: 4, boxShadow: 'none' }}
      >
        Got it, continue
      </motion.button>
    </motion.div>
  );
}

/* ── Lesson complete overlay ─────────────────────────────────── */
function LessonCompleteOverlay({
  correct,
  total,
  xpEarned,
  onClaim,
}: {
  correct: number;
  total: number;
  xpEarned: number;
  onClaim: () => void;
}) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(160deg, #3B0764 0%, #1E0047 100%)' }}
    >
      {/* Stars */}
      <div className="flex gap-3 mb-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 400, damping: 18 }}
          >
            <Star
              size={44}
              fill="#FCD34D"
              stroke="#D97706"
              strokeWidth={0.5}
            />
          </motion.div>
        ))}
      </div>

      {/* Foxy celebrating */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
        className="mb-4"
      >
        <Image src="/mascot/foxy-celebrating.png" alt="Foxy celebrating" width={120} height={120} className="object-contain" />
      </motion.div>

      <motion.h1
        className="font-display text-3xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Lesson Complete!
      </motion.h1>

      <motion.div
        className="flex flex-col gap-2 mt-4 w-full max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
      >
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} color="white" strokeWidth={2} />
            <span className="font-ui text-sm text-white/80">Score</span>
          </div>
          <span className="font-display text-base font-bold text-white">{correct} / {total} correct</span>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-2">
            <Zap size={18} fill="#FCD34D" stroke="#D97706" strokeWidth={0.5} />
            <span className="font-ui text-sm text-white/80">XP Earned</span>
          </div>
          <span className="font-display text-base font-bold text-white">+{xpEarned} XP</span>
        </div>
      </motion.div>

      <motion.button
        onClick={onClaim}
        className="mt-8 w-full max-w-xs rounded-3xl py-4 font-display font-bold text-white text-lg"
        style={{ background: '#8A2BE2', boxShadow: '0 6px 0 0 #5B1483' }}
        whileTap={{ y: 6, boxShadow: 'none' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        Claim Rewards
      </motion.button>
    </motion.div>
  );
}

/* ── Loading ─────────────────────────────────────────────────── */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      <p className="font-ui text-gray-500 text-sm">Loading your lesson...</p>
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
        <p className="font-ui text-gray-500 text-sm">Hearts refill every 30 minutes. Come back soon!</p>
      </div>
      <motion.button
        onClick={onQuit}
        className="w-full max-w-xs rounded-2xl py-4 font-display font-bold text-white text-lg"
        style={{ background: '#8A2BE2', boxShadow: '0 4px 0 0 #5B1483' }}
        whileTap={{ y: 4, boxShadow: 'none' }}
      >
        Go Home
      </motion.button>
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

  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false);

  useEffect(() => {
    setPendingAnswer(null);
    setSubmittedAnswer(null);
    setShowHint(false);
    setHintIndex(0);
  }, [currentIndex]);

  /* ── Lesson complete ─────────────────────────────────────── */
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

    setShowCompleteOverlay(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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

  const handleClaimRewards = useCallback(() => {
    const correct = answers.filter((a) => a.isCorrect).length;
    const total   = questionQueue.length;
    const xpToAward = xpEarned > 0 ? xpEarned : correct * 10;
    const passed = total > 0 && correct / total >= 0.6;
    const sp = new URLSearchParams({
      xp: String(xpToAward), correct: String(correct),
      total: String(total), level: String(level), sectionId, sectionTitle, passed: String(passed),
    });
    resetLesson();
    router.push(`/reward?${sp.toString()}`);
  }, [answers, questionQueue, xpEarned, level, sectionId, sectionTitle, resetLesson, router]);

  const isInFeedback = phase === 'feedback_correct' || phase === 'feedback_incorrect';
  const showQuestion = phase === 'question' && !!currentQuestion;
  const hintCount    = (currentQuestion?.hints?.length ?? 0) - hintIndex;
  const maxHearts    = userStats?.maxHearts ?? 5;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F7FF' }}>
      <LessonTopBar
        current={currentIndex + 1}
        total={queueLength}
        hearts={userStats?.hearts ?? 5}
        maxHearts={maxHearts}
        onClose={() => setShowQuitModal(true)}
      />

      {/* Main scrollable area */}
      <main
        className="flex-1 pt-14 overflow-y-auto"
        style={{ paddingBottom: isInFeedback ? '12px' : '120px' }}
      >
        {(phase === 'loading' || lessonLoading) && <LoadingSpinner />}

        {showQuestion && (
          <div className="flex flex-col gap-4 py-5">
            {/* Foxy + question bubble */}
            <QuestionBubble questionText={currentQuestion.questionText} xpGain={10} />

            {/* Instruction label */}
            <p className="font-display text-xs font-bold text-gray-400 uppercase tracking-widest px-5">
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
                <Lightbulb size={16} style={{ color: '#D97706' }} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
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

      {/* Bottom bar */}
      {showQuestion && !isInFeedback && (
        <BottomBar
          pendingAnswer={pendingAnswer}
          hintCount={hintCount}
          onSubmit={handleSubmit}
          onHint={handleHint}
        />
      )}

      {/* Feedback bars */}
      <AnimatePresence>
        {phase === 'feedback_correct' && (
          <CorrectBar
            key="correct"
            explanation={currentQuestion?.explanation}
            onContinue={handleContinue}
          />
        )}
        {phase === 'feedback_incorrect' && (
          <WrongSheet
            key="wrong"
            correctAnswer={currentQuestion?.correctAnswer}
            explanation={currentQuestion?.explanation}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>

      {/* Lesson complete overlay */}
      <AnimatePresence>
        {showCompleteOverlay && (
          <LessonCompleteOverlay
            correct={answers.filter((a) => a.isCorrect).length}
            total={questionQueue.length}
            xpEarned={xpEarned > 0 ? xpEarned : answers.filter((a) => a.isCorrect).length * 10}
            onClaim={handleClaimRewards}
          />
        )}
      </AnimatePresence>

      <QuitConfirmModal
        isOpen={showQuitModal}
        onConfirm={handleQuit}
        onCancel={() => setShowQuitModal(false)}
      />
    </div>
  );
}
