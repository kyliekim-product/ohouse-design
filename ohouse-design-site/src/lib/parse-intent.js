/**
 * 유저 메시지에서 수정 의도와 대상 안을 파싱한다.
 * @param {string} message - 유저 입력 메시지
 * @param {Array<{id: string, html: string|null}>} variants - 현재 variants 배열
 * @param {string|null} activeVariantId - 현재 활성 탭 ID (언급 없을 때 폴백)
 * @returns {{ targetId: string|null, sourceId: string|null, intentType: 'refine'|'create_new'|'create_derived' }}
 */
export function parseIntent(message, variants, activeVariantId) {
  // "A안 기반으로", "A안 베이스로", "A안 바탕으로", "A안 참고해서"
  const sourceMatch = message.match(/([A-Ca-c])안\s*(?:기반|베이스|참고|바탕)/);
  const sourceId = sourceMatch ? sourceMatch[1].toUpperCase() : null;

  // Find all variant mentions; when a source exists, skip the source mention to find target
  const allMatches = [...message.matchAll(/([A-Ca-c])안/g)];
  const targetMatch = sourceId
    ? allMatches.find((m) => m[1].toUpperCase() !== sourceId)
    : allMatches[0];
  const targetId = targetMatch ? targetMatch[1].toUpperCase() : (activeVariantId ?? null);

  const isDerive = Boolean(sourceId) && sourceId !== targetId;
  const targetVariant = targetId ? variants?.find((v) => v.id === targetId) : null;
  const targetHasHtml = Boolean(targetVariant?.html);

  // If sourceId is set but targetId is null, force create_new and clear sourceId (can't derive without target)
  let finalSourceId = sourceId;
  let intentType;
  if (sourceId && !targetId) {
    finalSourceId = null;
    intentType = 'create_new';
  } else {
    intentType = isDerive
      ? 'create_derived'
      : targetHasHtml
        ? 'refine'
        : 'create_new';
  }

  return { targetId, sourceId: finalSourceId, intentType };
}
