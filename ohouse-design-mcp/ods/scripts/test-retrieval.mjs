#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { loadPublicIndex } from './lib/load-public-index.mjs';
import { searchPublicIndex } from './lib/search-public-index.mjs';
import { itemMatchesKnowledgeArea } from './lib/knowledge-area.mjs';

const DEFAULT_FIXTURE_PATH = 'scripts/fixtures/retrieval-eval.json';

const args = parseArgs(process.argv.slice(2));
const fixturePath = path.resolve(process.cwd(), args.fixturePath ?? DEFAULT_FIXTURE_PATH);
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
const { index } = loadPublicIndex({ indexPath: args.indexPath });

let failures = 0;

for (const testCase of fixture.cases ?? []) {
  const topK = Number(testCase.topK ?? args.topK ?? 5);
  const search = searchPublicIndex(index, testCase.question, { topK });
  const missing = [];
  const expectedAreas = testCase.expected_areas ?? testCase.expectedAreas ?? [];

  for (const area of expectedAreas) {
    const match = search.results.find((result) => itemMatchesKnowledgeArea(result.item, area));
    if (!match) {
      missing.push({ area });
    }
  }

  for (const expected of expectedAreas.length > 0 ? [] : testCase.expected ?? []) {
    const match = search.results.find((result) => matchesExpected(result.item, expected));
    if (!match) {
      missing.push(expected);
    }
  }

  if (missing.length === 0) {
    console.log(`PASS ${testCase.id}`);
    continue;
  }

  failures += 1;
  console.error(`FAIL ${testCase.id}`);
  console.error(`  question: ${testCase.question}`);
  console.error(`  missing: ${missing.map(formatExpected).join('; ')}`);
  console.error('  top results:');
  for (const [index, result] of search.results.entries()) {
    console.error(`    ${index + 1}. ${result.item.source_path} > ${result.item.heading_path.join(' > ')} (${result.score})`);
  }
}

if (failures > 0) {
  console.error(`\nretrieval tests failed: ${failures}`);
  process.exit(1);
}

console.log(`\nretrieval tests passed: ${fixture.cases?.length ?? 0}`);

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--fixture') {
      parsed.fixturePath = argv[i + 1];
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
    }
  }

  return parsed;
}

function matchesExpected(item, expected) {
  return item.source_path === expected.source_path
    && arraysEqual(item.heading_path, expected.heading_path);
}

function arraysEqual(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function formatExpected(expected) {
  if (expected.area) return `area:${expected.area}`;
  return `${expected.source_path} > ${expected.heading_path.join(' > ')}`;
}
