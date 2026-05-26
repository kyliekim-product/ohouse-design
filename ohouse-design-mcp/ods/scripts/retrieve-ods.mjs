#!/usr/bin/env node

import process from 'node:process';
import { retrieveOdsEvidence, logRetrieveUsage } from './lib/hermes-retrieve.mjs';

const args = parseArgs(process.argv.slice(2));

if (!args.query) {
  printUsage();
  process.exit(1);
}

const result = retrieveOdsEvidence(args.query, {
  indexPath: args.indexPath,
  topK: args.topK,
});

if (args.log) {
  logRetrieveUsage(result, {
    surface: args.surface ?? 'cli',
    tool: 'retrieve_ods_evidence',
    logPath: args.logPath,
  });
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

function parseArgs(argv) {
  const parsed = {
    log: false,
    queryParts: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

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

    if (arg === '--surface') {
      parsed.surface = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--log-path') {
      parsed.logPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--log') {
      parsed.log = true;
      continue;
    }

    parsed.queryParts.push(arg);
  }

  parsed.query = parsed.queryParts.join(' ').trim();
  return parsed;
}

function printUsage() {
  console.error('Usage: npm run retrieve -- "Dialog 서브텍스트는 언제 써?"');
  console.error('Options: --top 8, -k 8, --index build/public-index/index.json, --surface cli, --log, --log-path build/hermes-usage/usage.jsonl');
}
