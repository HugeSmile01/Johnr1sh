'use client';

import { Suspense } from 'react';
import { Spinner } from '@johnr1sh/ui';
import { ChatInterface } from '@/components/ChatInterface';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Loading…" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Johnr1sh Copilot</h1>
        <p className="text-gray-500">Sign in to start chatting.</p>
        <a
          href="/auth"
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Johnr1sh Copilot</h1>
        <span className="text-sm text-gray-500">{user.email}</span>
      </header>
      <Suspense fallback={<Spinner size="md" />}>
        <ChatInterface />
      </Suspense>
    </main>
  );
}
