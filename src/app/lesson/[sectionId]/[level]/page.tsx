'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath } from 'react-katex';
import Image from 'next/image';
import { X, Heart, Zap, BookOpen, Star, Lightbulb } from 'lucide-react';
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
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

// ─── Math text helper ─────────────────────────────────────────────────────────

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
      className="fixed top-0 inset-x-0 z-30 bg-surface"
      style={{ height: 56, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
    >
      <div className="max-w-lg mx-auto h-full flex items-center gap-3 px-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200"
        aria-label="Quit lesson"
      >
        <X size={18} strokeWidth={2} className="text-gray-500" />
      </button>

      {/* Progress bar */}
      <div className="flex-1 h-3 rounded-full overflow-hidden bg-gray-200">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: '#F99526',
            boxShadow: 'inset 0 0 0 1px #D87E1C, inset 0 -2px 0 #CD7310',
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
            fill={i < hearts ? '#F43F5E' : 'none'}
            stroke={i < hearts ? '#E11D48' : '#D1D5DB'}
          />
        ))}
        <span className="font-display text-sm font-bold text-gray-700 ml-1">{hearts}</span>
      </div>
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
          <div className="bg-surface rounded-2xl px-4 py-3 border-2 border-gray-100">
            <p className="font-display text-base font-bold text-gray-900 leading-snug">
              {instrText || "Let's solve this together"}
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
  // Empty string from FillBlank typing counts as "no answer yet"
  const canSubmit = pendingAnswer !== null && pendingAnswer.trim() !== '';

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-30 bg-surface"
      style={{
        boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
        {/* Foxy nudge when answer selected */}
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
            className="flex items-center gap-1.5 rounded-full px-4 py-2.5 font-ui font-bold text-sm"
            style={{
              background: 'white',
              color: '#374151',
              border: '1px solid #E9EAEB',
              boxShadow: 'inset 0px -4px 0px #EAEBED',
            }}
            aria-label="Show hint"
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

        {/* Submit — wider button */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          size="md"
          className="flex-shrink-0 min-w-[110px] text-sm"
          style={!canSubmit ? { background: '#D1D5DB', boxShadow: 'none' } : undefined}
        >
          Check
        </Button>
      </div>
    </div>
  );
}

/* ── Correct bottom sheet ────────────────────────────────────── */
function CorrectBar({ explanation, onContinue }: { explanation?: string; onContinue: () => void }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="fixed bottom-0 inset-x-0 z-30"
      style={{
        background: 'white',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.14)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        borderRadius: '24px 24px 0 0',
      }}
    >
      <div className="max-w-lg mx-auto px-5 pt-5 pb-1">
        {/* Foxy centered */}
        <div className="flex justify-center mb-3">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: '#F0FDF4', border: '2px solid #BBF7D0' }}
          >
            <FoxyImage expression="celebrating" size={76} />
          </div>
        </div>

        <p className="font-display text-2xl font-bold text-center" style={{ color: '#0A0D12' }}>
          That&apos;s correct!
        </p>
        <p className="font-ui text-base text-center mt-1 mb-4" style={{ color: '#717680' }}>
          {explanation ?? 'Well done, keep going!'}
        </p>

        <Button
          onClick={onContinue}
          variant="primary"
          size="lg"
          fullWidth
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

/* ── Wrong bottom sheet ─────────────── matches image exactly ── */
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
      className="fixed bottom-0 inset-x-0 z-30"
      style={{
        background: 'white',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.14)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        borderRadius: '24px 24px 0 0',
      }}
    >
      <div className="max-w-lg mx-auto px-5 pt-5 pb-1">
        {/* Foxy centered */}
        <div className="flex justify-center mb-3">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{ background: '#FCF7EF' }}
          >
            <FoxyImage expression="sad" size={88} />
          </div>
        </div>

        <p className="font-display text-2xl font-bold text-center" style={{ color: '#0A0D12' }}>Almost there</p>
        <p className="font-ui text-base text-center mt-1 mb-4" style={{ color: '#717680' }}>
          No wahala, here&apos;s the correct answer
        </p>

        {correctAnswer && (
          <div
            className="rounded-xl px-4 py-3 mb-3"
            style={{ background: '#FDFDFD', border: '1px solid #E9EAEB' }}
          >
            <p
              className="font-ui text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: '#9CA3AF' }}
            >
              Correct answer
            </p>
            <p className="font-display text-xl font-bold text-gray-900">{correctAnswer}</p>
          </div>
        )}

        {explanation && (
          <p className="font-ui text-base text-center mb-4 leading-relaxed px-2" style={{ color: '#717680' }}>
            {explanation}
          </p>
        )}

        <Button
          onClick={onContinue}
          variant="danger"
          size="lg"
          fullWidth
        >
          Got it
        </Button>
      </div>
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
        Lesson complete
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
            <span className="font-ui text-sm text-white/80">XP earned</span>
          </div>
          <span className="font-display text-base font-bold text-white">+{xpEarned} XP</span>
        </div>
      </motion.div>

      <motion.div
        className="mt-8 w-full max-w-xs"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button onClick={onClaim} size="lg" fullWidth>
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ── Loading ─────────────────────────────────────────────────── */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      <p className="font-ui text-gray-500 text-sm">Loading your lesson</p>
    </div>
  );
}

