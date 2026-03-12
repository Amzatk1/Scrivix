"use client"

import Editor from '@monaco-editor/react'
import { AppFile, useEditorStore } from '@/lib/store'
import { useEffect, useState } from 'react'

interface Props {
  activeFile: AppFile
}

export function CodeEditor({ activeFile }: Props) {
  const { updateFileContent } = useEditorStore()
  
  // Local state to prevent cursor jumps while typing, sync with store occasionally or on blur
  const [value, setValue] = useState(activeFile.content)

  // When activeFileId changes from the outside, update local value
  useEffect(() => {
    setValue(activeFile.content)
  }, [activeFile.id, activeFile.content])

  const handleChange = (newVal: string | undefined) => {
    setValue(newVal || '')
    updateFileContent(activeFile.id, newVal || '', activeFile.richContent)
  }

  return (
    <div className="h-full w-full bg-background pt-4">
      <Editor
        height="100%"
        language="latex" // Simplified for MVP, auto-detect could be added later based on extension
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          lineNumbersMinChars: 4,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        }}
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
