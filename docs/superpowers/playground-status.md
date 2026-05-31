# Proto Playground Current Status

Last updated: 2026-05-31
Branch: `proto-beta-v.1`

## Purpose

Proto Playground is a natural-language prototyping workspace for generating and iterating on `prototype.html` using ohouse design context. The current implementation separates the conversational experience from the generated HTML preview, then layers lightweight annotation feedback on top of the Preview.

## Key References

- Initial PRD and beta scope: `docs/superpowers/specs/2026-05-30-proto-playground-design.md`
- Chat/Preview event contract: `docs/superpowers/specs/2026-05-31-playground-chat-preview-contract.md`
- Preview annotation design: `docs/superpowers/specs/2026-05-31-playground-preview-annotations.md`

## Recent Implementation Commits

- `1257482 feat: improve playground chat preview contract`
  - Added SSE event separation for `status`, `assistant_text`, `prototype_done`, `error`, and `done`.
  - Moved HTML extraction to the server compatibility layer.
  - Kept chat responses focused on processing state, result summaries, and follow-up questions.
  - Added Preview status handling and variant-aware current HTML tracking.

- `d1749da feat: add playground preview annotations`
  - Added free-position Preview annotations.
  - Annotation coordinates are stored as phone-frame-relative percentages.
  - Markers render over the Preview while editor popovers render outside the iframe/phone layer to avoid breaking prototype UI.
  - Markers can be edited, deleted, and dragged.

## Implemented

- `/playground` two-panel chat and Preview experience.
- Context attachment modal for files/text.
- Server-side OpenAI streaming endpoint for prototype generation.
- Chat/Preview response split:
  - Chat shows status and natural-language messages.
  - Preview receives generated HTML/variants.
- Preview device modes:
  - iOS
  - AOS
  - mobile web
- Preview actions:
  - Copy HTML
  - Download HTML
- A/B/C variant display foundation.
- Partial-edit foundation:
  - Current active variant HTML can be sent as refine context.
- Preview annotation foundation:
  - Annotation add mode
  - `Esc` to exit add mode
  - Click to add note
  - Marker drag to reposition
  - Marker click to edit
  - Delete saved annotation
  - Active variant-specific annotation filtering

## Design Decisions

- Generated HTML is an internal artifact and should not appear in chat.
- Chat answers should summarize work performed and ask a natural follow-up question.
- Server-side fallback should sanitize invalid assistant copy such as "check the code below" or empty code fences.
- Annotation is coordinate-based in v1, not DOM-anchored.
- Annotation marker coordinates are stored relative to the phone frame, but editor UI is rendered in the Preview frame-area overlay so it is not clipped by the phone frame or iframe.
- Annotation persistence is intentionally not included yet.

## Known Limitations

- Annotation state is in-memory only and is lost on refresh.
- Annotations are not yet passed into `/api/playground` refine requests.
- Annotation markers are not anchored to iframe DOM elements.
- The current server still parses HTML from model text output as a compatibility layer; it is not yet using a structured schema/tool-call response.
- Full local build can fail if private/optional Bucketplace packages are not installed.

## Recommended Next Work

1. Persist annotations per variant in `localStorage`.
2. Add an "apply annotation" action that sends selected annotation text into chat/refine.
3. Add an annotation list or compact navigator for multiple notes.
4. Replace regex HTML extraction with structured model output when feasible.
5. Add visual regression/manual QA notes for Preview overlay interactions.

## Resume Prompt

Use this prompt when starting a new Codex session:

```text
Continue the Proto Playground work on branch `proto-beta-v.1`.
Read `docs/superpowers/playground-status.md` and the linked specs before changing code.
The latest focus was Chat/Preview response separation and Preview annotations.
```
