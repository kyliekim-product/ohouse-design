import assert from 'node:assert/strict';
import {
  getAxisSidebarItems,
  getDomainPolicies,
} from '../src/lib/repo.js';

function testCategoriesSidebarUsesDomainGroups() {
  const items = getAxisSidebarItems('categories');
  assert.equal(items[0].slug, 'all');
  assert.ok(Array.isArray(items[0].groups), 'All Categories should expose grouped domain sections');

  const groupLabels = items[0].groups.map((group) => group.label);
  assert.deepEqual(groupLabels, ['Discovery', 'Shopping', 'Life event', 'Core', 'Global']);

  const discovery = items[0].groups.find((group) => group.label === 'Discovery');
  assert.deepEqual(
    discovery.items.map((item) => item.slug),
    ['home', 'house-tour', 'shopping-home', 'category'],
  );
}

function testDomainPoliciesReadMappedTrackMarkdown() {
  const policies = getDomainPolicies('content-detail');
  assert.ok(policies.length >= 2, 'content-detail should include contents track index and policies subdoc');

  const trackIndex = policies.find((policy) => policy.slug === 'contents');
  assert.ok(trackIndex, 'content-detail should include tracks/contents.md');
  assert.equal(trackIndex.track, 'contents');
  assert.equal(trackIndex.source, 'track');
  assert.match(trackIndex.html, /Contents Track/);

  const policiesSubdoc = policies.find((policy) => policy.slug === 'contents-policies');
  assert.ok(policiesSubdoc, 'content-detail should include tracks/contents/policies.md');
  assert.equal(policiesSubdoc.track, 'contents');
  assert.equal(policiesSubdoc.source, 'track');
  assert.match(policiesSubdoc.html, /Contents Track · Policies/);
}

testCategoriesSidebarUsesDomainGroups();
testDomainPoliciesReadMappedTrackMarkdown();

console.log('repo context tests passed');
