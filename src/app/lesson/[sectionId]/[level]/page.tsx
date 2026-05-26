'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
import Image from 'next/image';
import {
  useLessonStore,
  selectCurrentQuestion,
} from '@/stores/useLessonStore';
import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useLesson } from '@/hooks/useLesson';
import { Button } from '@/components/ui';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { FeedbackOverlay } from '@/components/lesson/FeedbackOverlay';
import { QuitConfirmModal } from '@/components/lesson/QuitConfirmModal';
import { FoxyImage } from '@/components/mascot/FoxyImage'; // used in HeartsEmptyScreen
import { createClient } from '@/lib/supabase/client';

// ─── Math text helper ─────────────────────────────────────────────────────────

function renderMathText(text: string): ReactNode {
  if (!text.includes('$')) return text;
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.slice(1, -1);
          return <InlineMath key={i} math={latex} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ── Mascot question bubble ──────────────────────────────────── */

function MascotQuestionBubble({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-4">
      {/* Foxy mascot — matches reference size */}
      <div className="flex-shrink-0">
        <Image
          src="/mascot/foxy-excited.png"
          alt="Foxy the fox"
          width={110}
          height={110}
          className="object-contain"
          priority
        />
      </div>

      {/* Speech bubble — reference uses gray-100 rounded-3xl */}
      <div className="relative flex-1 rounded-3xl px-4 py-4" style={{ background: '#EDE9FE' }}>
        {/* Left tail */}
        <span
          aria-hidden="true"
          className="absolute -left-2 top-1/2 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '10px solid #EDE9FE',
          }}
        />
        <p className="font-display text-lg font-bold text-gray-900 leading-snug">
          {renderMathText(text)}
        </p>
      </div>
    </div>
  );
}

/* ── Loading spinner ─────────────────────────────────────────── */

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div
        className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"
        role="status"
        aria-label="Loading"
      />
      <p className="font-ui text-gray-500 text-sm">Loading your lesson…</p>
    </div>
  );
}

/* ── Hearts empty screen ─────────────────────────────────────── */

