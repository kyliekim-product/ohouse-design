#!/usr/bin/env node

import { createReadStream, createWriteStream, mkdirSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';
import { loadPublicIndex } from './lib/load-public-index.mjs';
import { inferKnowledgeArea } from './lib/knowledge-area.mjs';
import { relationKindBetween, relationsMapFromIndex } from './lib/knowledge-relations.mjs';
import { searchPublicIndex } from './lib/search-public-index.mjs';

const DEFAULT_INPUT_PATH = 'scripts/fixtures/retrieval-field-test.jsonl';
const DEFAULT_OUT_DIR = 'build/retrieval-field-test';
const DEFAULT_TOP_K = 8;
const REVIEW_SAMPLE_LIMIT = 50;
const COMPOSITION_SIGNALS = new Set([
  '조합',
  '구성',
  '순서',
  '같이',
  '함께',
  '안에',
  '넣',
  '넣는',
  '전파',
  '확장',
  '패턴',
  'wrapper',
  'composition',
  'compose',
  'order',
]);

const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function main() {
  const inputPath = path.resolve(process.cwd(), args.inputPath ?? DEFAULT_INPUT_PATH);
  const outDir = path.resolve(process.cwd(), args.outDir ?? DEFAULT_OUT_DIR);
  const topK = Number(args.topK ?? DEFAULT_TOP_K);
  const { index, indexPath } = loadPublicIndex({ indexPath: args.indexPath });
  const areaRelations = relationsMapFromIndex(index);

  mkdirSync(outDir, { recursive: true });

  const resultPath = path.join(outDir, 'results.jsonl');
  const summaryJsonPath = path.join(outDir, 'summary.json');
  const summaryMarkdownPath = path.join(outDir, 'summary.md');
  const failuresCsvPath = path.join(outDir, 'failures.csv');
  const resultWriter = createWriteStream(resultPath, { encoding: 'utf8' });
  const accumulator = createAccumulator({ inputPath, indexPath, topK });
  const reviewRows = [];

  for await (const entry of readJsonl(inputPath)) {
    const result = entry.error
      ? invalidResult(entry.lineNumber, entry.error, entry.raw)
      : runCase(entry.lineNumber, entry.row, index, areaRelations, topK);

    await writeJsonLine(resultWriter, result);
    updateAccumulator(accumulator, result);

    if (result.review_needed || result.needs_human_review) {
      reviewRows.push(reviewRow(result));
    }
  }

  await new Promise((resolve, reject) => {
    resultWriter.end(resolve);
    resultWriter.on('error', reject);
  });

  const summary = finalizeSummary(accumulator, reviewRows);
  writeFileSync(summaryJsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  writeFileSync(summaryMarkdownPath, renderSummaryMarkdown(summary), 'utf8');
  writeFileSync(failuresCsvPath, renderCsv(reviewRows), 'utf8');

  console.log('Retrieval field test complete');
  console.log(`cases=${summary.valid_cases} labeled=${summary.labeled_cases} unlabeled=${summary.unlabeled_cases} invalid=${summary.invalid_rows}`);
  console.log(`reviewNeeded=${summary.review_needed_cases} humanReview=${summary.human_review_cases} noResults=${summary.no_result_cases}`);
  console.log(`summary=${relative(summaryMarkdownPath)}`);
  console.log(`failures=${relative(failuresCsvPath)}`);
}

async function* readJsonl(inputPath) {
  const stream = createReadStream(inputPath, { encoding: 'utf8' });
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let lineNumber = 0;

  for await (const line of lines) {
    lineNumber += 1;
    if (!line.trim()) continue;

    try {
      yield { lineNumber, row: JSON.parse(line) };
    } catch (error) {
      yield {
        lineNumber,
        raw: line,
        error: `Invalid JSON: ${error.message}`,
      };
    }
  }
}

function runCase(lineNumber, row, index, areaRelations, defaultTopK) {
  const parsed = parseCase(lineNumber, row, defaultTopK);
  if (parsed.error) return parsed.error;

  const search = searchPublicIndex(index, parsed.query, { topK: parsed.topK });
  const topResults = search.results.map((result, index) => topResult(result, index));
  const expectedAreas = [
    parsed.expectedPrimaryArea,
    ...parsed.expectedSecondaryAreas,
  ].filter(Boolean);
  const primaryRank = parsed.expectedPrimaryArea
    ? rankOfArea(topResults, parsed.expectedPrimaryArea)
    : null;
  const matchedPrimary = parsed.expectedPrimaryArea ? primaryRank !== null : null;
  const matchedAnyExpected = expectedAreas.length > 0
    ? topResults.some((result) => expectedAreas.includes(result.inferred_area))
    : null;
  const noResults = topResults.length === 0;
  const topArea = topResults[0]?.inferred_area ?? null;
  const reviewReason = reviewReasonFor({
    family: parsed.family,
    expectedAnswerability: parsed.expectedAnswerability,
    expectedPrimaryArea: parsed.expectedPrimaryArea,
    noResults,
    primaryRank,
  });
  const triage = triageResult({
    query: parsed.query,
    family: parsed.family,
    expectedPrimaryArea: parsed.expectedPrimaryArea,
    expectedSecondaryAreas: parsed.expectedSecondaryAreas,
    expectedAnswerability: parsed.expectedAnswerability,
    tokens: search.tokens,
    topResults,
    topArea,
    noResults,
    primaryRank,
    reviewReason,
    areaRelations,
  });

  return {
    line_number: lineNumber,
    id: parsed.id,
    query: parsed.query,
    family: parsed.family,
    source: parsed.source,
    expected_primary_area: parsed.expectedPrimaryArea,
    expected_secondary_areas: parsed.expectedSecondaryAreas,
    expected_answerability: parsed.expectedAnswerability,
    answerability_reason: parsed.answerabilityReason,
    tokens: search.tokens,
    intent: search.intent,
    top_k: parsed.topK,
    top_area: topArea,
    top_results: topResults,
    matched_primary: matchedPrimary,
    primary_rank: primaryRank,
    matched_any_expected: matchedAnyExpected,
    no_results: noResults,
    review_needed: Boolean(reviewReason),
    review_reason: reviewReason,
    predicted_primary_area: triage.predictedPrimaryArea,
    auto_bucket: triage.autoBucket,
    confidence: triage.confidence,
    triage_evidence: triage.evidence,
    triage_summary: triage.summary,
    needs_human_review: triage.needsHumanReview,
    notes: parsed.notes,
  };
}

function parseCase(lineNumber, row, defaultTopK) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return { error: invalidResult(lineNumber, 'Row must be a JSON object', row) };
  }

  const errors = [];
  const id = stringValue(row.id);
  const query = stringValue(row.query);
  const family = stringValue(row.family) ?? 'unclassified';
  const source = sourceValue(row.source);
  const expectedPrimaryArea = stringValue(row.expected_primary_area);
  const expectedSecondaryAreas = stringArrayValue(row.expected_secondary_areas, 'expected_secondary_areas', errors);
  const expectedAnswerability = stringValue(row.expected_answerability);
  const answerabilityReason = stringValue(row.answerability_reason);
  const notes = stringValue(row.notes);
  const topK = Number(row.topK ?? row.top_k ?? defaultTopK);

  if (!id) errors.push('id must be a non-empty string');
  if (!query) errors.push('query must be a non-empty string');
  if (!Number.isInteger(topK) || topK <= 0) errors.push('topK must be a positive integer');

  if (errors.length > 0) {
    return {
      error: invalidResult(lineNumber, errors.join('; '), row, {
        id,
        query,
        family,
        source,
        expectedPrimaryArea,
        expectedSecondaryAreas,
        expectedAnswerability,
        answerabilityReason,
        notes,
      }),
    };
  }

  return {
    id,
    query,
    family,
    source,
    expectedPrimaryArea,
    expectedSecondaryAreas,
    expectedAnswerability,
    answerabilityReason,
    notes,
    topK,
  };
}

