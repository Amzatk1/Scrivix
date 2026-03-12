"use client";

import { useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { yaml } from "@codemirror/lang-yaml";
import { html } from "@codemirror/lang-html";
import { StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import type { ExternalInsertRequest } from "@/components/editor/document-editor";

type CodeEditorProps = {
  fileName: string;
  value: string;
  onChange: (value: string) => void;
  insertionRequest?: ExternalInsertRequest | null;
};

function extensionsForFile(fileName: string) {
  if (fileName.endsWith(".md")) {
    return [markdown()];
  }

  if (fileName.endsWith(".yml") || fileName.endsWith(".yaml")) {
    return [yaml()];
  }

  if (fileName.endsWith(".html")) {
    return [html()];
  }

  if (fileName.endsWith(".tex") || fileName.endsWith(".bib")) {
    return [StreamLanguage.define(stex)];
  }

  return [markdown()];
}

export function CodeEditor({ fileName, value, onChange, insertionRequest }: CodeEditorProps) {
  const editorViewRef = useRef<{
    dispatch: (transaction: {
      changes: { from: number; to: number; insert: string };
      selection: { anchor: number };
      scrollIntoView: boolean;
    }) => void;
    state: {
      selection: {
        main: {
          from: number;
          to: number;
        };
      };
    };
  } | null>(null);
  const lastInsertionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!insertionRequest || !editorViewRef.current || lastInsertionIdRef.current === insertionRequest.id) {
      return;
    }

    const view = editorViewRef.current;
    const { from, to } = view.state.selection.main;
    const insertValue = from === 0 ? `${insertionRequest.text} ` : ` ${insertionRequest.text}`;

    view.dispatch({
      changes: {
        from,
        to,
        insert: insertValue,
      },
      selection: {
        anchor: from + insertValue.length,
      },
      scrollIntoView: true,
    });

    lastInsertionIdRef.current = insertionRequest.id;
  }, [insertionRequest]);

  return (
    <div className="code-editor-shell">
      <div className="code-editor-shell__meta">
        <span className="editor-kind-badge">Code editor</span>
        <span className="quiet-label">{fileName}</span>
      </div>
      <CodeMirror
        basicSetup={{
          foldGutter: true,
          highlightActiveLine: true,
          lineNumbers: true,
        }}
        className="scrivix-codemirror"
        extensions={extensionsForFile(fileName)}
        onChange={onChange}
        onCreateEditor={(view) => {
          editorViewRef.current = view as typeof editorViewRef.current;
        }}
        value={value}
      />
    </div>
  );
}
