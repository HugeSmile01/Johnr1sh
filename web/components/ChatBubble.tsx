'use client';

import type { Message } from '@/hooks/useChat';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={[
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'rounded-br-sm bg-indigo-600 text-white'
            : 'rounded-bl-sm border border-gray-200 bg-white text-gray-900',
        ].join(' ')}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        <time
          className={`mt-1 block text-right text-[10px] ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}
          dateTime={message.createdAt.toISOString()}
        >
          {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </div>
  );
}
