/**
 * Onboarding Step 1 — Profile Setup
 * User sets their username and selects an avatar.
 * Google users see a prefill banner with their Google name.
 *
 * TODO: Implement with UsernameInput + AvatarPicker (Epic 2)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set Up Your Profile',
};

export default function OnboardingProfilePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-3xl font-semibold text-gray-900 mb-2">
          What should we call you?
        </h1>
        <p className="text-gray-500 font-ui">Profile setup — coming soon</p>
      </div>
    </div>
  );
}
