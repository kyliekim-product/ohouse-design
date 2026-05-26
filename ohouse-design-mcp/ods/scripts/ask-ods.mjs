#!/usr/bin/env node

import process from 'node:process';
import { answerQuestion } from './lib/answer-ods-question.mjs';
import { loadLlmClient } from './lib/llm/load-llm-client.mjs';

const args = parseArgs(process.argv.slice(2));

if (!args.query) {
  printUsage();
  process.exit(1);
}

const llm = await loadLlmClient({
  provider: args.provider,
  modulePath: args.llmModulePath,
});

const result = await answerQuestion(args.query, {
  indexPath: args.indexPath,
  topK: args.topK,
  llm,
});

if (args.json) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  printTextResult(result);
}

function parseArgs(argv) {
  const parsed = {
    json: false,
    topK: 8,
    queryParts: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--json') {
      parsed.json = true;
      continue;
    }

    if (arg === '--top' || arg === '-k') {
      parsed.topK = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg === '--index') {
      parsed.indexPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--provider') {
      parsed.provider = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--llm') {
      parsed.llmModulePath = argv[i + 1];
      i += 1;
      continue;
    }

    parsed.queryParts.push(arg);
  }

  parsed.query = parsed.queryParts.join(' ').trim();
  return parsed;
}

function printTextResult(result) {
  console.log(`provider: ${result.provider}`);
  console.log(`query: ${result.question}`);
  console.log(`tokens: ${result.retrieval.tokens.join(', ') || '(none)'}`);
  console.log(`intent: ${result.retrieval.intent}`);
  console.log('');
  console.log(result.answer);
  console.log('');
  console.log('Citations:');

  for (const citation of result.citations) {
    console.log(`- [${citation.id}] ${citation.source_path} > ${citation.heading_path.join(' > ')}`);
    console.log(`  hash: ${citation.content_hash}`);
  }
}

function printUsage() {
  console.error('Usage: npm run ask -- "Switch는 언제 써?"');
  console.error('Options: --top 8, -k 8, --json, --provider fake, --llm ./provider.mjs, --index build/public-index/index.json');
}
