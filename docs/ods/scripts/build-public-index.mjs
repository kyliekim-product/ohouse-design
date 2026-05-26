import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  areaForMetaDir,
  buildAreaRelations,
  relationsObjectFromMap,
  relationTargets,
} from './lib/knowledge-relations.mjs';

const ROOT = process.cwd();
const DEFAULT_OUT_DIR = 'build/public-index';
const PUBLIC_FOUNDATION_SOURCES = new Set([
  'content/foundations/semantic-tokens/guide.md',
  'content/foundations/semantic-tokens/tokens.yaml',
]);
const args = parseArgs(process.argv.slice(2));
const outDir = path.resolve(ROOT, args.outDir ?? DEFAULT_OUT_DIR);

const report = {
  errors: [],
  warnings: [],
  counts: {
    metaFiles: 0,
    publishedSources: 0,
    skippedSources: 0,
    chunks: 0,
    brokenLocalRefs: 0,
  },
};

const sourceCommit = getGitValue(['rev-parse', 'HEAD']) ?? 'unknown';
const sourceRef = getGitValue(['rev-parse', '--abbrev-ref', 'HEAD']) ?? 'unknown';
const sourceRepo = getGitValue(['config', '--get', 'remote.origin.url']) ?? 'unknown';
const dirty = Boolean(getGitValue(['status', '--porcelain']));
const packageVersion = JSON.parse(readText(path.join(ROOT, 'package.json'))).version ?? '0.0.0';
const metaByDir = new Map();

for (const filePath of walk(ROOT)) {
  if (path.basename(filePath) !== 'meta.yaml') continue;
  if (!isPublicContentPath(relativePath(filePath))) continue;

  const meta = parseYaml(readText(filePath));
  meta.__path = relativePath(filePath);
  meta.__dir = path.dirname(meta.__path);
  report.counts.metaFiles += 1;
  validateMeta(meta);
  metaByDir.set(meta.__dir, meta);
}

validateDuplicateIds([...metaByDir.values()]);

const sources = discoverSources();
const areaRelations = buildAreaRelations(metaByDir);
validateRelations(areaRelations);
const items = [];

for (const source of sources) {
  const meta = metaByDir.get(path.dirname(source.sourcePath));
  if (!meta) {
    report.errors.push({
      type: 'missing_meta',
      source_path: source.sourcePath,
      message: `Missing meta.yaml next to ${source.sourcePath}`,
    });
    report.counts.skippedSources += 1;
    continue;
  }

  if (meta.status !== 'published') {
    report.counts.skippedSources += 1;
    continue;
  }

  report.counts.publishedSources += 1;
  const text = readText(path.resolve(ROOT, source.sourcePath));
  validateLocalRefs(source.sourcePath, text);

  const chunks = source.format === 'markdown'
    ? chunkMarkdown(text)
    : chunkWholeFile(text, meta.title);
  const area = areaForMetaDir(meta.__dir);
  const relations = areaRelations.get(area) ?? {};

  for (const chunk of chunks) {
    const item = {
      id: stableId([meta.id, source.documentKind, chunk.headingPath.join(' > '), chunk.content]),
      source_path: source.sourcePath,
      kind: source.kind,
      document_kind: source.documentKind,
      slug: slugForSource(source.sourcePath),
      title: meta.title,
      heading_path: chunk.headingPath,
      source_commit: sourceCommit,
      content_hash: sha256(chunk.content),
      content: chunk.content,
      relations,
      metadata: {
        content_id: meta.id,
        category: meta.category,
        description: meta.description,
        aliases: meta.aliases ?? [],
      },
    };
    items.push(item);
  }
}

validateCompleteness();

const generatedAt = new Date().toISOString();
const index = {
  schema_version: '1.0.0',
  generated_at: generatedAt,
  source_commit: sourceCommit,
  source: {
    repo: sourceRepo,
    ref: sourceRef,
    commit: sourceCommit,
  },
  generator: {
    name: 'ods-docs build-public-index',
    version: packageVersion,
  },
  label: indexLabel({ sourceRef, generatedAt, sourceCommit }),
  dirty,
  item_count: items.length,
  area_relations: relationsObjectFromMap(areaRelations),
  items,
};
index.artifact_id = `sha256:${sha256(JSON.stringify(index))}`;

