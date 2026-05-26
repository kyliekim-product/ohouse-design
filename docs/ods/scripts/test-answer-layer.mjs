#!/usr/bin/env node

import { existsSync } from 'node:fs';
import process from 'node:process';
import { answerQuestion, retrieveEvidence } from './lib/answer-ods-question.mjs';
import { loadPublicIndex } from './lib/load-public-index.mjs';

const { index } = loadPublicIndex();

const checks = [
  async function retrieveReturnsEvidence() {
    const result = retrieveEvidence('Dialog 서브텍스트는 언제 써?', { index });
    assert(result.answerability.status === 'answerable', 'expected answerable retrieval');
    assert(result.evidence.length > 0, 'expected evidence');
    assert(result.evidence[0].citation.source_path.includes('dialog'), 'expected Dialog evidence');
    assert(result.index_version.source_commit, 'expected index version source commit');
  },
  async function retrieveSuppressesOperationalLiveStateEvidence() {
    const result = retrieveEvidence('Button 지금 Figma에 최신 반영됐어?', { index });
    assert(result.answerability.status === 'not_answerable_from_public_index', 'expected public-index no-answer');
    assert(result.answerability.reason === 'operational_source_not_indexed', 'expected operational source reason');
    assert(result.evidence.length === 0, 'not-answerable retrieval must not expose citation evidence as answer material');
  },
  async function answerSkipsProviderForNoAnswer() {
    const result = await answerQuestion('Jira DS-672 Spinner 승인됐어?', {
      index,
      llm: {
        provider: 'throwing-test-provider',
        async generate() {
          throw new Error('provider should not be called for no-answer');
        },
      },
    });
    assert(result.answerability.status === 'not_answerable_from_public_index', 'expected no-answer status');
    assert(result.provider === null, 'expected no provider for no-answer');
    assert(result.citations.length === 0, 'expected no citations for no-answer');
  },
];

for (const check of checks) {
  await check();
  console.log(`PASS ${check.name}`);
}

assert(existsSync('build/public-index/index.json'), 'public index should exist after build');
console.log(`\nanswer layer tests passed: ${checks.length}`);

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL ${message}`);
    process.exit(1);
  }
}
