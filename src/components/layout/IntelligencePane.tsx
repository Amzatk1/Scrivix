"use client"

import { MessageSquare, BookOpen, Activity, ArrowRight, Check, X } from 'lucide-react'
import { useState } from 'react'
import { useEditorStore } from '@/lib/store'

export function IntelligencePane() {
  const { activeFileId, files, updateFileContent, setViewMode } = useEditorStore()
  const [patchVisible, setPatchVisible] = useState(false)

  const activeFile = files.find(f => f.id === activeFileId)

  const handleSuggestPatch = () => {
    setPatchVisible(true)
  }

  const handleAcceptPatch = () => {
    if (!activeFile) return
    
    // Hardcoded mock fix for the methodology section
    const newContent = activeFile.content.replace(
      'over 40\\% of their time fighting formatting.', 
      'over 40\\% of their time resolving complex formatting and compile errors.'
    )
    const newRichContent = activeFile.richContent.replace(
      'fighting formatting.', 
      'resolving complex formatting and compile errors.'
    )
    
    updateFileContent(activeFile.id, newContent, newRichContent)
    setPatchVisible(false)
  }

  return (
    <div className="w-full h-full border-l border-border bg-muted/10 flex flex-col">
      <div className="h-14 border-b border-border flex items-center px-2 shrink-0 space-x-1">
        <button className="flex-1 py-1.5 text-xs font-medium bg-background border border-border rounded shadow-sm text-foreground flex justify-center items-center space-x-1">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Copilot</span>
        </button>
        <button className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded flex justify-center items-center space-x-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Sources</span>
        </button>
        <button className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded flex justify-center items-center space-x-1">
          <Activity className="w-3.5 h-3.5" />
          <span>Trust</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs text-primary font-bold">✨</span>
              </div>
              <span className="text-sm font-semibold">Scrivix Agent</span>
            </div>

            <div className="bg-muted border border-border p-3 rounded-md text-sm text-foreground/90 leading-relaxed shadow-sm">
              I noticed you're working on <span className="font-mono text-xs bg-background px-1 py-0.5 rounded border border-border">{activeFile?.name || 'a file'}</span>. 
              {activeFileId === 'method' && !patchVisible && (
                <div className="mt-3">
                  <p className="text-muted-foreground mb-2">The transition in your first paragraph is a bit abrupt. Would you like me to refine it to sound more academic?</p>
                  <button 
                    onClick={handleSuggestPatch}
                    className="flex items-center text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded transition-colors"
                  >
                    Suggest Patch <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              )}

              {patchVisible && (
                <div className="mt-4 border border-blue-500/30 rounded-md overflow-hidden bg-background">
                  <div className="bg-blue-500/10 px-3 py-1.5 border-b border-blue-500/20 flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Proposed Diff</span>
                  </div>
                  <div className="p-3 text-xs font-mono">
                    <div className="text-red-500/80 line-through mb-1">- fighting formatting.</div>
                    <div className="text-green-500/90 bg-green-500/10 px-1 rounded inline-block">+ resolving complex formatting and compile errors.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-[1px] bg-border border-t border-border">
                    <button 
                      onClick={() => setPatchVisible(false)}
                      className="bg-background py-2 text-xs font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Reject
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode('rich-text')
                        handleAcceptPatch()
                      }}
                      className="bg-background py-2 text-xs font-medium text-primary hover:bg-green-500/10 hover:text-green-500 flex items-center justify-center transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Accept
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-auto relative">
          <input 
            type="text" 
            placeholder="Ask Cmd+K to edit or chat..." 
            className="w-full bg-background border border-border shadow-sm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>
    </div>
  )
}
