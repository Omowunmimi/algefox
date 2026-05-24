'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils/cn';
import type { QuestionInstance, DragItem } from '@/types/lesson.types';

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

// ─── Sortable item ────────────────────────────────────────────────────────────

interface SortableItemProps {
  item: DragItem;
  isDraggingOverlay?: boolean;
  isCorrect?: boolean | null;
  correctOrderIds?: string[];
  index?: number;
  answered?: boolean;
}

function SortableItem({
  item,
  isDraggingOverlay = false,
  correctOrderIds,
  index,
  answered,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? 'none' : isDraggingOverlay ? '0 8px 24px rgba(0,0,0,0.15)' : 'var(--shadow-physical)',
    opacity: isDragging ? 0.4 : 1,
    scale: isDraggingOverlay ? 1.05 : 1,
  };

  let feedbackClass = '';
  if (answered && correctOrderIds && index !== undefined) {
    const isInCorrectPosition = correctOrderIds[index] === item.id;
    feedbackClass = isInCorrectPosition ? 'border-success bg-success-bg' : 'border-error bg-error-bg';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl p-3 min-h-14',
        'font-ui text-base text-gray-800 select-none cursor-grab active:cursor-grabbing',
        'transition-colors duration-150',
        feedbackClass,
        isDraggingOverlay && 'cursor-grabbing',
      )}
    >
      {/* Drag handle dots */}
      <span className="text-gray-300 select-none shrink-0 flex flex-col gap-0.5">
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        </span>
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        </span>
      </span>
      <span className="flex-1">{renderMathText(item.label)}</span>
      {answered && correctOrderIds && index !== undefined && (
        <span className={cn(
          'font-bold text-lg',
          correctOrderIds[index] === item.id ? 'text-success' : 'text-error',
        )}>
          {correctOrderIds[index] === item.id ? '✓' : '✗'}
        </span>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DragDrop({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  isCorrect = null,
}: QuestionComponentProps) {
  const initialItems = question.items ?? [];
  const [items, setItems] = useState<DragItem[]>(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const answered = selectedAnswer !== null;

  // Parse correctAnswer as ordered list of ids (comma-separated)
  const correctOrderIds = question.correctAnswer.split(',').map((s) => s.trim());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function handleCheck() {
    const orderedIds = items.map((i) => i.id).join(',');
    onAnswer(orderedIds);
  }

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;
  const canCheck = !disabled && !answered && items.length > 0;

  return (
    <motion.div
      className="flex flex-col gap-5 w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {/* Question text */}
      <p className="font-display text-xl font-semibold text-gray-900 leading-snug px-1">
        {renderMathText(question.questionText)}
      </p>

      <p className="font-ui text-sm text-gray-500 px-1">
        Drag to reorder, then tap Check.
      </p>

      {/* Sortable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                isCorrect={isCorrect}
                correctOrderIds={answered ? correctOrderIds : undefined}
                index={index}
                answered={answered}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem && (
            <div
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'scale(1.05)' }}
              className="flex items-center gap-3 bg-white border-2 border-primary rounded-xl p-3 min-h-14 font-ui text-base text-gray-800 select-none cursor-grabbing"
            >
              <span className="shrink-0 flex flex-col gap-0.5">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                </span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                </span>
              </span>
              <span className="flex-1">{renderMathText(activeItem.label)}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Check button */}
      {!answered && (
        <motion.button
          whileTap={canCheck ? { y: 4, boxShadow: 'none' } : undefined}
          style={canCheck ? { boxShadow: 'var(--shadow-physical-primary)' } : undefined}
          disabled={!canCheck}
          onClick={handleCheck}
          className={cn(
            'w-full min-h-14 rounded-2xl font-display font-bold text-lg',
            'transition-all duration-150 select-none',
            canCheck
              ? 'bg-primary text-white cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          Check Order
        </motion.button>
      )}

      {/* Feedback */}
      {answered && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-center font-ui font-semibold text-base',
            isCorrect === true ? 'text-success' : 'text-error',
          )}
        >
          {isCorrect === true ? 'Perfect order! ✓' : 'Not quite — check the order above.'}
        </motion.p>
      )}
    </motion.div>
  );
}
