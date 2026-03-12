"use client"

import { useEditorStore } from '@/lib/store'
import { File, Play } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'
import { CodeEditor } from './CodeEditor'
import { useMemo } from 'react'

export function EditorCanvas() {
  const { viewMode, setViewMode, activeFileId, files } = useEditorStore()

  // Find the active file
  const activeFile = useMemo(() => files.find(f => f.id === activeFileId), [files, activeFileId])
  const folder = useMemo(() => files.find(f => f.id === activeFile?.parentId), [files, activeFile])

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col h-screen min-w-0 bg-background items-center justify-center">
        <p className="text-muted-foreground text-sm">Select a file from the Project Navigator</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-screen min-w-0 bg-background">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background z-10 w-full">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-muted-foreground truncate max-w-[200px] md:max-w-none">
          {folder && (
            <>
              <span className="truncate">{folder.name}</span>
              <span className="mx-2 shrink-0">/</span>
            </>
          )}
          <span className="text-foreground font-medium flex items-center truncate">
            <File className="w-4 h-4 mr-1.5 text-muted-foreground shrink-0" />
            <span className="truncate">{activeFile.name}</span>
          </span>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3 shrink-0 ml-4">
          <div className="flex bg-muted/50 p-1 rounded-md border border-border">
            <button 
              onClick={() => setViewMode('rich-text')}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${viewMode === 'rich-text' ? 'bg-background shadow font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Rich Text
            </button>
            <button 
              onClick={() => setViewMode('latex')}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${viewMode === 'latex' ? 'bg-background shadow font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              LaTeX
            </button>
          </div>

          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium flex items-center shadow-sm whitespace-nowrap hidden sm:flex">
            <Play className="w-4 h-4 mr-1.5" />
            Compile PDF
          </button>
        </div>
      </div>

      {/* Main Editor Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto">
          {viewMode === 'rich-text' ? <RichTextEditor activeFile={activeFile} /> : <CodeEditor activeFile={activeFile} />}
        </div>
      </div>
    </div>
  )
}