function invalidResult(lineNumber, message, raw, partial = {}) {
  return {
    line_number: lineNumber,
    id: partial.id ?? `line-${lineNumber}`,
    query: partial.query ?? '',
    family: partial.family ?? 'invalid-row',
    source: partial.source ?? 'unknown',
    expected_primary_area: partial.expectedPrimaryArea ?? null,
    expected_secondary_areas: partial.expectedSecondaryAreas ?? [],
    expected_answerability: partial.expectedAnswerability ?? null,
    answerability_reason: partial.answerabilityReason ?? null,
    tokens: [],
    intent: null,
    top_k: null,
    top_area: null,
    top_results: [],
    matched_primary: null,
    primary_rank: null,
    matched_any_expected: null,
    no_results: true,
    review_needed: true,
    review_reason: 'invalid-row',
    predicted_primary_area: null,
    auto_bucket: 'invalid-row',
    confidence: 'high',
    triage_evidence: ['error=invalid-row'],
    triage_summary: 'Invalid fixture row.',
    needs_human_review: true,
    notes: partial.notes ?? null,
    error: message,
    raw,
  };
}

function topResult(result, index) {
  const item = result.item;
  return {
    rank: index + 1,
    score: result.score,
    title: item.title,
    source_path: item.source_path,
    heading_path: item.heading_path,
    document_kind: item.document_kind,
    inferred_area: inferKnowledgeArea(item.source_path),
    relations: item.relations ?? {},
    match_reasons: result.matches.map(formatMatchReason),
    matches: result.matches,
  };
}

