"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { AppFile, useEditorStore } from '@/lib/store'
import { useEffect } from 'react'

interface Props {
  activeFile: AppFile
}

export function RichTextEditor({ activeFile }: Props) {
  const { updateFileContent } = useEditorStore()

  const editor = useEditor({
    extensions: [StarterKit],
    content: activeFile.richContent,
    onUpdate: ({ editor }) => {
      updateFileContent(activeFile.id, activeFile.content, editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[500px] font-serif',
      },
    },
  })

  // Sync content when active file changes
  useEffect(() => {
    if (editor && editor.getHTML() !== activeFile.richContent) {
      editor.commands.setContent(activeFile.richContent)
    }
  }, [activeFile.id, activeFile.richContent, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <EditorContent editor={editor} />
    </div>
  )
}
