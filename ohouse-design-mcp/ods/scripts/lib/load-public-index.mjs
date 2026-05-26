import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_INDEX_PATH = 'build/public-index/index.json';

export function loadPublicIndex(options = {}) {
  const indexPath = path.resolve(process.cwd(), options.indexPath ?? DEFAULT_INDEX_PATH);
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));

  if (!Array.isArray(index.items)) {
    throw new Error(`Invalid public index: missing items array in ${indexPath}`);
  }

  return {
    indexPath,
    index,
  };
}
