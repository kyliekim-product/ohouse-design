import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const DEFAULT_SPECS = [
  'content/foundations/semantic-tokens/tokens.yaml',
  'content/foundations/palette-tokens/tokens.yaml',
];
const DEFAULT_REPO = 'https://github.com/bucketplace/design-assets.git';
const DEFAULT_REF = 'main';

const args = parseArgs(process.argv.slice(2));
const specPaths = resolveSpecPaths(args.specs ?? process.env.ODS_TOKEN_CONTRACT_SPECS);
const repo = args.repo ?? process.env.ODS_TOKEN_IMPL_REPO ?? DEFAULT_REPO;
const ref = args.ref ?? process.env.ODS_TOKEN_IMPL_REF ?? DEFAULT_REF;
const implementationRootArg = args.implementationRoot ?? process.env.ODS_TOKEN_IMPL_PROJECT_ROOT;
const tokensRootArg = args.tokensRoot ?? process.env.ODS_TOKEN_IMPL_ROOT;
const authToken = args.authToken ?? process.env.ODS_TOKEN_IMPL_AUTH_TOKEN;

const report = {
  specs: specPaths.map(relativeFromRoot),
  implementationSource: null,
  tokenCount: 0,
  missing: [],
  mismatchedValues: [],
  duplicates: [],
  invalid: [],
};

for (const specPath of specPaths) {
  if (!existsSync(specPath)) {
    fail(`Token contract spec not found: ${relativeFromRoot(specPath)}`);
  }
}

let cleanupDir = null;
let tokensRoot = null;

