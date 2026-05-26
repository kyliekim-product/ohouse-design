const FIELD_WEIGHTS = [
  { name: 'title', weight: 12, read: (item) => item.title },
  { name: 'aliases', weight: 12, read: (item) => item.metadata?.aliases?.join(' ') },
  { name: 'description', weight: 6, read: (item) => item.metadata?.description },
  { name: 'heading_path', weight: 7, read: (item) => item.heading_path?.join(' ') },
  { name: 'source_path', weight: 3, read: (item) => item.source_path },
  { name: 'content', weight: 1, read: (item) => item.content },
];

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'can',
  'do',
  'does',
  'for',
  'how',
  'i',
  'is',
  'me',
  'of',
  'or',
  'should',
  'the',
  'to',
  'use',
  'what',
  'when',
  'where',
  'which',
  'why',
  '좀',
  '뭐',
  '뭐야',
  '무엇',
  '어떤',
  '어떻게',
  '언제',
  '어디',
  '왜',
  '알려줘',
  '설명해줘',
  '해줘',
  '써',
  '쓰면',
  '쓰는',
  '사용',
]);

const GUIDE_INTENT_TOKENS = new Set([
  '가이드',
  'guideline',
  'guidelines',
  'usage',
  'when',
  '언제',
  '차이',
  'vs',
  '비교',
  '사용',
  '쓰면',
  'ux',
  'do',
  'dont',
]);

const SPEC_INTENT_TOKENS = new Set([
  'constant',
  'constants',
  'prop',
  'props',
  'property',
  'state',
  'states',
  'token',
  'tokens',
  'variant',
  'variants',
  '구조',
  '상태',
  '속성',
  '토큰',
  '프로퍼티',
]);

export function searchPublicIndex(index, query, options = {}) {
  const topK = Number(options.topK ?? 10);
  const tokens = tokenizeQuery(query);
  const normalizedQuery = normalizeText(query);
  const intent = detectIntent(query);

  if (tokens.length === 0) {
    return {
      query,
      tokens,
      results: [],
    };
  }

  const results = index.items
    .map((item) => scoreItem(item, tokens, normalizedQuery, intent))
    .filter((result) => result.score > 0 && !isLowInformationChunk(result.item))
    .sort(compareResults)
    .slice(0, topK);

  return {
    query,
    tokens,
    intent,
    results,
  };
}

