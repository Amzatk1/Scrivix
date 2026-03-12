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
- starter project creation flow
- project navigation and outline panes
- editor and preview split
- right-side utility tabs for AI, sources, comments, trust, and history
- bottom build console
- branded landing and dashboard screens

## Next implementation priorities

1. Replace static in-memory records with persisted project state and route-level loading.
2. Add real editor primitives for rich text and LaTeX/Markdown modes.
3. Implement project creation persistence, imports, and template instantiation.
4. Build the compile pipeline and AI diff-review architecture.