try {
  if (implementationRootArg || tokensRootArg) {
    const implementationRoot = implementationRootArg ? path.resolve(ROOT, implementationRootArg) : null;
    tokensRoot = tokensRootArg ? path.resolve(ROOT, tokensRootArg) : path.join(implementationRoot, 'tokens');
    report.implementationSource = { type: 'local', implementationRoot, tokensRoot };
  } else {
    cleanupDir = mkdtempSync(path.join(tmpdir(), 'ods-token-impl-'));
    const checkoutDir = path.join(cleanupDir, 'design-assets');
    execFileSync('git', ['clone', '--depth', '1', '--branch', ref, repoWithAuth(repo, authToken), checkoutDir], {
      stdio: 'pipe',
    });
    tokensRoot = path.join(checkoutDir, 'tokens');
    report.implementationSource = { type: 'remote', repo, ref };
  }

  if (!existsSync(tokensRoot) || !statSync(tokensRoot).isDirectory()) {
    fail(`Token implementation root not found: ${tokensRoot}`);
  }

  const specTokens = specPaths.flatMap((specPath) => {
    const contractKind = inferContractKind(specPath);
    return parseTokenSpec(readFileSync(specPath, 'utf8')).map((token) => ({
      ...token,
      __specPath: relativeFromRoot(specPath),
      __contractKind: contractKind,
    }));
  });
  const implementationTokens = collectImplementationTokens(tokensRoot);
  validateSpecTokens(specTokens, implementationTokens);

  if (
    report.invalid.length
    || report.duplicates.length
    || report.missing.length
    || report.mismatchedValues.length
  ) {
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  console.log(`Token contract validation passed: ${report.tokenCount} tokens`);
  console.log(`implementation=${formatImplementationSource(report.implementationSource)}`);
} finally {
  if (cleanupDir) {
    rmSync(cleanupDir, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  const parsed = { specs: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--spec') {
      parsed.specs.push(requiredValue(argv, i, arg));
      i += 1;
    } else if (arg === '--repo') {
      parsed.repo = requiredValue(argv, i, arg);
      i += 1;
    } else if (arg === '--ref') {
      parsed.ref = requiredValue(argv, i, arg);
      i += 1;
    } else if (arg === '--tokens-root') {
      parsed.tokensRoot = requiredValue(argv, i, arg);
      i += 1;
    } else if (arg === '--implementation-root') {
      parsed.implementationRoot = requiredValue(argv, i, arg);
      i += 1;
    } else if (arg === '--auth-token') {
      parsed.authToken = requiredValue(argv, i, arg);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function requiredValue(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    fail(`Missing value for ${name}`);
  }
  return value;
}

function resolveSpecPaths(specsValue) {
  let specs = Array.isArray(specsValue) ? specsValue : [];
  if (typeof specsValue === 'string' && specsValue.trim()) {
    specs = specsValue.split(',').map((entry) => entry.trim()).filter(Boolean);
  }
  if (specs.length === 0) specs = DEFAULT_SPECS;
  return specs.map((specPath) => path.resolve(ROOT, specPath));
}

function parseTokenSpec(text) {
  const tokens = [];
  let current = null;
  let currentCollectionKey = null;
  let currentObjectKey = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;

    const tokenStart = line.match(/^ {2}- name:\s*(.+)$/);
    if (tokenStart) {
      current = { name: parseScalar(tokenStart[1].trim()) };
      tokens.push(current);
      currentCollectionKey = null;
      currentObjectKey = null;
      continue;
    }

    if (!current) continue;

    const objectOrListKey = line.match(/^ {4}([A-Za-z0-9_-]+):\s*$/);
    if (objectOrListKey) {
      const key = objectOrListKey[1];
      current[key] = key === 'value' ? {} : [];
      currentCollectionKey = Array.isArray(current[key]) ? key : null;
      currentObjectKey = Array.isArray(current[key]) ? null : key;
      continue;
    }

    const listItem = line.match(/^ {6}-\s*(.+)$/);
    if (listItem && currentCollectionKey && Array.isArray(current[currentCollectionKey])) {
      current[currentCollectionKey].push(parseScalar(listItem[1].trim()));
      continue;
    }

    const objectField = line.match(/^ {6}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (objectField && currentObjectKey && current[currentObjectKey]) {
      current[currentObjectKey][objectField[1]] = parseScalar(objectField[2].trim());
      continue;
    }

    const field = line.match(/^ {4}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field) {
      current[field[1]] = parseScalar(field[2].trim());
      currentCollectionKey = null;
      currentObjectKey = null;
    }
  }

  return tokens;
}

function validateSpecTokens(specTokens, implementationTokens) {
  const seenNames = new Map();
  const seenImplementations = new Map();
  report.tokenCount = specTokens.length;

  for (const token of specTokens) {
    validateRequiredFields(token, ['name', 'implementation', 'type']);

    if (token.__contractKind === 'semantic') {
      validateRequiredFields(token, ['group', 'intent', 'strength', 'role']);
      validateNonEmptyList(token, 'useWhen');
      validateNonEmptyList(token, 'avoidWhen');
      validateNonEmptyList(token, 'aliases');
    }

    if (token.__contractKind === 'palette') {
      validateRequiredFields(token, ['family']);
      if (!('scale' in token)) {
        report.invalid.push({
          spec: token.__specPath,
          token: token.name ?? '(unknown)',
          type: 'missing_field',
          field: 'scale',
        });
      }
      if (!token.value || typeof token.value !== 'object') {
        report.invalid.push({
          spec: token.__specPath,
          token: token.name ?? '(unknown)',
          type: 'missing_field',
          field: 'value',
        });
      } else {
        for (const field of ['hex', 'alpha']) {
          if (!(field in token.value)) {
            report.invalid.push({
              spec: token.__specPath,
              token: token.name ?? '(unknown)',
              type: 'missing_field',
              field: `value.${field}`,
            });
          }
        }
      }
    }

    trackDuplicate(seenNames, `${token.__specPath}:${token.name}`, 'name');
    trackDuplicate(seenImplementations, token.implementation, 'implementation');

    const implementation = implementationTokens.get(token.implementation);
    if (token.implementation && !implementation) {
      report.missing.push({
        spec: token.__specPath,
        token: token.name,
        implementation: token.implementation,
      });
      continue;
    }

    if (token.__contractKind === 'palette' && token.value && implementation?.value) {
      validatePaletteValue(token, implementation.value);
    }
  }
}

function validateRequiredFields(token, fields) {
  for (const field of fields) {
    if (token[field] === undefined || token[field] === null || token[field] === '') {
      report.invalid.push({
        spec: token.__specPath,
        token: token.name ?? '(unknown)',
        type: 'missing_field',
        field,
      });
    }
  }
}

function validateNonEmptyList(token, field) {
  if (!Array.isArray(token[field]) || token[field].length === 0) {
    report.invalid.push({
      spec: token.__specPath,
      token: token.name ?? '(unknown)',
      type: `empty_${field}`,
    });
  }
}

function validatePaletteValue(token, implementationValue) {
  const expectedHex = String(token.value.hex).toLowerCase();
  const actualHex = String(implementationValue.hex).toLowerCase();
  const expectedAlpha = Number(token.value.alpha);
  const actualAlpha = Number(implementationValue.alpha);

  if (expectedHex !== actualHex || expectedAlpha !== actualAlpha) {
    report.mismatchedValues.push({
      spec: token.__specPath,
      token: token.name,
      implementation: token.implementation,
      expected: token.value,
      actual: implementationValue,
    });
  }
}

function trackDuplicate(seen, value, field) {
  if (!value) return;
  if (seen.has(value)) {
    report.duplicates.push({
      field,
      value,
      firstToken: seen.get(value),
    });
    return;
  }
  seen.set(value, value);
}

function collectImplementationTokens(root) {
  const tokens = new Map();
  for (const filePath of walk(root)) {
    if (!filePath.endsWith('.json')) continue;
    const data = parseJsonFile(filePath);
    collectTokenPaths(data, [], tokens);
  }
  return tokens;
}

function parseJsonFile(filePath) {
  const text = readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(text);
  } catch (error) {
    try {
      return JSON.parse(stripTrailingCommas(text));
    } catch {
      throw new Error(`Failed to parse token JSON: ${filePath}\n${error.message}`);
    }
  }
}

function stripTrailingCommas(text) {
  return text.replace(/,\s*([}\]])/g, '$1');
}

function collectTokenPaths(value, parts, tokens) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;

  if ('$type' in value || '$value' in value || 'theme' in value) {
    tokens.set(parts.join('.'), {
      type: value.$type,
      value: value.$value,
    });
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    collectTokenPaths(child, [...parts, key], tokens);
  }
}

