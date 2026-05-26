import { mkdirSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { loadPublicIndex } from './load-public-index.mjs';
import { inferKnowledgeArea } from './knowledge-area.mjs';
import { searchPublicIndex } from './search-public-index.mjs';

const DEFAULT_TOP_K = 8;
const DEFAULT_USAGE_LOG_PATH = 'build/hermes-usage/usage.jsonl';

const OPERATIONAL_SOURCE_PATTERNS = [
  /figma/i,
  /notion/i,
  /slack/i,
  /jira/i,
  /storybook/i,
  /shadcn/i,
  /qa/i,
  /피그마/,
  /노션/,
  /슬랙/,
  /지라/,
  /스토리북/,
];

const LIVE_STATE_PATTERNS = [
  /최신/,
  /예전/,
  /버전/,
  /반영/,
  /등록/,
  /승인/,
  /배포/,
  /태스크/,
  /이슈/,
  /버그/,
  /레포/,
  /repository/i,
  /repo/i,
  /파일/,
  /위치/,
  /어디서\s*확인/,
  /검색되는/,
  /결론/,
  /말한/,
  /어제/,
  /일정/,
  /상태/,
];

const INFRASTRUCTURE_PATTERNS = [
  /서버/,
  /url/i,
  /이미지\s*url/i,
  /asset/i,
  /프로토타입\s*툴/,
  /ai\s*프로토타입/i,
];

export function retrieveOdsEvidence(question, options = {}) {
  const { index, indexPath } = options.index
    ? { index: options.index, indexPath: options.indexPath ?? '(provided)' }
    : loadPublicIndex({ indexPath: options.indexPath });

  const topK = Number(options.topK ?? DEFAULT_TOP_K);
  const search = searchPublicIndex(index, question, { topK });
  const candidateEvidence = search.results.map((result, index) => evidenceEntry(result, index));
  const answerability = assessAnswerability(question);
  const evidence = answerability.status === 'answerable' ? candidateEvidence : [];
  const topArea = candidateEvidence[0]?.inferred_area ?? null;
  const predictedPrimaryArea = answerability.status === 'answerable' ? topArea : null;
  const confidence = confidenceFor({ answerability, evidence, search });

  return {
    query: question,
    index_path: indexPath,
    index_version: indexVersion(index),
    answerability,
    evidence,
    retrieval: {
      tokens: search.tokens,
      intent: search.intent,
      top_k: topK,
      result_count: evidence.length,
      candidate_result_count: candidateEvidence.length,
      top_area: evidence[0]?.inferred_area ?? null,
      predicted_primary_area: predictedPrimaryArea,
      confidence,
    },
  };
}

export function logRetrieveUsage(retrieveResult, options = {}) {
  const logPath = path.resolve(process.cwd(), options.logPath ?? process.env.HERMES_USAGE_LOG_PATH ?? DEFAULT_USAGE_LOG_PATH);
  const surface = stringOrDefault(options.surface, 'unknown');
  const tool = stringOrDefault(options.tool, 'retrieve_ods_evidence');
  const topResults = (options.candidateEvidence ?? retrieveResult.evidence ?? []).slice(0, 8);

  const row = {
    created_at: new Date().toISOString(),
    surface,
    tool,
    query: retrieveResult.query,
    answerability: retrieveResult.answerability,
    retrieval: retrieveResult.retrieval,
    index_version: retrieveResult.index_version,
    top_results: topResults.map((entry) => ({
      citation: entry.citation,
      score: entry.score,
      inferred_area: entry.inferred_area,
    })),
  };

  mkdirSync(path.dirname(logPath), { recursive: true });
  appendFileSync(logPath, `${JSON.stringify(row)}\n`, 'utf8');
  return { log_path: logPath, row };
}

export function assessAnswerability(question) {
  const text = String(question ?? '');
  const sourceSignals = OPERATIONAL_SOURCE_PATTERNS.filter((pattern) => pattern.test(text)).map(String);
  const liveSignals = LIVE_STATE_PATTERNS.filter((pattern) => pattern.test(text)).map(String);
  const infraSignals = INFRASTRUCTURE_PATTERNS.filter((pattern) => pattern.test(text)).map(String);

  if ((sourceSignals.length > 0 && liveSignals.length > 0) || infraSignals.length > 0) {
    return {
      status: 'not_answerable_from_public_index',
      reason: sourceSignals.length > 0 ? 'operational_source_not_indexed' : 'infrastructure_source_not_indexed',
      summary: 'The question depends on live operational state or infrastructure outside the current ODS public index.',
      signals: [...sourceSignals.map((signal) => `source:${signal}`), ...liveSignals.map((signal) => `live:${signal}`), ...infraSignals.map((signal) => `infra:${signal}`)],
    };
  }

  return {
    status: 'answerable',
    reason: null,
    summary: 'The question can be answered from ODS public index evidence if relevant evidence is retrieved.',
    signals: [],
  };
}

function evidenceEntry(result, index) {
  const citationId = `C${index + 1}`;
  return {
    citation: {
      id: citationId,
      title: result.item.title,
      source_path: result.item.source_path,
      heading_path: result.item.heading_path,
      content_hash: result.item.content_hash,
    },
    score: result.score,
    matches: result.matches,
    content: result.item.content,
    metadata: result.item.metadata,
    document_kind: result.item.document_kind,
    kind: result.item.kind,
    slug: result.item.slug,
    inferred_area: inferKnowledgeArea(result.item.source_path),
  };
}

function indexVersion(index) {
  return {
    source_commit: index.source_commit,
    generated_at: index.generated_at,
    dirty: Boolean(index.dirty),
    item_count: index.item_count ?? index.items?.length ?? null,
  };
}

function confidenceFor({ answerability, evidence, search }) {
  if (answerability.status !== 'answerable') return 'high';
  if (evidence.length === 0) return 'low';
  const topScore = search.results[0]?.score ?? 0;
  if (topScore >= 40) return 'high';
  if (topScore >= 20) return 'medium';
  return 'low';
}

function stringOrDefault(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}
