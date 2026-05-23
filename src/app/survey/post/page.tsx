/**
 * Post-Study Survey
 * Prompted from profile page after 3+ sessions.
 * Collects likert-scale responses about motivation and engagement.
 *
 * TODO: Implement with SurveyForm (Epic 7)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quick Survey',
};

export default function PostSurveyPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">
        Tell us what you think
      </h1>
      <p className="text-gray-500 font-ui">Post-study survey — coming soon</p>
    </div>
  );
}
