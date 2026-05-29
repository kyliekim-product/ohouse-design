import { validateOdsPreviews } from '@bucketplace/ods-web-preview';
import { getOdsComponents } from '../src/lib/ods-content.js';

const { errors, previewCount } = validateOdsPreviews(getOdsComponents());

if (errors.length > 0) {
  console.error(`ODS preview validation failed: ${errors.length} error(s)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`ODS preview validation passed: ${previewCount} preview(s)`);
