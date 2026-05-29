import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';
import yaml from 'js-yaml';
import { marked } from 'marked';

const CONTENT_PACKAGE_ROOT = resolve(
  process.env.ODS_SITE_CONTENT_ROOT
    || resolve(import.meta.dirname, '../../node_modules/@bucketplace/ods-site-content'),
);

const markdownRenderer = new marked.Renderer();
const defaultCodeRenderer = markdownRenderer.code.bind(markdownRenderer);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

markdownRenderer.code = (token) => {
  if (token.lang === 'mermaid') {
    return `<div class="ods-mermaid" data-mermaid-source="${escapeHtml(token.text)}"><pre class="mermaid">${escapeHtml(token.text)}</pre></div>`;
  }

  return defaultCodeRenderer(token);
};

export function resolveOdsContentRoot() {
  return CONTENT_PACKAGE_ROOT;
}

function safeRead(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function safeStat(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith('.') && !name.startsWith('_'))
    .filter((name) => safeStat(join(dir, name))?.isDirectory());
}

function readYaml(path) {
  const raw = safeRead(path);
  if (!raw) return null;
  try {
    return yaml.load(raw) || {};
  } catch (error) {
    throw new Error(`Invalid YAML in ${path}: ${error.message}`);
  }
}

function normalizeReferences(references) {
  if (!references || typeof references !== 'object') return [];
  return Object.entries(references)
    .map(([key, value]) => ({
      key,
      label: value?.label || key,
      url: value?.url || null,
      purpose: value?.purpose || null,
    }))
    .filter((item) => item.url);
}

function normalizePreview(preview) {
  if (!preview || typeof preview !== 'object' || Array.isArray(preview)) return null;
  if (typeof preview.component !== 'string' || preview.component.length === 0) return null;

  return {
    component: preview.component,
    label: typeof preview.label === 'string' ? preview.label : null,
    props: preview.props && typeof preview.props === 'object' && !Array.isArray(preview.props)
      ? preview.props
      : {},
  };
}

function componentFromMeta(slug, dir, meta) {
  return {
    slug,
    id: meta.id || `ods.component.${slug}`,
    title: meta.title || slug,
    category: meta.category || 'components',
    status: meta.status || 'draft',
    aliases: Array.isArray(meta.aliases) ? meta.aliases : [],
    description: meta.description || '',
    usageScope: meta.usage_scope || null,
    preview: normalizePreview(meta.preview),
    references: normalizeReferences(meta.references),
    dir,
  };
}

function docsFromSection(section, fallbackCategory) {
  const root = resolveOdsContentRoot();
  const sectionDir = join(root, `content/${section}`);
  return listDirs(sectionDir)
    .map((slug) => {
      const dir = join(sectionDir, slug);
      const meta = readYaml(join(dir, 'meta.yaml'));
      return meta ? componentFromMeta(slug, dir, { category: fallbackCategory, ...meta }) : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'));
}

export function getOdsComponents() {
  return docsFromSection('components', 'components');
}

export function getOdsFoundations() {
  return docsFromSection('foundations', 'foundations');
}

export function getOdsNavigation() {
  return {
    foundations: getOdsFoundations(),
    components: getOdsComponents(),
    patterns: [],
  };
}

function imageMime(path) {
  switch (extname(path).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
    default:
      return 'image/png';
  }
}

function inlineLocalImages(html, markdownPath) {
  const markdownDir = dirname(markdownPath);
  return html.replace(/<img([^>]+?)src="([^"]+)"/g, (match, before, src) => {
    if (/^(https?:|data:|\/)/.test(src)) return match;
    const imagePath = resolve(markdownDir, src);
    if (!existsSync(imagePath)) return match;
    const data = readFileSync(imagePath).toString('base64');
    return `<img${before}src="data:${imageMime(imagePath)};base64,${data}"`;
  });
}

function removeFirstHeading(html) {
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*(?:<hr>\s*)?/i, '');
}

function renderMarkdown(path) {
  const raw = safeRead(path);
  if (!raw) return null;
  return removeFirstHeading(inlineLocalImages(marked.parse(raw, { renderer: markdownRenderer }), path));
}

export function getOdsComponent(slug) {
  const item = getOdsComponents().find((component) => component.slug === slug);
  if (!item) return null;

  return {
    ...item,
    guideHtml: renderMarkdown(join(item.dir, 'guide.md')),
    specHtml: renderMarkdown(join(item.dir, 'spec.md')),
  };
}
