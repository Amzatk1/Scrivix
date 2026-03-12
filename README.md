# Scrivix

Scrivix is an AI-native workspace for serious documents. This scaffold establishes the first implementation pass:

- marketing site at `/`
- internal dashboard at `/dashboard`
- project browser at `/projects`
- template gallery at `/templates`
- new-project flow at `/projects/new`
- import flow at `/projects/import`
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
- mode-aware editor primitives for code and structured writing
- Tiptap-based hybrid editor for `.svx` documents
- editable document surface and derived preview
- import flow for pasted markdown, LaTeX, and prose drafts
- file-upload import for `.docx`, `.md`, `.tex`, and zipped LaTeX projects
- structure-preserving archive import for multi-file LaTeX workspaces
- bibliography import into the native source library
- citation insertion from the workspace source pane
- comment creation, resolve/reopen review workflow, and typed action queue with owner/due state in the workspace
- evidence-gap and citation-health signals in the trust pane
- right-side utility tabs for AI, sources, comments, trust, and history
- bottom build console
- API-backed project store persisted to `data/projects.json`
- compile action wired through a worker-backed build runner with `latexmk` detection and fallback analysis
- snapshot save, compare, and restore workflows in the history pane
- export profile selection and submission preflight checks in the workspace shell
- generated downloadable export artifacts through profile-aware HTML, PDF, DOCX, and ZIP outputs
- API-backed file creation from the workspace tree
- API-backed imported project creation
- branded landing and dashboard screens

## Next implementation priorities

1. Replace the filesystem-backed JSON store with a database-backed project model.
2. Expand the hybrid editor into a fuller semantic block system with citations, tables, and figures.
3. Expand the repair layer from deterministic patches into broader diff-reviewed agent workflows.
4. Add richer document styling controls and visual regression checks for generated PDF and DOCX exports.
