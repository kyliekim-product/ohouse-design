import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/pages/d/[domain].astro', 'utf8');

assert.match(source, /id="policy-modal"/, 'domain page should render a policy detail modal');
assert.match(source, /data-policy-modal-open/, 'policy cards should open detail in a modal');
assert.doesNotMatch(source, /View policy detail/, 'policy card should not use a repeated detail button label');
assert.match(source, /policy-card__chevron/, 'policy card should show a chevron hint');

console.log('policy modal validation passed');