function rankOfArea(results, area) {
  const match = results.find((result) => result.inferred_area === area);
  return match ? match.rank : null;
}

function reviewReasonFor({ family, expectedAnswerability, expectedPrimaryArea, noResults, primaryRank }) {
  if (expectedAnswerability === 'not_answerable_from_public_index' && !noResults) {
    return 'not-answerable-returned-results';
  }

  if (!expectedPrimaryArea && family === 'out-of-scope-live-state' && !noResults) {
    return 'not-answerable-returned-results';
  }

  if (!expectedPrimaryArea) return noResults ? 'unlabeled-no-results' : null;
  if (noResults) return 'no-results';
  if (primaryRank === null) return 'expected-primary-not-found';
  if (primaryRank !== 1) return 'expected-primary-not-top-result';
  return null;
}

function createAccumulator({ inputPath, indexPath, topK }) {
  return {
    generated_at: new Date().toISOString(),
    input_path: relative(inputPath),
    index_path: relative(indexPath),
    default_top_k: topK,
    total_rows: 0,
    valid_cases: 0,
    invalid_rows: 0,
    labeled_cases: 0,
    unlabeled_cases: 0,
    no_result_cases: 0,
    review_needed_cases: 0,
    family: new Map(),
    source: new Map(),
    expected_answerability: new Map(),
    answerability_reason: new Map(),
    expected_area: new Map(),
    primary_rank_distribution: new Map(),
    top_missed_expected_areas: new Map(),
    confusion_pairs: new Map(),
    unlabeled_top_area_distribution: new Map(),
    auto_bucket: new Map(),
    confidence: new Map(),
    human_review: new Map(),
    human_review_cases: 0,
  };
}

function updateAccumulator(accumulator, result) {
  accumulator.total_rows += 1;
  if (result.error) {
    accumulator.invalid_rows += 1;
    if (result.review_needed) accumulator.review_needed_cases += 1;
    if (result.needs_human_review) accumulator.human_review_cases += 1;
    updateTriageStats(accumulator, result);
    return;
  }

  accumulator.valid_cases += 1;

  const labeled = Boolean(result.expected_primary_area);
  if (labeled) accumulator.labeled_cases += 1;
  else accumulator.unlabeled_cases += 1;

  if (result.no_results) accumulator.no_result_cases += 1;
  if (result.review_needed) accumulator.review_needed_cases += 1;
  if (result.needs_human_review) accumulator.human_review_cases += 1;

  updateFamilyStats(accumulator, result, labeled);
  updateSourceStats(accumulator, result, labeled);
  updateExpectedAnswerabilityStats(accumulator, result, labeled);
  updateExpectedAreaStats(accumulator, result, labeled);
  updateDistributions(accumulator, result, labeled);
  updateTriageStats(accumulator, result);
}

function updateFamilyStats(accumulator, result, labeled) {
  const stats = ensureStats(accumulator.family, result.family);
  stats.count += 1;
  stats.no_results += result.no_results ? 1 : 0;
  stats.review_needed += result.review_needed ? 1 : 0;

  if (labeled) {
    stats.labeled += 1;
    stats.matched_primary += result.matched_primary ? 1 : 0;
    stats.top1_primary_matches += result.primary_rank === 1 ? 1 : 0;
  } else {
    stats.unlabeled += 1;
  }
}

