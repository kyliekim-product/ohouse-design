/**
 * 유저 메시지에서 수정 의도와 대상 안을 파싱한다.
 * @param {string} message - 유저 입력 메시지
 * @param {Array<{id: string, html: string|null}>} variants - 현재 variants 배열
 * @param {string|null} activeVariantId - 현재 활성 탭 ID (언급 없을 때 폴백)
 * @returns {{ targetId: string|null, sourceId: string|null, intentType: 'refine'|'create_new'|'create_derived'|'refine_with_reference' }}
 */
function sourceHasReferencedFeature(message, sourceHtml) {
  if (!sourceHtml) return false;
  const html = sourceHtml.toLowerCase();
  const featureMatchers = [
    {
      message: /(?:구매\s*유도|첫\s*구매|구매|cta|CTA|배너)/u,
      html: /(?:purchase|cta|banner|구매|첫\s*구매|혜택|쿠폰)/u,
    },
    {
      message: /(?:필터\s*칩|필터칩|카테고리\s*필터)/u,
      html: /(?:filter|chip|category|카테고리|필터)/u,
    },
  ];

  return featureMatchers.some((matcher) => matcher.message.test(message) && matcher.html.test(html));
}

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
  const sourceVariant = sourceId ? variants?.find((v) => v.id === sourceId) : null;
  const targetHasHtml = Boolean(targetVariant?.html);
  const hasReferenceMergeVerb = /(?:추가|붙여|넣어|반영|가져와|이식|적용)/u.test(message);
  const hasExplicitRebuildVerb = /(?:새로|재구성|전체|갈아엎|완전히|다시\s*만들|처음부터)/u.test(message);
  const targetMentionPattern = targetId ? new RegExp(`${targetId}안\\s*(?:에|에는|으로|쪽에)`, 'u') : null;
  const mentionsTargetAsEditSurface = Boolean(targetMentionPattern?.test(message));
  const sourceHasRequestedFeature = sourceHasReferencedFeature(message, sourceVariant?.html);
  const shouldRefineWithReference = Boolean(sourceId)
    && sourceId !== targetId
    && targetHasHtml
    && hasReferenceMergeVerb
    && mentionsTargetAsEditSurface
    && sourceHasRequestedFeature
    && !hasExplicitRebuildVerb;

  // If sourceId is set but targetId is null, force create_new and clear sourceId (can't derive without target)
  let finalSourceId = sourceId;
  let intentType;
  if (sourceId && !targetId) {
    finalSourceId = null;
    intentType = 'create_new';
  } else {
    intentType = shouldRefineWithReference
      ? 'refine_with_reference'
      : isDerive
        ? 'create_derived'
        : targetHasHtml
          ? 'refine'
          : 'create_new';
  }

  return { targetId, sourceId: finalSourceId, intentType };
}
