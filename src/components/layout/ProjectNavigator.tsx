"use client"

import { FileText, Folder, Settings, Search, ChevronRight, ChevronDown } from 'lucide-react'
import { useEditorStore } from '@/lib/store'

export function ProjectNavigator() {
  const { files, activeFileId, setActiveFileId } = useEditorStore()

  // Simple rendering logic for our mock tree
  const folders = files.filter(f => f.type === 'folder')
  
  return (
    <div className="w-full h-full border-r border-border bg-muted/30 flex flex-col">
      <div className="h-14 border-b border-border flex items-center px-4 justify-between shrink-0">
        <h2 className="font-semibold text-sm">Scrivix Project</h2>
        <Settings className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full bg-background border border-input rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          {folders.map(folder => {
            const folderFiles = files.filter(f => f.parentId === folder.id)
            return (
              <div key={folder.id} className="mb-2">
                <div className="flex items-center space-x-1 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm text-foreground/80 font-medium select-none">
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  <Folder className="w-4 h-4 text-blue-500" />
                  <span>{folder.name}</span>
                </div>
                <div className="ml-3 space-y-0.5 mt-0.5 border-l border-border/50 pl-2">
                  {folderFiles.map(file => (
                    <div 
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      className={`flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer text-sm select-none transition-colors
                        ${activeFileId === file.id ? 'bg-accent/80 text-foreground font-medium' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
