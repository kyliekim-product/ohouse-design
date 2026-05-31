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
  mode?: 'generate' | 'refine';
  targetVariantId?: 'A' | 'B' | 'C';
  currentHtml?: string;
}

type PlaygroundVariant = {
  id: 'A' | 'B' | 'C';
  label: string;
  summary?: string;
  html: string;
};

const VARIANT_IDS = ['A', 'B', 'C'] as const;

function extractHtmlBlocks(text: string): string[] {
  const blocks: string[] = [];
  const regex = /```html\s*([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

function extractVariants(text: string, htmlBlocks: string[]): PlaygroundVariant[] | null {
  if (htmlBlocks.length < 2) return null;

  const variants: PlaygroundVariant[] = [];
  const variantRegex = /###\s*([A-Ca-c])안[:\s-]*([^\n]*)\n[\s\S]*?```html\s*([\s\S]*?)```/g;
  let match;

  while ((match = variantRegex.exec(text)) !== null) {
    const id = match[1].toUpperCase() as PlaygroundVariant['id'];
    variants.push({
      id,
      label: `${id}안`,
      summary: match[2]?.trim() || undefined,
      html: match[3].trim(),
    });
  }

  if (variants.length > 1) return variants.slice(0, 3);

  return htmlBlocks.slice(0, 3).map((html, index) => {
    const id = VARIANT_IDS[index] ?? 'A';
    return { id, label: `${id}안`, html };
  });
}

function sanitizeAssistantText(text: string): string {
  return text
    .replace(/###\s*[A-Ca-c]안[^\n]*\n/g, '')
    .replace(/```html\s*[\s\S]*?```/g, '')
    .replace(/```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isInvalidReviewSentence(text: string): boolean {
  return /(?:아래|위|다음|제공된)?\s*(?:HTML|html|코드|마크업|소스|Preview|프리뷰)[\s\S]*(?:확인|살펴|보세요|봐주세요|참고)/u.test(text)
    || /(?:확인|살펴|보세요|봐주세요|참고)[\s\S]*(?:HTML|html|코드|마크업|소스|Preview|프리뷰)/u.test(text)
    || /(?:아래|위|다음)[\s\S]*(?:확인|살펴|보세요|봐주세요|참고)/u.test(text);
}

function removeInvalidReviewLanguage(text: string): string {
  return text
    .split(/(?<=[.!?。])\s+|\n+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence && !isInvalidReviewSentence(sentence))
    .join('\n\n')
    .trim();
}

function isMeaningfulAssistantText(text: string): boolean {
  const normalized = text
    .replace(/[`*_~>#\-\s.。ㆍ·]/g, '')
    .trim();
  return normalized.length >= 8;
}

function hasInvalidReviewLanguage(text: string): boolean {
  return text
    .split(/(?<=[.!?。])\s+|\n+/u)
    .some((sentence) => isInvalidReviewSentence(sentence.trim()));
}

function splitAssistantMessages(text: string): string[] {
  const blocks = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  const source = blocks.length > 0 ? blocks.join('\n\n') : text.trim();
  if (!source) return [];

  const questionMatch = source.match(/^([\s\S]*?)([^.!。\n]*(?:\?|？|까요|나요|할까요|원하시나요)[?.。]?)$/u);
  if (questionMatch?.[1] && questionMatch?.[2]) {
    const body = questionMatch[1].trim();
    const question = questionMatch[2].trim();
    return body ? [body, question] : [question];
  }

  return [source];
}

function buildAssistantMessages(assistantText: string, htmlBlocks: string[], variants: PlaygroundVariant[] | null): string[] {
  const cleanedAssistantText = removeInvalidReviewLanguage(assistantText);

  if (isMeaningfulAssistantText(cleanedAssistantText) && !hasInvalidReviewLanguage(cleanedAssistantText)) {
    const messages = splitAssistantMessages(cleanedAssistantText);
    const hasQuestion = messages.some((message) => /[?？]|(까요|나요|할까요|원하시나요)[.\s]*$/u.test(message));
    if (hasQuestion) return messages;
    return [
      ...messages,
      '다음으로 카피, 정보 구조, CTA, 인터랙션 중 어떤 부분을 먼저 다듬어볼까요?',
    ];
  }

  if (variants?.length) {
    const variantSummary = variants
      .map((variant) => `${variant.label}${variant.summary ? `은 ${variant.summary}` : '은 다른 탐색 방향으로 구성'}`)
      .join(', ');
    return [
      `${variants.length}가지 프로토타입을 만들었어요. ${variantSummary}.`,
      '다음으로 특정 안의 정보 밀도, 카피 톤, CTA 흐름 중 어떤 부분을 먼저 다듬어볼까요?',
    ];
  }

  if (htmlBlocks[0]) {
    return [
      '요청사항을 반영해 화면 구조, 주요 콘텐츠, CTA 흐름을 포함한 프로토타입 초안을 만들었어요.',
      '다음으로 카피, 레이아웃, CTA, 인터랙션 중 어떤 부분을 먼저 다듬어볼까요?',
    ];
  }

  return assistantText ? splitAssistantMessages(assistantText) : [];
}

function buildRefineContext(body: PlaygroundRequest): PlaygroundMessage[] {
  if (body.mode !== 'refine' || !body.currentHtml?.trim()) return body.messages;
  const target = body.targetVariantId ? `${body.targetVariantId}안` : '현재 prototype';
  const refineContext = [
    `수정 대상: ${target}`,
    '아래는 현재 prototype.html입니다. 사용자의 최신 요청을 반영해 수정된 전체 HTML을 다시 출력하세요.',
    '부분 코드나 diff가 아니라 완전한 HTML 문서만 생성해야 합니다.',
    '```html',
    body.currentHtml.trim(),
    '```',
  ].join('\n');

  const refineMessage: PlaygroundMessage = { role: 'user', content: refineContext };
  return [refineMessage, ...body.messages];
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
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        send({ type: 'status', stage: 'understanding', message: '요청을 해석하고 있어요.' });
        send({ type: 'status', stage: 'retrieving', message: 'ohouse 디자인 컨텍스트를 확인하고 있어요.' });
        send({ type: 'status', stage: 'generating', message: '프로토타입 구조와 화면을 생성하고 있어요.' });

        const stream = await client.chat.completions.create({
          model,
          max_tokens: 8192,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...buildRefineContext(body).map((m) => ({ role: m.role, content: m.content })),
          ],
        });

        let fullText = '';
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) fullText += text;
        }

        send({ type: 'status', stage: 'rendering', message: 'Preview에 렌더링하고 있어요.' });

        const htmlBlocks = extractHtmlBlocks(fullText);
        const variants = extractVariants(fullText, htmlBlocks);
        const assistantText = sanitizeAssistantText(fullText);
        const assistantMessages = buildAssistantMessages(assistantText, htmlBlocks, variants);

        for (const text of assistantMessages) {
          send({ type: 'assistant_text', text });
        }

        if (variants?.length) {
          send({ type: 'prototype_done', variants });
        } else if (htmlBlocks[0]) {
          send({ type: 'prototype_done', html: htmlBlocks[0] });
        } else if (!assistantText) {
          send({
            type: 'error',
            stage: 'generating',
            message: '프로토타입 HTML을 찾지 못했어요. 요청을 조금 더 구체화해서 다시 시도해주세요.',
          });
        }

        send({ type: 'status', stage: 'complete', message: '완료됐어요.' });
        send({ type: 'done' });
        controller.close();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        send({ type: 'error', stage: 'error', message });
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
