# ODS Docs

ODS Docs is the source project for public ODS component, pattern, and foundation documentation.

This directory is intentionally kept as a standalone subproject inside `product-design`.

- `content/`: published ODS knowledge sources
- `references/`: Figma and token references used while authoring docs
- `scripts/`: local search, retrieval, and public-index generation tools
- `build/public-index/`: generated output, not committed

## Commands

```sh
npm ci
npm run build:public-index
npm test
```

`npm run build:public-index` writes:

```text
build/public-index/index.json
build/public-index/report.json
```

`product-design` GitHub Actions uses this generated `index.json` to open an ODS Hermes package update PR.

## Ownership Boundary

Treat this directory as the ODS documentation source of truth. Keep ODS Docs changes inside `ods-docs/` unless a task explicitly requires updating the packaged MCP runtime in `mcp-servers/ods-hermes/`.
