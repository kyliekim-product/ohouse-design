# Ohouse Design IA and UX Strategy

Date: 2026-06-01
Status: Draft for review
Branch: site-optimization-design-tuning-v.1

## Context

Ohouse Design currently presents product domains as the main discovery unit. The home page groups domain cards under `Discovery`, `Shopping`, `Life event`, `Core`, and `Global`, and the main filter exposes `HTML` and `Figma` as primary options. This reflects how source material is organized, but it does not fully match the main discovery jobs from the W2 optimization note:

- Find the latest screens and history by domain.
- Find similar UX patterns and flows across domains.
- Find source material for a prototype.
- Check where an ODS or product component is used.

Reference patterns from Mobbin, uibowl, and Collect UI suggest a split between global discovery axes, detailed browse routes, local side navigation, and cross-cutting filters.

## Product Goal

Reposition Ohouse Design from a domain-card directory into a design reference explorer. Users should be able to start from a domain, screen pattern, UI element, or flow, then narrow results by OS, domain, source type, status, or component usage.

## IA Model

The top-level IA has four global discovery axes:

- `Categories`: domain-led browsing.
- `Screens`: UX pattern-led browsing.
- `UI Elements`: ODS and product component-led browsing.
- `Flows`: user journey-led browsing.

These axes replace the current home emphasis on `Discovery`, `Shopping`, `Life event`, `Core`, and `Global`. The existing domain groups move under `Categories` as domain taxonomy, not as the primary site navigation.

## Navigation Roles

### Top Navigation

Top navigation answers: "What perspective am I browsing from?"

It should show only the four global axes:

- `Categories`
- `Screens`
- `UI Elements`
- `Flows`

Each top item may expose a short row of 3-5 representative entry points, but not a complete tree.

Representative examples:

- `Categories`: Home, Shopping, Content, My Page, Search
- `Screens`: Onboarding, Product Detail, Search Result, Checkout, Profile
- `UI Elements`: Cards, Navigation, Bottom Sheet, Form, Carousel
- `Flows`: Signup, Login, Purchase, Bookmark, Share

### Browse Overlay

The browse overlay answers: "What detailed route exists under this axis?"

Clicking a top navigation item opens a Mobbin-style overlay instead of expanding a long menu in the top bar. The overlay is the complete route finder for the selected axis.

Overlay structure:

- Left rail: global axes and quick routes such as Trending or Recently Updated.
- Main area: grouped detailed routes for the selected axis.
- Metadata: item counts, OS availability, and recently updated indicators where available.

The overlay prevents long flow and pattern lists from crowding the top bar while still making the full taxonomy discoverable.

### Left Side Navigation

The left side navigation answers: "Within the current axis, which subcategory am I viewing?"

It appears on browse result pages and changes by active axis:

- `Screens`: All Screens, Onboarding, Product Detail, Search, Checkout, Feed, Profile, Settings, Empty State, Error State
- `UI Elements`: All Elements, ODS Components, Product Components, Cards, Navigation, Bottom Sheet, Modal, Toast, Form, Carousel
- `Flows`: All Flows, Account, Commerce, Content, Search, Membership, Permission, Order
- `Categories`: All Categories, Home, House Tour, Shopping, Product Detail, Cart, Search, My Page, Membership, Moving, 3D Room

The side navigation must not duplicate the top navigation. It only scopes the current result page.

### Filter Bar

The filter bar answers: "What cross-cutting conditions should narrow these results?"

Primary filters:

- `OS`: iOS, Android, Web, Mobile Web
- `Domain`: Home, Shopping, Search, My Page, etc.
- `Source`: HTML, Figma, Screenshot, Prototype
- `Status`: Verified, Draft, Missing ODS, Code Connect
- `Sort`: Latest, Recently Updated, Most Used

The current `HTML / Figma` toggle should move from primary navigation to the `Source` filter or card metadata.

## Page IA

### Home

Home should introduce the four global axes and provide high-signal shortcuts.

Recommended sections:

- Global navigation: `Categories / Screens / UI Elements / Flows`
- Search: "Search screens, flows, components, domains..."
- Representative shortcuts under each axis
- Recently updated screens
- Popular UX patterns
- Missing ODS or high-value component opportunities
- Card grid, defaulting to recently updated or recommended screen references

Home should not behave like a complete domain menu tree.

### Browse Result Pages

Each axis should have a browse route:

- `/categories`
- `/screens`
- `/ui-elements`
- `/flows`

Each browse page uses the same shell:

- Top navigation
- Axis-specific left side navigation
- Cross-cutting filter bar
- Result grid
- Card metadata for OS, domain, source, status, and related components or flows

### Domain Detail

Domain detail should remain useful for domain owners but become more relationship-driven.

Recommended tabs:

- `Overview`
- `Screens`
- `UX Patterns`
- `UI Elements`
- `Flows`
- `Policies`
- `Experiments`

This preserves the current `Screens / Components / Policies / Experiments` content while adding pattern and flow relationships.

### Screen Detail

Screen detail should explain how a screen can be reused or compared.

Recommended content:

- Preview or thumbnail
- OS and source metadata
- Domain and owner metadata
- Related UX patterns
- Related flows
- Used ODS and product components
- Policies and experiments
- Copy prompt and source actions

If component markers exist in a prototype, they should be visible and toggleable, following the uibowl-style "show component usage" behavior.

## Data Implications

The current content model is domain-first. To support the new IA, screens need additional metadata that can be indexed across domains.

Recommended screen metadata:

- `os`: `ios`, `android`, `web`, or `mobile-web`
- `source`: `html`, `figma`, `screenshot`, or `prototype`
- `patterns`: UX pattern slugs
- `flows`: flow slugs
- `components`: ODS or product component slugs
- `status`: `verified`, `draft`, `missing-ods`, or `code-connect`

Initial implementation can derive some values from existing markers and deterministic fallback data, but the IA should be designed around explicit metadata.

## Implementation Scope

W2 implementation should focus on visible IA and UX development without requiring complete content migration.

In scope:

- Replace domain-group home emphasis with the four global axes.
- Move `HTML / Figma` into source filtering or card metadata.
- Add top navigation behavior for representative routes and browse overlay design.
- Add or prepare browse result page shells for `Categories`, `Screens`, `UI Elements`, and `Flows`.
- Update domain detail IA labels to prepare for relationships.
- Keep existing content rendering intact.

Out of scope for the first pass:

- Complete metadata migration for every screen.
- Real analytics for most viewed or trending.
- Full search indexing beyond existing local data.
- Figma deep-link integration beyond the current non-production link behavior.

## Acceptance Criteria

- Users can understand the four main discovery axes from the first viewport.
- Top navigation does not list every flow, pattern, or component.
- Detailed lists are exposed through an overlay or axis-specific left side navigation.
- `HTML / Figma` is no longer treated as the primary browse decision.
- OS filtering is represented as `iOS / Android / Web / Mobile Web`.
- Domain detail still supports domain-led browsing while adding paths to UX patterns, UI elements, and flows.
- The design can be implemented incrementally using the current Astro site and domain-first content model.