function updateSourceStats(accumulator, result, labeled) {
  const stats = ensureStats(accumulator.source, result.source);
  stats.count += 1;
  stats.no_results += result.no_results ? 1 : 0;
  stats.review_needed += result.review_needed ? 1 : 0;

  if (labeled) {
    stats.labeled += 1;
    stats.matched_primary += result.matched_primary ? 1 : 0;
    stats.top1_primary_matches += result.primary_rank === 1 ? 1 : 0;
  } else {
    stats.unlabeled += 1;
  }
}

function updateExpectedAnswerabilityStats(accumulator, result, labeled) {
  const answerability = result.expected_answerability ?? '(unspecified)';
  const stats = ensureStats(accumulator.expected_answerability, answerability);
  stats.count += 1;
  stats.no_results += result.no_results ? 1 : 0;
  stats.review_needed += result.review_needed ? 1 : 0;

  if (labeled) {
    stats.labeled += 1;
    stats.matched_primary += result.matched_primary ? 1 : 0;
    stats.top1_primary_matches += result.primary_rank === 1 ? 1 : 0;
  } else {
    stats.unlabeled += 1;
  }

  if (result.answerability_reason) {
    increment(accumulator.answerability_reason, result.answerability_reason);
  }
}

function updateExpectedAreaStats(accumulator, result, labeled) {
  if (!labeled) return;

  const stats = ensureStats(accumulator.expected_area, result.expected_primary_area);
  stats.count += 1;
  stats.labeled += 1;
  stats.no_results += result.no_results ? 1 : 0;
  stats.review_needed += result.review_needed ? 1 : 0;
  stats.matched_primary += result.matched_primary ? 1 : 0;
  stats.top1_primary_matches += result.primary_rank === 1 ? 1 : 0;
}

function updateDistributions(accumulator, result, labeled) {
  if (labeled) {
    increment(accumulator.primary_rank_distribution, result.primary_rank === null ? 'not_found' : String(result.primary_rank));

    if (!result.matched_primary) {
      increment(accumulator.top_missed_expected_areas, result.expected_primary_area);
    }

    if (result.top_area !== result.expected_primary_area) {
      const topArea = result.top_area ?? 'no_results';
      increment(accumulator.confusion_pairs, `${result.expected_primary_area} -> ${topArea}`);
    }

    return;
  }

  increment(accumulator.unlabeled_top_area_distribution, result.top_area ?? 'no_results');
}

function updateTriageStats(accumulator, result) {
  increment(accumulator.auto_bucket, result.auto_bucket ?? 'unknown');
  increment(accumulator.confidence, result.confidence ?? 'unknown');
  increment(accumulator.human_review, result.needs_human_review ? 'true' : 'false');
}

