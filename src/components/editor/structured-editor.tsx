"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { ExternalInsertRequest } from "@/components/editor/document-editor";
import { normalizeStructuredDocument } from "@/lib/editor-utils";

type StructuredEditorProps = {
  fileName: string;
  value: string;
  onChange: (value: string) => void;
  insertionRequest?: ExternalInsertRequest | null;
};

export function StructuredEditor({ fileName, value, onChange, insertionRequest }: StructuredEditorProps) {
  const normalizedContent = normalizeStructuredDocument(value);
  const lastInsertionIdRef = useRef<string | null>(null);
  const editor = useEditor({
    extensions: [StarterKit],
    content: normalizedContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "structured-prosemirror",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();
    if (currentHtml !== normalizedContent) {
      editor.commands.setContent(normalizedContent, { emitUpdate: false });
    }
  }, [editor, normalizedContent]);

  useEffect(() => {
    if (!editor || !insertionRequest || lastInsertionIdRef.current === insertionRequest.id) {
      return;
    }

    editor.chain().focus().insertContent(` ${insertionRequest.text}`).run();
    lastInsertionIdRef.current = insertionRequest.id;
  }, [editor, insertionRequest]);

  return (
    <div className="structured-editor-shell">
      <div className="structured-editor-shell__header">
        <div className="code-editor-shell__meta">
          <span className="editor-kind-badge editor-kind-badge--structured">Structured editor</span>
          <span className="quiet-label">{fileName}</span>
        </div>
        <div className="structured-toolbar">
          <button
            className={editor?.isActive("heading", { level: 2 }) ? "structured-action structured-action--active" : "structured-action"}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            type="button"
          >
            H2
          </button>
          <button
            className={editor?.isActive("bold") ? "structured-action structured-action--active" : "structured-action"}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            type="button"
          >
            Bold
          </button>
          <button
            className={editor?.isActive("bulletList") ? "structured-action structured-action--active" : "structured-action"}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            type="button"
          >
            Bullet
          </button>
          <button
            className={editor?.isActive("blockquote") ? "structured-action structured-action--active" : "structured-action"}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            type="button"
          >
            Quote
          </button>
          <button className="structured-action" onClick={() => editor?.chain().focus().undo().run()} type="button">
            Undo
          </button>
          <button className="structured-action" onClick={() => editor?.chain().focus().redo().run()} type="button">
            Redo
          </button>
        </div>
      </div>

      <div className="structured-editor-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
