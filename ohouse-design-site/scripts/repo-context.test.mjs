import assert from 'node:assert/strict';
import {
  getAllBrowseCards,
  getAxisSidebarItems,
  getDomainComponentOverview,
  getDomainPolicies,
  getScreenComponentUsage,
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

function testCategoryBrowseCardsUseDomainScreens() {
  const items = getAllBrowseCards('categories');
  const houseTourContentTab = items.find((item) => item.id === 'house-tour-content-tab');

  assert.ok(houseTourContentTab, 'categories browse cards should include domain screen cards');
  assert.equal(houseTourContentTab.domainSlug, 'house-tour');
  assert.equal(houseTourContentTab.href, '/d/house-tour/s/content-tab');
  assert.notEqual(houseTourContentTab.href, '/d/house-tour');
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

function testScreenComponentUsageReadsReadmeMarkers() {
  const usage = getScreenComponentUsage('house-tour', 'content-tab');

  assert.deepEqual(
    usage.ods.map((component) => component.slug),
    ['ContentsLandscapeCard', 'ContentsPortraitCard'],
  );

  assert.deepEqual(
    usage.domain.map((component) => `${component.ownerDomain}/${component.slug}`),
    [
      'house-tour/interest-feed',
      'house-tour/hscroll',
      'house-tour/recommended-project-section',
      'house-tour/topic-chip',
      'content-detail/contents-plain-tab',
      'content-detail/author-info',
    ],
  );

  const authorInfo = usage.domain.find((component) => component.slug === 'author-info');
  assert.equal(authorInfo.source, 'domain');
  assert.match(authorInfo.html, /Author Info/);
}

function testDomainComponentOverviewSeparatesOwnedAndUsed() {
  const overview = getDomainComponentOverview('house-tour');

  assert.deepEqual(
    overview.owned.map((component) => component.slug),
    ['hscroll', 'interest-feed', 'legacy-interest-post', 'recommended-project-section', 'topic-chip'],
  );

  assert.ok(
    overview.used.some((component) => component.ownerDomain === 'content-detail' && component.slug === 'author-info'),
    'house-tour overview should include content-detail/author-info because content-tab uses it',
  );
  assert.ok(
    overview.used.some((component) => component.ownerDomain === 'house-tour' && component.slug === 'hscroll'),
    'house-tour overview should include owned components when screens use them',
  );
}

testCategoriesSidebarUsesDomainGroups();
testCategoryBrowseCardsUseDomainScreens();
testDomainPoliciesReadMappedTrackMarkdown();
testScreenComponentUsageReadsReadmeMarkers();
testDomainComponentOverviewSeparatesOwnedAndUsed();

console.log('repo context tests passed');