function ensureStats(map, key) {
  if (!map.has(key)) {
    map.set(key, {
      count: 0,
      labeled: 0,
      unlabeled: 0,
      no_results: 0,
      matched_primary: 0,
      top1_primary_matches: 0,
      review_needed: 0,
    });
  }
  return map.get(key);
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

async function writeJsonLine(writer, result) {
  if (writer.write(`${JSON.stringify(result)}\n`)) return;
  await once(writer, 'drain');
}

function finalizeSummary(accumulator, reviewRows) {
  return {
    generated_at: accumulator.generated_at,
    input_path: accumulator.input_path,
    index_path: accumulator.index_path,
    default_top_k: accumulator.default_top_k,
    total_rows: accumulator.total_rows,
    valid_cases: accumulator.valid_cases,
    invalid_rows: accumulator.invalid_rows,
    labeled_cases: accumulator.labeled_cases,
    unlabeled_cases: accumulator.unlabeled_cases,
    no_result_cases: accumulator.no_result_cases,
    review_needed_cases: accumulator.review_needed_cases,
    human_review_cases: accumulator.human_review_cases,
    family_counts: statsEntries(accumulator.family, 'family'),
    source_counts: statsEntries(accumulator.source, 'source'),
    expected_answerability_counts: statsEntries(accumulator.expected_answerability, 'expected_answerability'),
    answerability_reason_distribution: countEntries(accumulator.answerability_reason, 'answerability_reason'),
    expected_area_counts: statsEntries(accumulator.expected_area, 'expected_area'),
    primary_rank_distribution: countEntries(accumulator.primary_rank_distribution, 'rank'),
    top_missed_expected_areas: countEntries(accumulator.top_missed_expected_areas, 'expected_area'),
    confusion_pairs: confusionEntries(accumulator.confusion_pairs),
    unlabeled_top_area_distribution: countEntries(accumulator.unlabeled_top_area_distribution, 'top_area'),
    auto_bucket_distribution: countEntries(accumulator.auto_bucket, 'auto_bucket'),
    confidence_distribution: countEntries(accumulator.confidence, 'confidence'),
    human_review_distribution: countEntries(accumulator.human_review, 'needs_human_review'),
    review_needed_sample: reviewRows.slice(0, REVIEW_SAMPLE_LIMIT),
  };
}

function statsEntries(map, keyName) {
  return [...map.entries()]
    .map(([key, value]) => ({
      [keyName]: key,
      ...value,
      primary_match_rate: rate(value.matched_primary, value.labeled),
      top1_primary_match_rate: rate(value.top1_primary_matches, value.labeled),
      no_result_rate: rate(value.no_results, value.count),
      review_needed_rate: rate(value.review_needed, value.count),
    }))
    .sort((a, b) => b.count - a.count || String(a[keyName]).localeCompare(String(b[keyName])));
}

function countEntries(map, keyName) {
  return [...map.entries()]
    .map(([key, count]) => ({ [keyName]: key, count }))
    .sort((a, b) => b.count - a.count || String(a[keyName]).localeCompare(String(b[keyName])));
}

function confusionEntries(map) {
  return [...map.entries()]
    .map(([key, count]) => {
      const [expectedArea, topArea] = key.split(' -> ');
      return { expected_area: expectedArea, top_area: topArea, count };
    })
    .sort((a, b) => b.count - a.count || a.expected_area.localeCompare(b.expected_area) || a.top_area.localeCompare(b.top_area));
}

function reviewRow(result) {
  const top = result.top_results[0];
  return {
    id: result.id,
    query: result.query,
    family: result.family,
    source: result.source,
    expected_primary_area: result.expected_primary_area ?? '',
    expected_answerability: result.expected_answerability ?? '',
    answerability_reason: result.answerability_reason ?? '',
    primary_rank: result.primary_rank ?? '',
    top_area: result.top_area ?? '',
    top_source_path: top?.source_path ?? '',
    top_heading_path: top?.heading_path?.join(' > ') ?? '',
    no_results: result.no_results,
    review_reason: result.review_reason ?? '',
    predicted_primary_area: result.predicted_primary_area ?? '',
    auto_bucket: result.auto_bucket ?? '',
    confidence: result.confidence ?? '',
    triage_evidence: result.triage_evidence?.join('; ') ?? '',
    triage_summary: result.triage_summary ?? '',
    needs_human_review: result.needs_human_review,
    error: result.error ?? '',
    notes: result.notes ?? '',
  };
}

function renderSummaryMarkdown(summary) {
  const lines = [
    '# Hermes Retrieval Field Test Summary',
    '',
    `- Generated: ${summary.generated_at}`,
    `- Input: \`${summary.input_path}\``,
    `- Index: \`${summary.index_path}\``,
    `- Default topK: ${summary.default_top_k}`,
    '',
    '## Overview',
    '',
    renderTable(
      ['Metric', 'Value'],
      [
        ['Total rows', summary.total_rows],
        ['Valid cases', summary.valid_cases],
        ['Invalid rows', summary.invalid_rows],
        ['Labeled cases', summary.labeled_cases],
        ['Unlabeled cases', summary.unlabeled_cases],
        ['No-result cases', summary.no_result_cases],
        ['Review-needed cases', summary.review_needed_cases],
        ['Human-review cases', summary.human_review_cases],
      ],
    ),
    '',
    '## By Family',
    '',
    renderStatsTable(summary.family_counts, 'family'),
    '',
    '## By Source',
    '',
    renderStatsTable(summary.source_counts, 'source'),
    '',
    '## By Expected Answerability',
    '',
    renderStatsTable(summary.expected_answerability_counts, 'expected_answerability'),
    '',
    '## By Answerability Reason',
    '',
    renderCountTable(summary.answerability_reason_distribution, 'Answerability reason'),
    '',
    '## By Expected Area',
    '',
    renderStatsTable(summary.expected_area_counts, 'expected_area'),
    '',
    '## Primary Rank Distribution',
    '',
    renderCountTable(summary.primary_rank_distribution, 'Rank'),
    '',
    '## Top Missed Expected Areas',
    '',
    renderCountTable(summary.top_missed_expected_areas, 'Expected area'),
    '',
    '## Confusion Pairs',
    '',
    renderTable(
      ['Expected area', 'Top returned area', 'Count'],
      summary.confusion_pairs.map((entry) => [entry.expected_area, entry.top_area, entry.count]),
    ),
    '',
    '## Unlabeled Top Area Distribution',
    '',
    renderCountTable(summary.unlabeled_top_area_distribution, 'Top area'),
    '',
    '## By Auto Bucket',
    '',
    renderCountTable(summary.auto_bucket_distribution, 'Auto bucket'),
    '',
    '## By Confidence',
    '',
    renderCountTable(summary.confidence_distribution, 'Confidence'),
    '',
    '## By Human Review',
    '',
    renderCountTable(summary.human_review_distribution, 'Needs human review'),
    '',
    '## Review Needed Sample',
    '',
    renderTable(
      ['ID', 'Family', 'Expected', 'Answerability', 'Top area', 'Bucket', 'Confidence', 'Human review', 'Reason'],
      summary.review_needed_sample.map((row) => [
        row.id,
        row.family,
        row.expected_primary_area || '(unlabeled)',
        row.expected_answerability || '(unspecified)',
        row.top_area || '(none)',
        row.auto_bucket || '(none)',
        row.confidence || '(none)',
        row.needs_human_review,
        row.review_reason,
      ]),
    ),
    '',
  ];

  return `${lines.join('\n')}\n`;
}

function renderStatsTable(rows, firstColumn) {
  return renderTable(
    [titleize(firstColumn), 'Count', 'Labeled', 'Unlabeled', 'Primary match', 'Top-1 match', 'No result', 'Review needed'],
    rows.map((row) => [
      row[firstColumn],
      row.count,
      row.labeled,
      row.unlabeled,
      percent(row.primary_match_rate),
      percent(row.top1_primary_match_rate),
      percent(row.no_result_rate),
      percent(row.review_needed_rate),
    ]),
  );
}

function renderCountTable(rows, label) {
  return renderTable([label, 'Count'], rows.map((row) => [row[Object.keys(row)[0]], row.count]));
}

function renderTable(headers, rows) {
  if (rows.length === 0) return '_No rows._';

  const headerLine = `| ${headers.map(escapeMarkdownCell).join(' | ')} |`;
  const dividerLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const rowLines = rows.map((row) => `| ${row.map(escapeMarkdownCell).join(' | ')} |`);

  return [headerLine, dividerLine, ...rowLines].join('\n');
}

function renderCsv(rows) {
  const headers = [
    'id',
    'query',
    'family',
    'source',
    'expected_primary_area',
    'expected_answerability',
    'answerability_reason',
    'primary_rank',
    'top_area',
    'top_source_path',
    'top_heading_path',
    'no_results',
    'review_reason',
    'predicted_primary_area',
    'auto_bucket',
    'confidence',
    'triage_evidence',
    'triage_summary',
    'needs_human_review',
    'error',
    'notes',
  ];
  const lines = [headers.join(',')];

  for (const row of rows) {
    lines.push(headers.map((header) => csvCell(row[header])).join(','));
  }

  return `${lines.join('\n')}\n`;
}

function triageResult({
  query,
  family,
  expectedPrimaryArea,
  expectedSecondaryAreas,
  expectedAnswerability,
  tokens,
  topResults,
  topArea,
  noResults,
  primaryRank,
  reviewReason,
  areaRelations,
}) {
  const querySignals = detectQuerySignals(query, tokens);
  const relationToExpected = expectedPrimaryArea && topArea
    ? relationKindBetween(topArea, expectedPrimaryArea, areaRelations)
    : null;
  const predictedPrimaryArea = predictPrimaryArea({
    topArea,
    topResults,
    querySignals,
    areaRelations,
    expectedAnswerability,
    noResults,
  });
  const evidence = [];

  if (topArea) evidence.push(`top_area=${topArea}`);
  if (expectedPrimaryArea) evidence.push(`expected_area=${expectedPrimaryArea}`);
  if (predictedPrimaryArea) evidence.push(`predicted_primary_area=${predictedPrimaryArea}`);
  if (reviewReason) evidence.push(`review_reason=${reviewReason}`);
  if (relationToExpected) evidence.push(`relation=${relationToExpected}`);
  for (const signal of querySignals) evidence.push(`query_signal=${signal}`);

  if (expectedAnswerability === 'not_answerable_from_public_index' || family === 'out-of-scope-live-state') {
    const hasReturnedResults = !noResults;
    return {
      predictedPrimaryArea,
      autoBucket: hasReturnedResults ? 'scope-policy' : 'scope-policy-no-results',
      confidence: 'high',
      evidence: [
        ...evidence,
        `expected_answerability=${expectedAnswerability ?? '(unspecified)'}`,
        `family=${family}`,
      ],
      summary: hasReturnedResults
        ? 'Question is marked as outside the current public index scope, but Search Core returned document evidence.'
        : 'Question is marked as outside the current public index scope and returned no results.',
      needsHumanReview: false,
    };
  }

  if (noResults) {
    return {
      predictedPrimaryArea,
      autoBucket: expectedPrimaryArea ? 'no-results' : 'unlabeled-no-results',
      confidence: expectedPrimaryArea ? 'high' : 'medium',
      evidence,
      summary: expectedPrimaryArea
        ? 'Expected area is labeled, but Search Core returned no results.'
        : 'Unlabeled query returned no results.',
      needsHumanReview: true,
    };
  }

  if (!expectedPrimaryArea) {
    return {
      predictedPrimaryArea,
      autoBucket: predictedPrimaryArea ? 'unlabeled-observation' : 'unknown',
      confidence: predictedPrimaryArea ? 'medium' : 'low',
      evidence,
      summary: predictedPrimaryArea
        ? `Unlabeled query candidate primary area is ${predictedPrimaryArea}.`
        : 'Unlabeled query has no confident primary area candidate.',
      needsHumanReview: !predictedPrimaryArea,
    };
  }

  if (primaryRank === 1) {
    return {
      predictedPrimaryArea,
      autoBucket: 'matched-primary',
      confidence: 'high',
      evidence,
      summary: 'Expected primary area is the top result.',
      needsHumanReview: false,
    };
  }

  if (relationToExpected === 'subcomponent-to-pattern' || relationToExpected === 'pattern-to-subcomponent') {
    return {
      predictedPrimaryArea,
      autoBucket: 'pattern-subcomponent-routing',
      confidence: querySignals.length > 0 ? 'high' : 'medium',
      evidence,
      summary: `Top result and expected area are related through pattern/sub-component metadata (${relationToExpected}).`,
      needsHumanReview: querySignals.length === 0,
    };
  }

  if (relationToExpected === 'child-to-parent' || relationToExpected === 'parent-to-child') {
    return {
      predictedPrimaryArea,
      autoBucket: 'parent-child-routing',
      confidence: querySignals.length > 0 ? 'high' : 'medium',
      evidence,
      summary: `Top result and expected area are related through parent/child metadata (${relationToExpected}).`,
      needsHumanReview: querySignals.length === 0,
    };
  }

  if (relationToExpected === 'wrapped-by-wrapper' || relationToExpected === 'wrapper-to-wrapped') {
    return {
      predictedPrimaryArea,
      autoBucket: 'wrapper-composition-routing',
      confidence: querySignals.length > 0 ? 'high' : 'medium',
      evidence,
      summary: `Top result and expected area are related through wrapper metadata (${relationToExpected}).`,
      needsHumanReview: querySignals.length === 0,
    };
  }

  if (expectedSecondaryAreas?.includes(topArea)) {
    return {
      predictedPrimaryArea,
      autoBucket: 'secondary-beat-primary',
      confidence: 'medium',
      evidence,
      summary: 'A secondary expected area ranked above the primary expected area.',
      needsHumanReview: true,
    };
  }

  if (primaryRank && primaryRank > 1) {
    return {
      predictedPrimaryArea,
      autoBucket: 'expected-primary-not-top',
      confidence: 'medium',
      evidence,
      summary: 'Expected primary area was found, but it was not the top result.',
      needsHumanReview: true,
    };
  }

  return {
    predictedPrimaryArea,
    autoBucket: reviewReason ? 'metadata-gap-candidate' : 'unknown',
    confidence: 'low',
    evidence,
    summary: reviewReason
      ? 'Expected area was not found and no known relation explains the top result.'
      : 'Runner could not classify this retrieval outcome.',
    needsHumanReview: true,
  };
}

function predictPrimaryArea({ topArea, topResults, querySignals, areaRelations, expectedAnswerability, noResults }) {
  if (expectedAnswerability === 'not_answerable_from_public_index' || noResults) return null;
  if (!topArea) return null;

  const compositionLike = querySignals.some((signal) => signal.startsWith('composition:'));
  if (!compositionLike) return topArea;

  const topRelations = areaRelations.get(topArea) ?? {};
  const relatedPattern = topRelations.related_pattern_areas?.[0];
  if (relatedPattern) return relatedPattern;

  const wrapperArea = [...areaRelations.entries()]
    .find(([, relations]) => relations.wrapper_for_areas?.includes(topArea))?.[0];
  if (wrapperArea) return wrapperArea;

  if (topRelations.parent_area) return topRelations.parent_area;

  const patternResult = topResults.find((result) => result.inferred_area?.startsWith('pattern:'));
  return patternResult?.inferred_area ?? topArea;
}

function detectQuerySignals(query, tokens) {
  const normalizedQuery = normalizeForSignal(query);
  const normalizedTokens = new Set(tokens.map(normalizeForSignal).filter(Boolean));
  const signals = [];

  for (const signal of COMPOSITION_SIGNALS) {
    if (normalizedTokens.has(signal) || normalizedQuery.includes(signal)) {
      signals.push(`composition:${signal}`);
    }
  }

  return [...new Set(signals)];
}

function normalizeForSignal(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[`*_~()[\]{}<>"“”‘’:;,.!?|\\+=]/g, ' ')
    .replace(/[-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMatchReason(match) {
  const flags = [
    match.phrase ? 'phrase' : null,
    match.intent ? 'intent' : null,
    match.exact ? 'exact' : null,
  ].filter(Boolean);
  const suffix = flags.length > 0 ? ` ${flags.join('+')}` : '';
  return `${match.field}[${match.tokens.join(', ')}]+${match.score}${suffix}`;
}

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--input') {
      parsed.inputPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--out') {
      parsed.outDir = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--index') {
      parsed.indexPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--top' || arg === '-k') {
      parsed.topK = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
  }

  return parsed;
}

function stringValue(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function sourceValue(value) {
  if (value === undefined || value === null) return 'unknown';
  if (typeof value === 'string') return stringValue(value) ?? 'unknown';
  return JSON.stringify(value);
}

function stringArrayValue(value, field, errors) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array of strings`);
    return [];
  }

  const strings = [];
  for (const item of value) {
    if (typeof item !== 'string' || item.trim() === '') {
      errors.push(`${field} must be an array of non-empty strings`);
      return [];
    }
    strings.push(item.trim());
  }
  return strings;
}

function rate(numerator, denominator) {
  if (!denominator) return null;
  return Number((numerator / denominator).toFixed(4));
}

function percent(value) {
  if (value === null || value === undefined) return 'n/a';
  return `${(value * 100).toFixed(1)}%`;
}

function escapeMarkdownCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, '<br>');
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) return csvCell(`'${text}`);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function titleize(value) {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function relative(filePath) {
  return path.relative(process.cwd(), filePath) || '.';
}

function printUsage() {
  console.error('Usage: node scripts/run-retrieval-field-test.mjs --input scripts/fixtures/retrieval-field-test.jsonl --out build/retrieval-field-test');
  console.error('Options: --index build/public-index/index.json, --top 8, -k 8');
}
