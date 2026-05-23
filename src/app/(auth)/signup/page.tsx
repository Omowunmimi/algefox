/**
 * Sign Up Page
 * Supports Google OAuth and email/password registration.
 *
 * TODO: Implement with GoogleButton + EmailAuthForm (Epic 2)
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-3xl font-semibold text-gray-900 mb-2">
          Create your account
        </h1>
        <p className="text-gray-500 font-ui">Sign up — coming soon</p>
      </div>
    </div>
  );
}
