import { parseIntent } from './parse-intent.js';

export function buildPlaygroundRequestPayload({
  userText,
  messages,
  variants,
  activeVariantId,
  userContext,
}) {
  const { targetId, sourceId, intentType } = parseIntent(userText, variants, activeVariantId);
  const hasExistingVariants = variants.some((v) => v.html);
  const mode = hasExistingVariants ? 'refine' : 'generate';
  const targetVariant = targetId ? variants.find((v) => v.id === targetId) : null;
  const sourceVariant = sourceId ? variants.find((v) => v.id === sourceId) : null;

  const currentHtml = intentType === 'create_derived'
    ? (sourceVariant?.html ?? null)
    : (targetVariant?.html ?? null);

  const referenceHtml = intentType === 'refine_with_reference'
    ? (sourceVariant?.html ?? null)
    : null;

  return {
    messages: messages
      .filter(({ role }) => role === 'user' || role === 'assistant')
      .map(({ role, content }) => ({ role, content })),
    userContext,
    mode,
    targetVariantId: mode === 'refine' ? targetId : undefined,
    sourceVariantId: mode === 'refine' && sourceId ? sourceId : undefined,
    intentType: mode === 'refine' ? intentType : undefined,
    currentHtml: currentHtml ?? undefined,
    referenceHtml: referenceHtml ?? undefined,
  };
}
