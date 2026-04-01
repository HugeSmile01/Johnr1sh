import Replicate from 'replicate';
import { PrismaClient } from '@prisma/client';
import type { ChatMessage } from '@johnr1sh/lib/types';

const prisma = new PrismaClient();

function getReplicateClient(): Replicate {
  const token = process.env['REPLICATE_API_TOKEN'];
  if (!token) throw new Error('REPLICATE_API_TOKEN is not set');
  return new Replicate({ auth: token });
}

const MODEL = 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397d68b3df12d6edfdb9b3b3c56';
const MAX_NEW_TOKENS = 1024;

type Role = 'user' | 'assistant' | 'system';

function buildPrompt(messages: { role: Role; content: string }[]): string {
  // Llama 2 chat format
  let prompt = '';
  for (const msg of messages) {
    if (msg.role === 'system') {
      prompt += `<<SYS>>\n${msg.content}\n<</SYS>>\n\n`;
    } else if (msg.role === 'user') {
      prompt += `[INST] ${msg.content} [/INST]\n`;
    } else {
      prompt += `${msg.content}\n`;
    }
  }
  return prompt;
}

export async function sendChatMessage(
  messages: { role: Role; content: string }[],
): Promise<string> {
  const replicate = getReplicateClient();
  const prompt = buildPrompt(messages);

  const output = await replicate.run(MODEL, {
    input: { prompt, max_new_tokens: MAX_NEW_TOKENS, temperature: 0.7 },
  });

  if (Array.isArray(output)) {
    return (output as string[]).join('');
  }
  return String(output);
}

export async function getConversationHistory(
  conversationId: string,
): Promise<{ role: Role; content: string }[]> {
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20, // last 20 messages for context
  });
  return messages.map((m) => ({ role: m.role as Role, content: m.content }));
}
