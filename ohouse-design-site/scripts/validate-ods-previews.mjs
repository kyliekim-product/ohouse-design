import { getOdsComponents } from '../src/lib/ods-content.js';
import { previewRenderers } from '../src/components/ods-preview/registry.js';

const errors = [];
let previewCount = 0;

for (const component of getOdsComponents()) {
  const preview = component.preview;
  if (!preview) continue;

  previewCount += 1;
  const renderer = previewRenderers[preview.renderer];
  if (!renderer) {
    errors.push(`${component.slug}: preview renderer is not registered: ${preview.renderer}`);
    continue;
  }

  for (const error of renderer.validate(preview)) {
    errors.push(`${component.slug}: ${error}`);
  }
}

if (errors.length > 0) {
  console.error(`ODS preview validation failed: ${errors.length} error(s)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`ODS preview validation passed: ${previewCount} preview(s)`);