report.counts.chunks = items.length;

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
writeFileSync(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(`Public index written to ${path.relative(ROOT, outDir)}`);
console.log(`items=${items.length} errors=${report.errors.length} warnings=${report.warnings.length}`);
if (report.counts.brokenLocalRefs > 0) {
  console.log(`brokenLocalRefs=${report.counts.brokenLocalRefs}`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out-dir') {
      parsed.outDir = argv[i + 1];
      i += 1;
    }
  }
  return parsed;
}

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    if (shouldSkipDir(name)) continue;
    const fullPath = path.join(dir, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      entries.push(...walk(fullPath));
    } else {
      entries.push(fullPath);
    }
  }
  return entries;
}

function shouldSkipDir(name) {
  return new Set(['.git', '.superpowers', '.worktrees', 'node_modules', 'build']).has(name);
}

function isPublicContentPath(filePath) {
  return filePath.startsWith('content/components/')
    || filePath.startsWith('content/patterns/')
    || filePath.startsWith('content/foundations/');
}

function discoverSources() {
  const discovered = [];
  for (const filePath of walk(path.resolve(ROOT, 'content'))) {
    const rel = relativePath(filePath);
    const name = path.basename(rel);
    const inComponents = rel.startsWith('content/components/');
    const inPatterns = rel.startsWith('content/patterns/');
    const inFoundations = rel.startsWith('content/foundations/');

    if (inComponents && (name === 'guide.md' || name === 'spec.md')) {
      discovered.push({
        sourcePath: rel,
        kind: name === 'guide.md' ? 'component_guide' : 'component_spec',
        documentKind: path.basename(name, '.md'),
        format: 'markdown',
      });
    }

    if (inPatterns && name === 'pattern.md') {
      discovered.push({
        sourcePath: rel,
        kind: 'pattern',
        documentKind: 'pattern',
        format: 'markdown',
      });
    }

    if (inFoundations && PUBLIC_FOUNDATION_SOURCES.has(rel)) {
      discovered.push({
        sourcePath: rel,
        kind: name === 'guide.md' ? 'foundation_guide' : 'foundation_tokens',
        documentKind: path.basename(name, path.extname(name)),
        format: name.endsWith('.md') ? 'markdown' : 'yaml',
      });
    }
  }
  return discovered.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
}

function parseYaml(text) {
  const result = {};
  let currentListKey = null;
  let currentMapKey = null;
  let currentNestedListKey = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const indent = rawLine.match(/^\s*/)[0].length;

    const listMatch = line.match(/^\s+-\s+(.*)$/);
    if (listMatch && currentMapKey && currentNestedListKey && indent > 0) {
      result[currentMapKey][currentNestedListKey].push(unquote(listMatch[1].trim()));
      continue;
    }
    if (listMatch && currentListKey && indent > 0) {
      result[currentListKey].push(unquote(listMatch[1].trim()));
      continue;
    }

    const pairMatch = line.match(/^\s*([A-Za-z0-9_-]+):(?:\s+(.*))?$/);
    if (!pairMatch) continue;

    const [, key, value] = pairMatch;
    if (indent > 0 && currentMapKey) {
      if (value === undefined) {
        result[currentMapKey][key] = [];
        currentNestedListKey = key;
      } else {
        result[currentMapKey][key] = unquote(value.trim());
        currentNestedListKey = null;
      }
      continue;
    }

    currentNestedListKey = null;
    if (value === undefined && key === 'relations') {
      result[key] = {};
      currentMapKey = key;
      currentListKey = null;
    } else if (value === undefined) {
      result[key] = [];
      currentListKey = key;
      currentMapKey = null;
    } else {
      result[key] = unquote(value.trim());
      currentListKey = null;
      currentMapKey = null;
    }
  }

  return result;
}

