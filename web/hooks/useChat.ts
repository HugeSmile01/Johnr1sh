'use client';

import { useState, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpcClient';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export function useChat(initialConversationId?: string) {
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onMutate: ({ message }) => {
      const optimistic: Message = {
        id: `opt-${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, optimistic]);
      setIsStreaming(true);
    },
    onSuccess: (data) => {
      if (!conversationId) setConversationId(data.conversationId);
      const assistantMsg: Message = {
        id: data.message.id,
        role: 'assistant',
        content: data.message.content,
        createdAt: new Date(data.message.createdAt),
      };
      setMessages((prev) => {
        const optimistic = prev.find((m) => m.id.startsWith('opt-'));
        const withoutOptimistic = prev.filter((m) => !m.id.startsWith('opt-'));
        return optimistic
          ? [...withoutOptimistic, optimistic, assistantMsg]
          : [...withoutOptimistic, assistantMsg];
      });
      setIsStreaming(false);
    },
    onError: () => {
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('opt-')));
      setIsStreaming(false);
    },
  });

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isStreaming) return;
      sendMessage.mutate({ message: text, conversationId });
    },
    [conversationId, isStreaming, sendMessage],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { messages, send, isStreaming, abort, conversationId };
}