/* ── Hearts empty ────────────────────────────────────────────── */
function HeartsEmptyScreen({ onQuit }: { onQuit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center px-4">
      <FoxyImage expression="sad" size={110} />
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Out of hearts</h2>
        <p className="font-ui text-gray-500 text-sm">Hearts refill every 30 minutes. Come back soon</p>
      </div>
      <Button
        onClick={onQuit}
        size="lg"
        className="w-full max-w-xs"
      >
        Go home
      </Button>
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

  const phase    = useLessonStore((s) => s.phase);
  const setPhase = useLessonStore((s) => s.setPhase);
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
  // Snapshot taken at the moment the lesson_complete phase fires — avoids stale closure zeros
  const [completionStats, setCompletionStats] = useState({ correct: 0, total: 0, xp: 0 });

  useEffect(() => {
    setPendingAnswer(null);
    setSubmittedAnswer(null);
    setShowHint(false);
    setHintIndex(0);
  }, [currentIndex]);

  /* ── Lesson complete ─────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'lesson_complete') return;

    // Use getState() to read fresh values — avoids stale React closure
    const fresh = useLessonStore.getState();
    const correct = fresh.answers.filter((a) => a.isCorrect).length;
    const total   = fresh.questionQueue.length;
    const xpToAward = fresh.xpEarned > 0 ? fresh.xpEarned : correct * 10;
    const passed = total > 0 && correct / total >= 0.6;

    // Snapshot into local state so LessonCompleteOverlay always shows accurate numbers
    setCompletionStats({ correct, total, xp: xpToAward });

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
    resetLesson();
    router.push('/home');
  }, [resetLesson, router]);

  const isInFeedback = phase === 'feedback_correct' || phase === 'feedback_incorrect';
  const showQuestion = phase === 'question' && !!currentQuestion;
  const hintCount    = (currentQuestion?.hints?.length ?? 0) - hintIndex;
  const maxHearts    = userStats?.maxHearts ?? 5;

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <LessonTopBar
        current={currentIndex + 1}
        total={queueLength}
        hearts={userStats?.hearts ?? 5}
        maxHearts={maxHearts}
        onClose={() => setShowQuitModal(true)}
      />

      {/* Main scrollable area — constrained to max-w-lg */}
      <main
        className="flex-1 pt-14 overflow-y-auto"
        style={{ paddingBottom: isInFeedback ? '12px' : '120px' }}
      >
        <div className="max-w-lg mx-auto">
        {(phase === 'loading' || lessonLoading) && <LoadingSpinner />}

        {showQuestion && (
          <div className="flex flex-col gap-4 py-5">
            {/* Foxy + question bubble */}
            <QuestionBubble questionText={currentQuestion.questionText} xpGain={10} />

            {/* Instruction label */}
            <p className="font-display text-xs font-bold text-gray-400 px-5">
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
                className="mx-4 rounded-xl px-4 py-3 flex items-start gap-2"
                style={{ background: '#FFFCF0', border: '1px solid #FFAC21' }}
              >
                <Lightbulb size={16} style={{ color: '#FFAC21' }} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
                <p className="font-ui text-sm" style={{ color: '#92400E' }}>
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
        </div>
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
            correct={completionStats.correct}
            total={completionStats.total}
            xpEarned={completionStats.xp}
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
