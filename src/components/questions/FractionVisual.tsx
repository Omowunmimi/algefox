'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
// import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils/cn';
import type { QuestionInstance, FractionVisualData } from '@/types/lesson.types';

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

interface QuestionComponentProps {
  question: QuestionInstance;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  selectedAnswer?: string | null;
  isCorrect?: boolean | null;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ─── Pie Visual ───────────────────────────────────────────────────────────────

function PieVisual({ numerator, denominator }: { numerator: number; denominator: number }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 8;
  const n = Math.max(1, denominator);
  const filled = Math.min(numerator, n);

  // Build SVG path for a slice
  function slicePath(index: number): string {
    const startAngle = (index / n) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((index + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = 1 / n > 0.5 ? 1 : 0;
    if (n === 1) {
      // Full circle
      return `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 -${2 * r} 0`;
    }
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${numerator}/${denominator} fraction pie`}>
        {Array.from({ length: n }, (_, i) => (
          <path
            key={i}
            d={slicePath(i)}
            fill={i < filled ? '#F97316' : '#F3F4F6'}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      <span className="font-display text-lg font-semibold text-gray-700">
        {numerator}/{denominator}
      </span>
    </div>
  );
}

// ─── Bar Visual ───────────────────────────────────────────────────────────────

function BarVisual({ numerator, denominator }: { numerator: number; denominator: number }) {
  const n = Math.max(1, denominator);
  const filled = Math.min(numerator, n);
  const segmentWidth = 240 / n;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex overflow-hidden rounded-lg border-2 border-gray-200"
        style={{ width: 240, height: 48 }}
        aria-label={`${numerator}/${denominator} fraction bar`}
        role="img"
      >
        {Array.from({ length: n }, (_, i) => (
          <div
            key={i}
            style={{
              width: segmentWidth,
              flexShrink: 0,
              borderRight: i < n - 1 ? '2px solid white' : 'none',
            }}
            className={i < filled ? 'bg-primary' : 'bg-gray-100'}
          />
        ))}
      </div>
      <span className="font-display text-lg font-semibold text-gray-700">
        {numerator}/{denominator}
      </span>
    </div>
  );
}

// ─── Visual dispatcher ────────────────────────────────────────────────────────

function FractionVisualDisplay({ data }: { data: FractionVisualData }) {
  const { numerator, denominator, displayMode } = data;
  if (displayMode === 'bar') {
    return <BarVisual numerator={numerator} denominator={denominator} />;
  }
  // 'pie' or 'number_line' (number_line falls back to pie)
  return <PieVisual numerator={numerator} denominator={denominator} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FractionVisual({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCorrect: _isCorrect = null,
}: QuestionComponentProps) {
  const options = question.options ?? [];
  const answered = selectedAnswer !== null;

  // Fall back to a default if no visualData
  const visualData: FractionVisualData = question.visualData ?? {
    numerator: 1,
    denominator: 2,
    displayMode: 'pie',
  };

  function getOptionState(option: string) {
    if (!answered) return 'default';
    const isCorrectAnswer = option === question.correctAnswer;
    const isSelected = option === selectedAnswer;
    if (isCorrectAnswer) return 'correct';
    if (isSelected && !isCorrectAnswer) return 'wrong';
    return 'neutral';
  }

  function getOptionClasses(state: string) {
    switch (state) {
      case 'correct':
        return 'border-success bg-success-bg';
      case 'wrong':
        return 'border-error bg-error-bg';
      case 'neutral':
        return 'border-gray-200 bg-white opacity-60';
      default:
        return 'border-gray-200 bg-white hover:border-primary hover:bg-primary-lighter';
    }
  }

  function getLabelClasses(state: string) {
    switch (state) {
      case 'correct':
        return 'bg-success text-white';
      case 'wrong':
        return 'bg-error text-white';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
  };

  return (
    <motion.div
      className="flex flex-col gap-5 w-full items-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
    >
      {/* Visual representation */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm">
        <FractionVisualDisplay data={visualData} />
      </div>

      {/* Question text */}
      <p className="font-display text-xl font-semibold text-gray-900 leading-snug px-1 text-center">
        {renderMathText(question.questionText)}
      </p>

      {/* Options grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {options.map((option, index) => {
          const state = getOptionState(option);
          const isCorrectAnswer = option === question.correctAnswer;
          const isSelected = option === selectedAnswer;
          const canTap = !disabled && !answered;

          return (
            <motion.button
              key={option}
              variants={itemVariants}
              whileTap={canTap ? { y: 4, boxShadow: 'none' } : undefined}
              style={canTap ? { boxShadow: 'var(--shadow-physical)' } : undefined}
              disabled={disabled || answered}
              onClick={() => canTap && onAnswer(option)}
              className={cn(
                'relative flex items-center gap-3 rounded-2xl border-2 p-4 min-h-[56px] text-left',
                'transition-colors duration-150 cursor-pointer select-none',
                getOptionClasses(state),
                (disabled || answered) && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  'font-display font-bold text-sm transition-colors duration-150',
                  getLabelClasses(state),
                )}
              >
                {OPTION_LABELS[index] ?? String.fromCharCode(65 + index)}
              </span>
              <span className="font-ui text-base text-gray-800 flex-1">
                {renderMathText(option)}
              </span>
              {answered && isCorrectAnswer && (
                <span className="ml-auto text-success font-bold text-lg">✓</span>
              )}
              {answered && isSelected && !isCorrectAnswer && (
                <span className="ml-auto text-error font-bold text-lg">✗</span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
