/**
 * Profile Screen
 * Shows user stats, avatar, streak, settings, and post-survey prompt.
 *
 * TODO: Implement with ProfileStats + SettingsPanel (Epic 5)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">
        Profile
      </h1>
      <p className="text-gray-500 font-ui">Profile screen — coming soon</p>
    </div>
  );
}
