'use client';

import { useEffect, useRef } from 'react';
import type { SectionProgress } from '@/types/lesson.types';
import { PathNode } from './PathNode';

interface PathMapProps {
  sections: SectionProgress[];
  currentSectionId: string | null;
}

const ZIGZAG_POSITIONS = ['left', 'right', 'left', 'right', 'left', 'right'] as const;
type ZigzagPosition = 'left' | 'right' | 'center';

function getSubject(sectionSlug: string): 'fractions' | 'algebra' {
  return sectionSlug.startsWith('algebra') ? 'algebra' : 'fractions';
}

function getPosition(index: number): ZigzagPosition {
  return ZIGZAG_POSITIONS[index % ZIGZAG_POSITIONS.length] ?? 'left';
}

export function PathMap({ sections, currentSectionId }: PathMapProps) {
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active section on mount
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  if (!sections.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <p className="font-ui text-gray-500 text-center">No sections available yet.</p>
      </div>
    );
  }

  return (
    <div className="relative px-4 py-6 overflow-x-hidden">
      <div className="relative flex flex-col" style={{ gap: 0 }}>
        {sections.map((section, index) => {
          const isActive = section.sectionId === currentSectionId;
          const position = getPosition(index);
          const subject = getSubject(section.sectionSlug);
          const isLast = index === sections.length - 1;

          return (
            <div
              key={section.sectionId}
              ref={isActive ? activeRef : undefined}
              className="flex flex-col"
            >
              {/* Node */}
              <div className="py-5">
                <PathNode
                  sectionSlug={section.sectionSlug}
                  sectionTitle={section.sectionTitle}
                  subject={subject}
                  currentLevel={section.currentLevel}
                  isUnlocked={section.isUnlocked}
                  isActive={isActive}
                  position={position}
                />
              </div>

              {/* Connector line between nodes */}
              {!isLast && (
                <ConnectorLine
                  fromPosition={position}
                  toPosition={getPosition(index + 1)}
                  isCompleted={section.isCompleted}
                  isNextUnlocked={sections[index + 1]?.isUnlocked ?? false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom padding spacer */}
      <div className="h-8" />
    </div>
  );
}

function ConnectorLine({
  fromPosition,
  toPosition,
  isCompleted,
  isNextUnlocked,
}: {
  fromPosition: ZigzagPosition;
  toPosition: ZigzagPosition;
  isCompleted: boolean;
  isNextUnlocked: boolean;
}) {
  const color = isCompleted || isNextUnlocked ? '#D1D5DB' : '#E5E7EB';
  const dashStyle = isCompleted ? 'none' : '6 4';

  // Determine SVG connector direction for zigzag
  const goingRight = fromPosition === 'left' && toPosition === 'right';
  const goingLeft = fromPosition === 'right' && toPosition === 'left';

  return (
    <div className="relative h-10 w-full flex items-center justify-center">
      <svg
        width="100%"
        height="40"
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        className="absolute inset-0"
        aria-hidden="true"
      >
        {goingRight && (
          <path
            d="M 52 0 Q 100 20 148 40"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={dashStyle}
            strokeLinecap="round"
          />
        )}
        {goingLeft && (
          <path
            d="M 148 0 Q 100 20 52 40"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={dashStyle}
            strokeLinecap="round"
          />
        )}
        {!goingRight && !goingLeft && (
          <line
            x1="100"
            y1="0"
            x2="100"
            y2="40"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={dashStyle}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
