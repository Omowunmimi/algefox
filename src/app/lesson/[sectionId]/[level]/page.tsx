/**
 * Lesson Screen — dynamic route
 * The core gameplay loop: question → feedback → next question.
 *
 * URL: /lesson/[sectionId]/[level]
 * e.g. /lesson/fractions-intro/5
 *
 * TODO: Implement lesson engine + question components (Epic 4)
 */
import { Metadata } from 'next';

interface Props {
  params: Promise<{
    sectionId: string;
    level: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sectionId, level } = await params;
  return {
    title: `Level ${level} — ${sectionId}`,
  };
}

export default async function LessonPage({ params }: Props) {
  const { sectionId, level } = await params;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="font-display text-xl font-semibold text-gray-900">
          {sectionId} — Level {level}
        </p>
        <p className="text-gray-500 font-ui mt-2">Lesson engine — coming soon</p>
      </div>
    </div>
  );
}