function unquote(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function validateMeta(meta) {
  for (const field of ['id', 'title', 'category', 'status', 'description']) {
    if (!meta[field]) {
      report.errors.push({
        type: 'invalid_meta',
        source_path: meta.__path,
        message: `Missing required field: ${field}`,
      });
    }
  }

  if (!['components', 'patterns', 'foundations'].includes(meta.category)) {
    report.errors.push({
      type: 'invalid_meta',
      source_path: meta.__path,
      message: `Invalid category: ${meta.category}`,
    });
  }

  if (!['published', 'draft', 'archived'].includes(meta.status)) {
    report.errors.push({
      type: 'invalid_meta',
      source_path: meta.__path,
      message: `Invalid status: ${meta.status}`,
    });
  }

  if (!Array.isArray(meta.aliases) || meta.aliases.length === 0) {
    report.warnings.push({
      type: 'empty_aliases',
      source_path: meta.__path,
      message: 'aliases is empty or missing',
    });
  }
}

function validateDuplicateIds(metas) {
  const seen = new Map();
  for (const meta of metas) {
    if (!meta.id) continue;
    if (seen.has(meta.id)) {
      report.errors.push({
        type: 'duplicate_id',
        source_path: meta.__path,
        other_source_path: seen.get(meta.id),
        message: `Duplicate id: ${meta.id}`,
      });
    }
    seen.set(meta.id, meta.__path);
  }
}

function validateCompleteness() {
  for (const meta of metaByDir.values()) {
    if (meta.status !== 'published') continue;

    const dir = path.resolve(ROOT, meta.__dir);
    if (meta.category === 'components') {
      const hasGuide = existsSync(path.join(dir, 'guide.md'));
      const hasSpec = existsSync(path.join(dir, 'spec.md'));
      if (!hasGuide) {
        report.warnings.push({
          type: 'missing_guide',
          source_path: meta.__path,
          message: 'Published component has no guide.md',
        });
      }
      if (!hasSpec) {
        report.warnings.push({
          type: 'missing_spec',
          source_path: meta.__path,
          message: 'Published component has no spec.md',
        });
      }
    }

    if (meta.category === 'patterns' && !existsSync(path.join(dir, 'pattern.md'))) {
      report.warnings.push({
        type: 'missing_pattern',
        source_path: meta.__path,
        message: 'Published pattern has no pattern.md',
      });
    }
  }
}

function validateRelations(relationsByArea) {
  const knownAreas = new Set(relationsByArea.keys());

  for (const [area, relations] of relationsByArea.entries()) {
    for (const target of relationTargets(relations)) {
      if (knownAreas.has(target)) continue;
      report.errors.push({
        type: 'invalid_relation_target',
        source_path: metaPathForArea(area),
        area,
        target,
        message: `Relation target area does not exist: ${target}`,
      });
    }
  }
}

function metaPathForArea(area) {
  for (const meta of metaByDir.values()) {
    if (areaForMetaDir(meta.__dir) === area) return meta.__path;
  }
  return null;
}

function validateLocalRefs(sourcePath, text) {
  const sourceDir = path.dirname(path.resolve(ROOT, sourcePath));
  const refs = [...text.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)];

  for (const [, rawTarget] of refs) {
    const target = rawTarget.trim().split(/\s+/)[0];
    if (!target || target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;

    const [targetPath] = target.split('#');
    if (!targetPath) continue;
    const resolved = path.resolve(sourceDir, decodeURIComponent(targetPath));
    if (!existsSync(resolved)) {
      report.counts.brokenLocalRefs += 1;
      report.warnings.push({
        type: 'broken_local_ref',
        source_path: sourcePath,
        target,
        message: `Local reference does not exist: ${target}`,
      });
    }
  }
}

function chunkMarkdown(text) {
  const chunks = [];
  const headingStack = [];
  let current = null;

  for (const line of text.split('\n')) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (heading) {
      if (current && current.lines.some((entry) => entry.trim())) {
        chunks.push({
          headingPath: current.headingPath,
          content: current.lines.join('\n').trim(),
        });
      }

      const level = heading[1].length;
      const title = heading[2].trim();
      headingStack.splice(level - 1);
      headingStack[level - 1] = title;
      current = {
        headingPath: headingStack.filter(Boolean),
        lines: [line],
      };
      continue;
    }

    if (!current) {
      current = {
        headingPath: ['Untitled'],
        lines: [],
      };
    }
    current.lines.push(line);
  }

  if (current && current.lines.some((entry) => entry.trim())) {
    chunks.push({
      headingPath: current.headingPath,
      content: current.lines.join('\n').trim(),
    });
  }

  return chunks;
}

function chunkWholeFile(text, title) {
  return [{
    headingPath: [title],
    content: text.trim(),
  }];
}

function slugForSource(sourcePath) {
  return sourcePath
    .replace(/^content\//, '')
    .replace(/\/(guide|spec|pattern)\.md$/, '')
    .replace(/\/tokens\.yaml$/, '')
    .replace(/\//g, '.');
}

function stableId(parts) {
  return sha256(parts.join('\n')).slice(0, 24);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function indexLabel({ sourceRef, generatedAt, sourceCommit }) {
  const compactTimestamp = generatedAt
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  return `ods-docs-${slugForLabel(sourceRef)}-${compactTimestamp}-${sourceCommit.slice(0, 7)}`;
}

function slugForLabel(value) {
  return String(value ?? 'unknown')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function readText(filePath) {
  return readFileSync(filePath, 'utf8');
}

function getGitValue(argv) {
  try {
    return execFileSync('git', argv, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}
