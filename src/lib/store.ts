import { create } from 'zustand'

export type ViewMode = 'rich-text' | 'latex'

export interface AppFile {
  id: string
  name: string
  type: 'folder' | 'file'
  content: string
  richContent: string
  parentId?: string
}

const mockFiles: AppFile[] = [
  { id: 'f1', name: 'chapters', type: 'folder', content: '', richContent: '' },
  { 
    id: 'intro', 
    name: '01_introduction.tex', 
    type: 'file', 
    parentId: 'f1',
    content: '\\section{Introduction}\nThis is a mock document demonstrating the LaTeX mode in Scrivix.',
    richContent: '<h1>Introduction</h1><p>This is a mock document demonstrating the <strong>Rich Text mode</strong> in Scrivix.</p>'
  },
  { 
    id: 'method', 
    name: '02_methodology.tex', 
    type: 'file', 
    parentId: 'f1',
    content: '\\section{Methodology}\nWriters of complex documents spend over 40\\% of their time fighting formatting.',
    richContent: '<h2>Methodology</h2><p>Writers of complex documents spend over 40% of their time fighting formatting.</p>'
  },
  { id: 'f2', name: 'references', type: 'folder', content: '', richContent: '' },
  { id: 'bib', name: 'bibliography.bib', type: 'file', parentId: 'f2', content: '@article{smith2023, ...}', richContent: '' },
]

interface EditorState {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  
  files: AppFile[]
  activeFileId: string | null
  setActiveFileId: (id: string | null) => void
  updateFileContent: (id: string, newContent: string, newRichContent: string) => void

  // Panel state
  leftPanelOpen: boolean
  setLeftPanelOpen: (open: boolean) => void
  rightPanelOpen: boolean
  setRightPanelOpen: (open: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  viewMode: 'rich-text',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  files: mockFiles,
  activeFileId: 'intro',
  setActiveFileId: (id) => set({ activeFileId: id }),
  updateFileContent: (id, newContent, newRichContent) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, content: newContent, richContent: newRichContent } : f)
  })),

  leftPanelOpen: true,
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  rightPanelOpen: true,
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
}))

