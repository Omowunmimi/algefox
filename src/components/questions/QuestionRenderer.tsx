'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import type { QuestionInstance } from '@/types/lesson.types';
import { MultipleChoice } from './MultipleChoice';
import { TrueFalse } from './TrueFalse';
import { FillBlank } from './FillBlank';
import { DragDrop } from './DragDrop';
import { FractionVisual } from './FractionVisual';
import { MatchPairs } from './MatchPairs';
import { Ordering } from './Ordering';

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionRendererProps {
  question: QuestionInstance;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  selectedAnswer?: string | null;
  isCorrect?: boolean | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuestionRenderer({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  isCorrect = null,
}: QuestionRendererProps) {
  const commonProps = {
    question,
    onAnswer,
    disabled,
    selectedAnswer,
    isCorrect,
  };

  function renderQuestionBody() {
    switch (question.type) {
      case 'multiple_choice':
        return <MultipleChoice {...commonProps} />;
      case 'true_false':
        return <TrueFalse {...commonProps} />;
      case 'fill_blank':
        return <FillBlank {...commonProps} />;
      case 'drag_drop':
        return <DragDrop {...commonProps} />;
      case 'fraction_visual':
        return <FractionVisual {...commonProps} />;
      case 'match_pairs':
        return <MatchPairs {...commonProps} />;
      case 'ordering':
        return <Ordering {...commonProps} />;
      default:
        return (
          <p className="font-ui text-sm text-gray-400 text-center">
            Unknown question type: {(question as QuestionInstance).type}
          </p>
        );
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.templateId}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="flex flex-col gap-5 w-full"
      >
        {/* Question text header (shown for types that don't render their own) */}
        {question.type !== 'multiple_choice' &&
          question.type !== 'true_false' && (
            <h2 className="font-display text-xl font-semibold text-gray-900 leading-snug px-1">
              {renderMathText(question.questionText)}
            </h2>
          )}

        {/* Question body */}
        {renderQuestionBody()}
      </motion.div>
    </AnimatePresence>
  );
}
