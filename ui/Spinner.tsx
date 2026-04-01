import React from 'react';

type Size = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: Size;
  label?: string;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

export function Spinner({ size = 'md', label = 'Loading…', className = '' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={['inline-flex', className].join(' ')}>
      <span
        className={[
          'animate-spin rounded-full border-indigo-600 border-t-transparent',
          sizeClasses[size],
        ].join(' ')}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
