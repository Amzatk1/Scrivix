# Scrivix

Scrivix is an AI-native workspace for serious documents. This scaffold establishes the first implementation pass:

- marketing site at `/`
- internal dashboard at `/dashboard`
- project browser at `/projects`
- template gallery at `/templates`
- new-project flow at `/projects/new`
- desktop-first editor workspace prototype at `/workspace/[projectSlug]`

## Stack

- Next.js App Router
- React + TypeScript
- Custom CSS design system

## Development

```bash
npm install
npm run dev
```

## Current scope

This first pass focuses on the product shell rather than backend systems:

- Overleaf-inspired workspace layout
- typed project and template records
- project browser and template gallery
- starter project creation flow with local persistence
- project navigation and outline panes
- editable document surface and derived preview
- right-side utility tabs for AI, sources, comments, trust, and history
- bottom build console
- API-backed project store persisted to `data/projects.json`
- branded landing and dashboard screens

## Next implementation priorities

1. Replace the filesystem-backed JSON store with a database-backed project model.
2. Add real editor primitives for rich text and LaTeX/Markdown modes.
3. Implement import flows and template instantiation beyond seeded records.
4. Build the compile pipeline and AI diff-review architecture.