function HeartsEmptyScreen({ onQuit }: { onQuit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center px-4">
      <FoxyImage expression="sad" size={100} />
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
          Oh no! You&apos;re out of hearts
        </h2>
        <p className="font-ui text-gray-500 text-sm">
          Hearts refill every 30 minutes.
          <br />
          Come back soon!
        </p>
      </div>
      <Button variant="primary" size="lg" onClick={onQuit} fullWidth>
        Go Home
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

  // Store slices
  const phase = useLessonStore((s) => s.phase);
  const sectionTitle = useLessonStore((s) => s.sectionTitle);
  const xpEarned = useLessonStore((s) => s.xpEarned);
  const answers = useLessonStore((s) => s.answers);
  const questionQueue = useLessonStore((s) => s.questionQueue);
  const setPhase = useLessonStore((s) => s.setPhase);
  const submitAnswer = useLessonStore((s) => s.submitAnswer);
  const advanceQuestion = useLessonStore((s) => s.advanceQuestion);
  const loseHeart = useLessonStore((s) => s.loseHeart);
  const addXp = useLessonStore((s) => s.addXp);
  const resetLesson = useLessonStore((s) => s.resetLesson);

  const currentQuestion = useLessonStore(selectCurrentQuestion);
  const currentIndex = useLessonStore((s) => s.currentIndex);
  const queueLength = useLessonStore((s) => s.questionQueue.length);

  const userStats = useUserStore((s) => s.stats);
  const loseHeartUser = useUserStore((s) => s.loseHeart);
  const addXpUser = useUserStore((s) => s.addXp);
  const updateStats = useUserStore((s) => s.updateStats);
  const completeSection = useUserStore((s) => s.completeSection);

  const [showQuitModal, setShowQuitModal] = useState(false);

  /* ── Phase: lesson complete → navigate to reward ─────────── */
  useEffect(() => {
    if (phase !== 'lesson_complete') return;

    const correct = answers.filter((a) => a.isCorrect).length;
    const total = questionQueue.length;
    const xpToAward = xpEarned > 0 ? xpEarned : correct * 10;
    const passed = total > 0 && correct / total >= 0.6;

    addXpUser(xpToAward);
    updateStats({
      lessonsCompleted: (userStats?.lessonsCompleted ?? 0) + 1,
      questionsAnswered: (userStats?.questionsAnswered ?? 0) + total,
      questionsCorrect: (userStats?.questionsCorrect ?? 0) + correct,
    });
    if (passed) {
      completeSection(sectionId, level);
    }

    useStreakStore.getState().recordActivity(new Date().toISOString());

    const startedAt = useLessonStore.getState().startedAt;

    const syncToDb = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentStats = useUserStore.getState().stats;
        const newTotalXp = currentStats?.totalXp ?? xpToAward;
        const newLevel = Math.floor(Math.sqrt(newTotalXp / 100)) + 1;
        const newLessonsCompleted = currentStats?.lessonsCompleted ?? 1;
        const newQuestionsAnswered = currentStats?.questionsAnswered ?? total;
        const newQuestionsCorrect = currentStats?.questionsCorrect ?? correct;

        const streakState = useStreakStore.getState();
        const today = new Date().toISOString().split('T')[0];

        await Promise.allSettled([
          supabase.from('user_stats').upsert({
            user_id: user.id,
            total_xp: newTotalXp,
            level: newLevel,
            lessons_completed: newLessonsCompleted,
            questions_answered: newQuestionsAnswered,
            questions_correct: newQuestionsCorrect,
          }),
          supabase.from('streaks').upsert({
            user_id: user.id,
            current_streak: streakState.currentStreak,
            longest_streak: streakState.longestStreak,
            last_activity_date: today,
          }),
        ]);

        try {
          const timeTaken = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
          await supabase.from('lesson_sessions').insert({
            user_id: user.id,
            section_id: sectionId,
            level,
            status: passed ? 'completed' : 'abandoned',
            xp_earned: xpToAward,
            questions_total: total,
            questions_correct: correct,
            time_taken_seconds: timeTaken,
          });
        } catch { /* table not yet created */ }

      } catch {
        // Non-critical — local store already has correct values
      }
    };

    void syncToDb();

    const searchParams = new URLSearchParams({
      xp: String(xpToAward),
      correct: String(correct),
      total: String(total),
      level: String(level),
      sectionId,
      sectionTitle,
      passed: String(passed),
    });

    router.push(`/reward?${searchParams.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Answer handler ──────────────────────────────────────── */
  const handleAnswer = useCallback(
    (answer: string) => {
      const isCorrect =
        answer.trim().toLowerCase() ===
        (currentQuestion?.correctAnswer ?? '').trim().toLowerCase();

      submitAnswer(answer);

      const audio = useAudioStore.getState();
      audio.playSound(isCorrect ? 'correct' : 'incorrect');

      if (!isCorrect) {
        loseHeart();
        loseHeartUser();

        const remainingHearts = (userStats?.hearts ?? 5) - 1;
        if (remainingHearts <= 0) {
          setPhase('hearts_empty');
        }
      } else {
        const xpGain = 10;
        addXp(xpGain);
      }
    },
    [
      currentQuestion,
      submitAnswer,
      loseHeart,
      loseHeartUser,
      addXp,
      setPhase,
      userStats?.hearts,
    ],
  );

  /* ── Continue handler ────────────────────────────────────── */
  const handleContinue = useCallback(() => {
    advanceQuestion();
  }, [advanceQuestion]);

  /* ── Quit handler ────────────────────────────────────────── */
  const handleQuit = useCallback(() => {
    resetLesson();
    router.push('/home');
  }, [resetLesson, router]);

  /* ── Render ──────────────────────────────────────────────── */
  const isInFeedback =
    phase === 'feedback_correct' || phase === 'feedback_incorrect';

  const showQuestion = phase === 'question' && currentQuestion;

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

      {/* Main question area — pt-20 accounts for the single-row fixed header */}
      <main className="flex-1 pt-20 pb-36 flex flex-col">
        {(phase === 'loading' || lessonLoading) && (
          <LoadingSpinner />
        )}

        {showQuestion && (
          <>
            {/* Mascot asks the question */}
            <MascotQuestionBubble text={currentQuestion.questionText} />

            {/* Answer interaction area */}
            <div className="flex-1 px-4">
              <QuestionRenderer
                question={currentQuestion}
                onAnswer={handleAnswer}
                disabled={false}
                selectedAnswer={null}
                isCorrect={null}
              />
            </div>
          </>
        )}

        {phase === 'hearts_empty' && (
          <div className="flex-1 flex items-center justify-center px-4">
            <HeartsEmptyScreen onQuit={handleQuit} />
          </div>
        )}
      </main>

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
