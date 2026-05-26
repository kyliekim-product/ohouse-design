const RELATION_ARRAY_FIELDS = ['child_areas', 'related_pattern_areas', 'wrapper_for_areas'];
const RELATION_SCALAR_FIELDS = ['parent_area'];
const RELATION_FIELDS = [...RELATION_SCALAR_FIELDS, ...RELATION_ARRAY_FIELDS];

export function areaForMetaDir(dirPath) {
  const path = String(dirPath ?? '');

  const componentMatch = path.match(/^content\/components\/(.+)$/);
  if (componentMatch) {
    const parts = componentMatch[1].split('/');
    return `component:${parts.at(-1)}`;
  }

  const patternMatch = path.match(/^content\/patterns\/([^/]+)$/);
  if (patternMatch) return `pattern:${patternMatch[1]}`;

  const foundationMatch = path.match(/^content\/foundations\/([^/]+)$/);
  if (foundationMatch) return `foundation:${foundationMatch[1]}`;

  return null;
}

export function buildAreaRelations(metaByDir) {
  const areaByDir = new Map();
  const relationsByArea = new Map();

  for (const [dir, meta] of metaByDir.entries()) {
    if (meta.status !== 'published') continue;

    const area = areaForMetaDir(dir);
    if (!area) continue;

    areaByDir.set(dir, area);
    relationsByArea.set(area, normalizeRelations(meta.relations));
  }

  for (const [dir, area] of areaByDir.entries()) {
    if (!dir.startsWith('content/components/')) continue;

    const parentDir = dir.replace(/\/[^/]+$/, '');
    if (parentDir === dir || parentDir === 'content/components') continue;

    const parentArea = areaByDir.get(parentDir);
    if (!parentArea) continue;

    const childAuto = { parent_area: parentArea };
    const parentAuto = { child_areas: [area] };

    relationsByArea.set(area, mergeRelations(childAuto, relationsByArea.get(area)));
    relationsByArea.set(parentArea, mergeRelations(parentAuto, relationsByArea.get(parentArea)));
  }

  return relationsByArea;
}

export function normalizeRelations(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const relations = {};

  for (const field of RELATION_SCALAR_FIELDS) {
    const scalar = normalizeArea(value[field]);
    if (scalar) relations[field] = scalar;
  }

  for (const field of RELATION_ARRAY_FIELDS) {
    const areas = normalizeAreaArray(value[field]);
    if (areas.length > 0) relations[field] = areas;
  }

  return relations;
}

export function mergeRelations(autoRelations, explicitRelations) {
  const auto = normalizeRelations(autoRelations);
  const explicit = normalizeRelations(explicitRelations);
  const merged = {};

  for (const field of RELATION_SCALAR_FIELDS) {
    const value = explicit[field] ?? auto[field];
    if (value) merged[field] = value;
  }

  for (const field of RELATION_ARRAY_FIELDS) {
    const values = unique([...(auto[field] ?? []), ...(explicit[field] ?? [])]);
    if (values.length > 0) merged[field] = values;
  }

  return merged;
}

export function relationTargets(relations) {
  const normalized = normalizeRelations(relations);
  return unique([
    normalized.parent_area,
    ...(normalized.child_areas ?? []),
    ...(normalized.related_pattern_areas ?? []),
    ...(normalized.wrapper_for_areas ?? []),
  ].filter(Boolean));
}

export function relationKindBetween(fromArea, toArea, relationsByArea) {
  if (!fromArea || !toArea) return null;
  if (fromArea === toArea) return 'same-area';

  const from = getRelations(relationsByArea, fromArea);
  const to = getRelations(relationsByArea, toArea);

  if (from.related_pattern_areas?.includes(toArea)) return 'subcomponent-to-pattern';
  if (to.related_pattern_areas?.includes(fromArea)) return 'pattern-to-subcomponent';
  if (toArea.startsWith('pattern:') && to.child_areas?.includes(fromArea)) return 'subcomponent-to-pattern';
  if (fromArea.startsWith('pattern:') && from.child_areas?.includes(toArea)) return 'pattern-to-subcomponent';

  if (from.parent_area === toArea) return 'child-to-parent';
  if (to.parent_area === fromArea) return 'parent-to-child';
  if (from.child_areas?.includes(toArea)) return 'parent-to-child';
  if (to.child_areas?.includes(fromArea)) return 'child-to-parent';

  if (from.wrapper_for_areas?.includes(toArea)) return 'wrapper-to-wrapped';
  if (to.wrapper_for_areas?.includes(fromArea)) return 'wrapped-by-wrapper';

  return null;
}

export function relationsObjectFromMap(relationsByArea) {
  return Object.fromEntries(
    [...relationsByArea.entries()]
      .filter(([, relations]) => Object.keys(relations).length > 0)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function relationsMapFromIndex(index) {
  const relations = new Map(Object.entries(index.area_relations ?? {}));

  for (const item of index.items ?? []) {
    const area = item.inferred_area ?? areaFromSourcePath(item.source_path);
    if (!area || relations.has(area)) continue;
    const itemRelations = normalizeRelations(item.relations);
    if (Object.keys(itemRelations).length > 0) relations.set(area, itemRelations);
  }

  return relations;
}

function areaFromSourcePath(sourcePath) {
  const path = String(sourcePath ?? '');
  const componentMatch = path.match(/^content\/components\/(.+)\/(?:guide|spec|tokens)\.md$/);
  if (componentMatch) {
    const parts = componentMatch[1].split('/');
    return `component:${parts.at(-1)}`;
  }

  const patternMatch = path.match(/^content\/patterns\/([^/]+)\//);
  if (patternMatch) return `pattern:${patternMatch[1]}`;

  const foundationMatch = path.match(/^content\/foundations\/([^/]+)\//);
  if (foundationMatch) return `foundation:${foundationMatch[1]}`;

  return null;
}

function getRelations(relationsByArea, area) {
  if (!relationsByArea) return {};
  if (relationsByArea instanceof Map) return normalizeRelations(relationsByArea.get(area));
  return normalizeRelations(relationsByArea[area]);
}

function normalizeArea(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

function normalizeAreaArray(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return unique(value.map(normalizeArea).filter(Boolean));

  const scalar = normalizeArea(value);
  return scalar ? [scalar] : [];
}

function unique(values) {
  return [...new Set(values)];
}

export { RELATION_FIELDS };
