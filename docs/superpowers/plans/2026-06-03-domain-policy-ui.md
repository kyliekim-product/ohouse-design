# Domain Policy UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make domain `policies` tabs show growing track policy docs as grouped, worker-oriented policy sections instead of raw document cards.

**Architecture:** Build a policy view model in `src/lib/repo.js` by splitting Markdown bodies into H2 sections and classifying each section into stable UI groups. Render the grouped data in `src/pages/d/[domain].astro` with a summary strip, subtab navigation, and section cards while preserving source links and raw source access.

**Tech Stack:** Astro, Node ESM, gray-matter, marked, existing static data helpers.

---

### Task 1: Policy Section View Model

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js`
- Test: `ohouse-design-site/scripts/repo-context.test.mjs`

- [x] Add a failing test that expects `getDomainPolicies()` to expose grouped policy sections.
- [x] Implement Markdown H2 section splitting and heuristic category classification.
- [x] Keep existing policy document fields for compatibility.

### Task 2: Domain Policy UI

**Files:**
- Modify: `ohouse-design-site/src/pages/d/[domain].astro`

- [x] Replace raw policy stack with summary metrics, policy subtabs, and grouped cards.
- [x] Add client-side subtab activation that works with `?tab=policies&policy=<group>`.

### Task 3: Verification

**Files:**
- Verify: `ohouse-design-site/scripts/repo-context.test.mjs`
- Verify: `ohouse-design-site` Astro build

- [x] Run repo context tests.
- [x] Run production build.
