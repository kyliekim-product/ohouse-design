#!/usr/bin/env node

import process from 'node:process';
import { loadPublicIndex } from './lib/load-public-index.mjs';
import { searchPublicIndex } from './lib/search-public-index.mjs';

const args = parseArgs(process.argv.slice(2));

if (!args.query) {
  printUsage();
  process.exit(1);
}

const { index, indexPath } = loadPublicIndex({ indexPath: args.indexPath });
const search = searchPublicIndex(index, args.query, { topK: args.topK });

if (args.json) {
  process.stdout.write(`${JSON.stringify({ indexPath, ...search }, null, 2)}\n`);
} else {
  printTextResults({ indexPath, search, rawMatches: args.rawMatches });
}

function parseArgs(argv) {
  const parsed = {
    json: false,
    rawMatches: false,
    topK: 10,
    queryParts: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--json') {
      parsed.json = true;
      continue;
    }

    if (arg === '--raw-matches') {
      parsed.rawMatches = true;
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

    parsed.queryParts.push(arg);
  }

  parsed.query = parsed.queryParts.join(' ').trim();
  return parsed;
}

function printTextResults({ indexPath, search, rawMatches }) {
  console.log(`index: ${indexPath}`);
  console.log(`query: ${search.query}`);
  console.log(`tokens: ${search.tokens.join(', ') || '(none)'}`);
  console.log(`intent: ${search.intent}`);
  console.log('');

  if (search.results.length === 0) {
    console.log('No matches.');
    return;
  }

  for (const [index, result] of search.results.entries()) {
    const item = result.item;
    console.log(`${index + 1}. ${item.title} / ${item.heading_path.join(' > ')}`);
    console.log(`   score: ${result.score}`);
    console.log(`   source: ${item.source_path}`);
    console.log(`   hash: ${item.content_hash}`);
    console.log('   reason:');
    for (const reason of explainMatches(result.matches)) {
      console.log(`   - ${reason}`);
    }
    if (rawMatches) {
      console.log(`   raw matches: ${formatMatches(result.matches)}`);
    }
    console.log(`   snippet: ${snippet(item.content)}`);
    console.log('');
  }
}

function explainMatches(matches) {
  if (!Array.isArray(matches) || matches.length === 0) return ['no match breakdown'];

  return matches.map((match) => {
    const tokens = match.tokens.join(', ');
    const score = `+${match.score}`;

    if (match.phrase) {
      return `${labelForField(match.field)} matched the full query "${tokens}" (${score})`;
    }

    if (match.exact) {
      return `${labelForField(match.field)} exactly matched ${tokens} (${score})`;
    }

    if (match.intent) {
      return explainIntentMatch(match, score);
    }

    return `${labelForField(match.field)} matched ${tokens} (${score})`;
  });
}

function explainIntentMatch(match, score) {
  if (match.field === 'document_kind') {
    return `query intent matched ${match.tokens.join(', ')} document (${score})`;
  }

  if (match.field === 'heading_path' && match.tokens.includes('root-guide')) {
    return `guide intent boosted the component overview (${score})`;
  }

  if (match.field === 'metadata.category' && match.tokens.includes('foundations')) {
    return `token/color query boosted foundation content (${score})`;
  }

  return `${labelForField(match.field)} received intent boost (${score})`;
}

function labelForField(field) {
  const labels = {
    aliases: 'alias',
    content: 'content',
    description: 'description',
    document_kind: 'document type',
    heading_path: 'heading',
    'metadata.category': 'metadata category',
    source_path: 'source path',
    title: 'title',
  };

  return labels[field] ?? field;
}

function formatMatches(matches) {
  return matches
    .map((match) => {
      const suffix = match.phrase ? ' phrase' : match.intent ? ' intent' : match.exact ? ' exact' : '';
      return `${match.field}[${match.tokens.join(', ')}]+${match.score}${suffix}`;
    })
    .join('; ');
}

function snippet(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function printUsage() {
  console.error('Usage: npm run search -- "Switch는 언제 써?"');
  console.error('Options: --top 10, -k 10, --json, --raw-matches, --index build/public-index/index.json');
}