function walk(dir) {
  const output = execFileSync('find', [dir, '-type', 'f'], { encoding: 'utf8' }).trim();
  return output ? output.split('\n') : [];
}

function inferContractKind(specPath) {
  const rel = relativeFromRoot(specPath);
  if (rel.includes('/semantic-tokens/')) return 'semantic';
  if (rel.includes('/palette-tokens/')) return 'palette';
  return 'generic';
}

function parseScalar(value) {
  const unquoted = value.replace(/^['"]|['"]$/g, '');
  if (unquoted === 'null') return null;
  if (/^-?\d+(?:\.\d+)?$/.test(unquoted)) return Number(unquoted);
  return unquoted;
}

function relativeFromRoot(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/') || '.';
}

function formatImplementationSource(source) {
  if (source.type === 'local') return source.implementationRoot ?? source.tokensRoot;
  return `${source.repo}#${source.ref}`;
}

function repoWithAuth(repoUrl, token) {
  if (!token) return repoUrl;
  if (!repoUrl.startsWith('https://github.com/')) return repoUrl;
  return repoUrl.replace('https://github.com/', `https://x-access-token:${encodeURIComponent(token)}@github.com/`);
}

function printHelp() {
  console.log(`Usage: node scripts/validate-token-contracts.mjs [options]

Options:
  --spec <path>         Token contract spec path. Can be repeated.
                        Defaults to ${DEFAULT_SPECS.join(', ')}
  --repo <url>          Token implementation git repo. Defaults to ${DEFAULT_REPO}
  --ref <ref>           Token implementation git ref. Defaults to ${DEFAULT_REF}
  --implementation-root <path>
                       Local design-assets project/worktree root override
  --tokens-root <path>  Local implementation tokens directory override
  --auth-token <token>  Token for cloning private implementation repos

Environment:
  ODS_TOKEN_CONTRACT_SPECS
  ODS_TOKEN_IMPL_REPO
  ODS_TOKEN_IMPL_REF
  ODS_TOKEN_IMPL_PROJECT_ROOT
  ODS_TOKEN_IMPL_ROOT
  ODS_TOKEN_IMPL_AUTH_TOKEN
`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
