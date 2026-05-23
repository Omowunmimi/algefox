'use client';

import { forwardRef, ReactNode, InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Applied to the outer wrapper div */
  className?: string;
  /** Applied directly to the <input> element */
  inputClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    className,
    inputClassName,
    id,
    disabled,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="font-ui text-sm font-semibold text-gray-700"
        >
          {label}
        </label>
      )}

      {/* Input wrapper — handles icon positioning */}
      <div className="relative flex items-center">
        {/* Left icon */}
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-gray-400">
            {leftIcon}
          </span>
        )}

        {/* The actual input */}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            // Base
            'w-full rounded-xl border-2 bg-white font-ui text-base text-gray-900',
            'placeholder:text-gray-400',
            // Spacing — adjust for icons
            leftIcon  ? 'pl-10 pr-4' : 'px-4',
            rightIcon ? 'pr-10'      : '',
            'py-3',
            // Border colour + focus
            hasError
              ? 'border-error focus:border-error'
              : 'border-gray-200 focus:border-primary',
            'outline-none ring-0',
            // Transition (border color only)
            'transition-[border-color] duration-150 ease-in-out',
            // Disabled
            disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
            inputClassName,
          )}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...rest}
        />

        {/* Right icon */}
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 flex items-center text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id={`${inputId}-error`} className="font-ui text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {/* Hint message — only shown when there's no error */}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="font-ui text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export type { InputProps };