export function tokenizeQuery(value) {
  const normalized = normalizeText(value);
  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  const tokens = new Set();

  for (const rawToken of rawTokens) {
    const variants = tokenVariants(rawToken);
    for (const token of variants) {
      if (token.length <= 1) continue;
      if (STOPWORDS.has(token)) continue;
      tokens.add(token);
    }
  }

  return [...tokens];
}

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[`*_~()[\]{}<>"“”‘’:;,.!?|\\+=]/g, ' ')
    .replace(/[-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreItem(item, tokens, normalizedQuery, intent) {
  const matches = [];
  let score = 0;

  const exactTitleScore = scoreExactTitle(item, tokens, normalizedQuery);
  if (exactTitleScore > 0) {
    score += exactTitleScore;
    matches.push({
      field: 'title',
      tokens: [normalizeText(item.title)],
      score: exactTitleScore,
      exact: true,
    });
  }

  for (const field of FIELD_WEIGHTS) {
    const text = field.read(item);
    const normalizedText = normalizeText(text);
    if (!normalizedText) continue;

    const normalizedTextCompact = normalizedText.replace(/\s+/g, '');
    const matchedTokens = tokens.filter((token) => matchesToken(normalizedText, normalizedTextCompact, token));
    if (matchedTokens.length > 0) {
      const fieldScore = matchedTokens.length * field.weight;
      score += fieldScore;
      matches.push({
        field: field.name,
        tokens: matchedTokens,
        score: fieldScore,
      });
    }

    if (normalizedQuery.length > 3 && normalizedText.includes(normalizedQuery)) {
      const phraseScore = field.weight * 2;
      score += phraseScore;
      matches.push({
        field: field.name,
        tokens: [normalizedQuery],
        score: phraseScore,
        phrase: true,
      });
    }
  }

  const intentScore = scoreIntent(item, intent);
  if (intentScore > 0) {
    score += intentScore;
    matches.push({
      field: 'document_kind',
      tokens: [item.document_kind],
      score: intentScore,
      intent: true,
    });
  }

  const rootGuideScore = scoreRootGuide(item, intent);
  if (rootGuideScore > 0) {
    score += rootGuideScore;
    matches.push({
      field: 'heading_path',
      tokens: ['root-guide'],
      score: rootGuideScore,
      intent: true,
    });
  }

  const tokenDomainScore = scoreTokenDomain(item, tokens);
  if (tokenDomainScore > 0) {
    score += tokenDomainScore;
    matches.push({
      field: 'metadata.category',
      tokens: ['foundations'],
      score: tokenDomainScore,
      intent: true,
    });
  }

  return {
    item,
    score,
    matches,
  };
}

function scoreExactTitle(item, tokens, normalizedQuery) {
  const normalizedTitle = normalizeText(item.title);
  if (!normalizedTitle) return 0;

  if (tokens.includes(normalizedTitle)) return 10;
  if (normalizedTitle.includes(' ') && normalizedQuery.includes(normalizedTitle)) return 10;
  return 0;
}

function scoreIntent(item, intent) {
  if (intent === 'guide' && item.document_kind === 'guide') return 3;
  if (intent === 'spec' && item.document_kind === 'spec') return 3;
  return 0;
}

function scoreRootGuide(item, intent) {
  if (intent === 'guide' && item.document_kind === 'guide' && item.heading_path?.length === 1) {
    return 6;
  }
  return 0;
}

function scoreTokenDomain(item, tokens) {
  const asksAboutTokens = tokens.some((token) => ['token', 'tokens', '토큰', '색상', 'color', 'semantic'].includes(token));
  if (asksAboutTokens && item.metadata?.category === 'foundations') return 20;
  return 0;
}

function detectIntent(query) {
  const normalizedTokens = normalizeText(query).split(/\s+/).filter(Boolean);
  const hasGuideIntent = normalizedTokens.some((token) => GUIDE_INTENT_TOKENS.has(token));
  const hasSpecIntent = normalizedTokens.some((token) => SPEC_INTENT_TOKENS.has(token));

  if (hasGuideIntent && !hasSpecIntent) return 'guide';
  if (hasSpecIntent && !hasGuideIntent) return 'spec';
  return 'mixed';
}

function compareResults(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  const titleCompare = a.item.title.localeCompare(b.item.title);
  if (titleCompare !== 0) return titleCompare;
  return a.item.source_path.localeCompare(b.item.source_path);
}

function isLowInformationChunk(item) {
  const contentWithoutHeadings = String(item.content ?? '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')
    .trim();

  return contentWithoutHeadings.length === 0;
}

function tokenVariants(token) {
  const withoutKoreanParticle = stripKoreanParticles(token);

  const synonymVariants = synonymsForToken(withoutKoreanParticle);
  if (synonymVariants.length > 0) {
    return synonymVariants;
  }

  if (withoutKoreanParticle !== token && withoutKoreanParticle.length > 1) {
    return [withoutKoreanParticle];
  }

  return [token];
}

function matchesToken(normalizedText, normalizedTextCompact, token) {
  if (normalizedText.includes(token)) return true;
  if (token.length >= 3 && normalizedTextCompact.includes(token.replace(/\s+/g, ''))) return true;
  return false;
}

function synonymsForToken(token) {
  const synonyms = {
    서브텍스트: ['서브텍스트', 'sub text', 'subtext'],
    바텀시트: ['바텀시트', 'bottom sheet', 'bottomsheet'],
    체크박스: ['체크박스', 'checkbox'],
    라디오: ['라디오', 'radio'],
    다이얼로그: ['다이얼로그', 'dialog'],
    모달: ['모달', 'dialog'],
    사이즈: ['사이즈', 'size'],
    너비: ['너비', 'width'],
  };

  return synonyms[token] ?? [];
}

function stripKoreanParticles(token) {
  let stripped = token;
  const particlePattern = /(은|는|이|가|의|을|를|에|에서|에게|께|와|과|랑|하고|도|만|로|으로|부터|까지|처럼|보다)$/;

  while (stripped.length > 1) {
    const next = stripped.replace(particlePattern, '');
    if (next === stripped || next.length <= 1) break;
    stripped = next;
  }

  return stripped;
}
