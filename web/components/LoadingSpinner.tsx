'use client';

import { Spinner } from '@johnr1sh/ui';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  label?: string;
}

export function LoadingSpinner({ fullScreen = false, label = 'Loading…' }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label={label} />
      </div>
    );
  }
  return <Spinner size="md" label={label} />;
}
