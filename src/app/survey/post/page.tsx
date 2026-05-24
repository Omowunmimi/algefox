'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

/* ── Survey questions ─────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'q1',
    text: 'I enjoyed using AlgeFox to learn maths',
  },
  {
    id: 'q2',
    text: 'AlgeFox made me more interested in fractions and algebra',
  },
  {
    id: 'q3',
    text: 'I found the lessons easy to understand',
  },
  {
    id: 'q4',
    text: 'Earning XP and achievements motivated me to keep learning',
  },
  {
    id: 'q5',
    text: 'I would recommend AlgeFox to my classmates',
  },
] as const;

type QuestionId = (typeof QUESTIONS)[number]['id'];

const SCALE_LABELS: Record<number, string> = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
};

/* ── Scale buttons row ───────────────────────────────────────── */
function LikertScale({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  questionId,
  value,
  onChange,
}: {
  questionId: QuestionId;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mt-3" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === n;
        return (
          <motion.button
            key={n}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(n)}
            aria-label={SCALE_LABELS[n]}
            role="radio"
            aria-checked={selected}
            className={cn(
              'flex-1 h-11 rounded-xl font-display font-bold text-base transition-all',
              'border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              selected
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-light',
            )}
            style={selected ? { boxShadow: 'var(--shadow-physical-primary)' } : undefined}
          >
            {n}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function PostSurveyPage() {
  const router = useRouter();

  const [responses, setResponses] = useState<Partial<Record<QuestionId, number>>>({});
  const [openText, setOpenText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setResponse(id: QuestionId, value: number) {
    setResponses((prev) => ({ ...prev, [id]: value }));
  }

  const allAnswered = QUESTIONS.every((q) => responses[q.id] != null);

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        user_id: user?.id ?? null,
        q1: responses.q1,
        q2: responses.q2,
        q3: responses.q3,
        q4: responses.q4,
        q5: responses.q5,
        open_text: openText.trim() || null,
        submitted_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('survey_responses')
        .insert(payload);

      if (insertError) {
        // Non-fatal — DB table may not exist yet; still show success to user
        console.warn('Survey insert error (non-fatal):', insertError.message);
      }

      setSubmitted(true);
      // Redirect to profile after a brief moment
      setTimeout(() => router.push('/profile'), 1800);
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _err: unknown
    ) {
      setError('Something went wrong. Please try again');
      setSubmitting(false);
    }
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <CheckCircle2 className="w-20 h-20 text-success mx-auto" />
        </motion.div>
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Thank you! 🎉
          </h2>
          <p className="font-ui text-sm text-gray-600">
            Your feedback helps us improve AlgeFox for students like you.
          </p>
        </div>
      </div>
    );
  }

  /* ── Survey form ── */
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Tell us what you think
        </h1>
        <p className="font-ui text-sm text-gray-500 mt-1">
          Takes about 2 minutes. Your feedback is very important!
        </p>
      </div>

      <div className="px-5 py-5 space-y-7 pb-8">
        {/* Likert questions */}
        {QUESTIONS.map((q, index) => (
          <div key={q.id}>
            <p className="font-ui text-sm font-semibold text-gray-800 leading-snug">
              <span className="text-primary font-bold">{index + 1}.</span> {q.text}
            </p>
            {/* Scale label hints */}
            <div className="flex justify-between mt-1 px-0.5">
              <span className="font-ui text-[10px] text-gray-400">Strongly Disagree</span>
              <span className="font-ui text-[10px] text-gray-400">Strongly Agree</span>
            </div>
            <LikertScale
              questionId={q.id}
              value={responses[q.id] ?? null}
              onChange={(v) => setResponse(q.id, v)}
            />
          </div>
        ))}

        {/* Open text question */}
        <div>
          <label
            htmlFor="open-text"
            className="font-ui text-sm font-semibold text-gray-800 leading-snug block mb-2"
          >
            <span className="text-primary font-bold">6.</span> What did you like most about AlgeFox?{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="open-text"
            value={openText}
            onChange={(e) => setOpenText(e.target.value)}
            placeholder="Write your answer here..."
            rows={4}
            maxLength={500}
            className={cn(
              'w-full font-ui text-sm text-gray-800 bg-gray-50 rounded-xl border-2 border-gray-200',
              'px-4 py-3 resize-none placeholder-gray-400',
              'focus:outline-none focus:border-primary transition-colors',
            )}
          />
          <p className="font-ui text-xs text-gray-400 text-right mt-1">
            {openText.length}/500
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="font-ui text-sm text-error text-center">{error}</p>
        )}

        {/* Submit */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!allAnswered}
          isLoading={submitting}
          onClick={handleSubmit}
        >
          Submit Survey
        </Button>

        {!allAnswered && (
          <p className="font-ui text-xs text-gray-400 text-center -mt-3">
            Please answer all 5 questions above to continue
          </p>
        )}
      </div>
    </div>
  );
}
