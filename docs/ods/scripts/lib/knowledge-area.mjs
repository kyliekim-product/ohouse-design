export function inferKnowledgeArea(sourcePath) {
  const path = String(sourcePath ?? '');
  const componentMatch = path.match(/^content\/components\/(.+)\/(?:guide|spec|tokens)\.md$/);
  if (componentMatch) {
    const parts = componentMatch[1].split('/');
    return `component:${parts.at(-1)}`;
  }

  const foundationMatch = path.match(/^content\/foundations\/([^/]+)\/(?:(?:guide|spec|tokens)\.md|tokens\.yaml)$/);
  if (foundationMatch) return `foundation:${foundationMatch[1]}`;

  const patternMatch = path.match(/^content\/patterns\/([^/]+)\//);
  if (patternMatch) return `pattern:${patternMatch[1]}`;

  return 'unknown';
}

export function itemMatchesKnowledgeArea(item, area) {
  if (!area) return false;
  return inferKnowledgeArea(item.source_path) === area;
}
