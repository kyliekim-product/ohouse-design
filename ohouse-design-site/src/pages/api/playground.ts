// POST /api/playground — OpenAI API 스트리밍 엔드포인트
// 개인 Key 모드: X-API-Key 헤더
// 팀 공용 Key 모드: OPENAI_API_KEY 환경변수

export const prerender = false;

import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { buildSystemPrompt } from '../../lib/playground-context.js';

export interface PlaygroundMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PlaygroundRequest {
  messages: PlaygroundMessage[];
  userContext?: string;
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey =
    request.headers.get('X-API-Key') ||
    import.meta.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key가 필요합니다. X-API-Key 헤더 또는 OPENAI_API_KEY 환경변수를 설정하세요.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: PlaygroundRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: '잘못된 요청 형식입니다.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages, userContext } = body;
  if (!messages?.length) {
    return new Response(
      JSON.stringify({ error: 'messages 배열이 비어있습니다.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const systemPrompt = buildSystemPrompt(userContext);
  const model = import.meta.env.OPENAI_MODEL || 'gpt-4o-mini';

  const client = new OpenAI({ apiKey });
  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.chat.completions.create({
          model,
          max_tokens: 8192,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            const data = JSON.stringify({ type: 'delta', text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          if (chunk.choices[0]?.finish_reason === 'stop') {
            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
          }
        }
        controller.close();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};
