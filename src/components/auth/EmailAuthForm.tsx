'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailAuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  className?: string;
}

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── Friendly error map ───────────────────────────────────────────────────────

function getFriendlyError(message: string, mode: 'signin' | 'signup'): string {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Wrong email or password. Try again!';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in!';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please check your email inbox and confirm your account first.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Connection issue. Check your internet and try again.';
  }
  if (mode === 'signin') {
    return 'Could not log you in. Please try again.';
  }
  return 'Could not create your account. Please try again.';
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(values: FormState, mode: 'signin' | 'signup'): FormErrors {
  const errors: FormErrors = {};

  if (!values.email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (mode === 'signup') {
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EmailAuthForm({ mode, onSuccess, className }: EmailAuthFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<FormState>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailConfirmPending, setEmailConfirmPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear field-level error on change
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      setServerError(null);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(values, mode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const supabase = createClient();

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setServerError(getFriendlyError(error.message, 'signup'));
          return;
        }

        // No session means email confirmation is required
        if (!data.session) {
          setEmailConfirmPending(true);
          return;
        }

        // Session created immediately (email confirmation disabled in Supabase)
        onSuccess?.();
        router.push('/onboarding/mascot-intro');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setServerError(getFriendlyError(error.message, 'signin'));
          return;
        }

        // Check onboarding status
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setServerError('Something went wrong. Please try again.');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .single();

        onSuccess?.();

        if (!profile || !profile.onboarding_completed) {
          const step = profile?.onboarding_step ?? 0;
          if (step <= 1) {
            router.push('/onboarding/profile');
          } else if (step === 2) {
            router.push('/onboarding/skill-level');
          } else {
            router.push('/home');
          }
        } else {
          router.push('/home');
        }
      }
    } catch (err) {
      console.error('[EmailAuthForm] Unexpected error:', err);
      setServerError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Email confirm pending state ───────────────────────────────────────────

  if (emailConfirmPending) {
    return (
      <div className={cn('text-center py-6 space-y-3', className)}>
        <div className="text-4xl">📬</div>
        <p className="font-display text-xl font-semibold text-gray-900">
          Check your email!
        </p>
        <p className="font-ui text-sm text-gray-600 max-w-xs mx-auto">
          We sent a confirmation link to{' '}
          <span className="font-semibold text-primary">{values.email}</span>.
          Click the link to activate your account, then come back to log in.
        </p>
        <button
          type="button"
          onClick={() => {
            setEmailConfirmPending(false);
            setValues({ email: '', password: '', confirmPassword: '' });
          }}
          className="font-ui text-sm text-primary underline underline-offset-2 hover:text-primary-dark"
        >
          Back to sign up
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  const eyeIconClasses = 'h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('flex flex-col gap-4', className)}
    >
      {/* Email */}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={handleChange('email')}
        error={errors.email}
        disabled={isLoading}
      />

      {/* Password */}
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
        value={values.password}
        onChange={handleChange('password')}
        error={errors.password}
        disabled={isLoading}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="pointer-events-auto"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className={eyeIconClasses} />
            ) : (
              <Eye className={eyeIconClasses} />
            )}
          </button>
        }
      />

      {/* Forgot password (sign-in only) */}
      {mode === 'signin' && (
        <div className="-mt-2 text-right">
          <button
            type="button"
            onClick={() => console.log('[EmailAuthForm] Forgot password pressed')}
            className="font-ui text-sm text-primary hover:text-primary-dark underline underline-offset-2 transition-colors"
          >
            Forgot password?
          </button>
        </div>
      )}

      {/* Confirm password (sign-up only) */}
      {mode === 'signup' && (
        <Input
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={values.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          disabled={isLoading}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="pointer-events-auto"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className={eyeIconClasses} />
              ) : (
                <Eye className={eyeIconClasses} />
              )}
            </button>
          }
        />
      )}

      {/* Server error */}
      {serverError && (
        <p
          role="alert"
          className="font-ui text-sm text-error bg-error-bg border border-error-light rounded-xl px-4 py-3"
        >
          {serverError}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        {mode === 'signup' ? 'Create Account' : 'Log In'}
      </Button>
    </form>
  );
}
