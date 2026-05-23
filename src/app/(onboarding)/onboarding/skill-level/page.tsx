/**
 * Onboarding Step 2 — Skill Level Selection
 * User self-reports their current math comfort level.
 * Options: Beginner / Intermediate / Advanced
 *
 * TODO: Implement with SkillLevelCard components (Epic 2)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Choose Your Level',
};

export default function OnboardingSkillLevelPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-3xl font-semibold text-gray-900 mb-2">
          How much maths do you know?
        </h1>
        <p className="text-gray-500 font-ui">Skill level — coming soon</p>
      </div>
    </div>
  );
}
