'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@johnr1sh/ui';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = value.trim();
      if (!text || disabled) return;
      onSend(text);
      setValue('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-gray-200 bg-white p-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Copilot… (Enter to send, Shift+Enter for newline)"
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        style={{ maxHeight: '8rem', overflowY: 'auto' }}
      />
      <Button type="submit" variant="primary" size="md" disabled={disabled || !value.trim()}>
        Send
      </Button>
    </form>
  );
}
