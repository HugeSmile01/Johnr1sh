'use client';

import { useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { Spinner } from '@johnr1sh/ui';

export function ChatInterface() {
  const { messages, send, isStreaming } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="chat-scroll flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-gray-400">
            <span className="text-4xl">🤖</span>
            <p className="text-sm">Ask me anything…</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex justify-start mb-4">
            <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-3">
              <Spinner size="sm" label="Thinking…" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  );
}
