"use client";

import type { ProjectMode } from "@/lib/product-data";
import { CodeEditor } from "@/components/editor/code-editor";
import { StructuredEditor } from "@/components/editor/structured-editor";

export type ExternalInsertRequest = {
  id: string;
  text: string;
};

type DocumentEditorProps = {
  fileName: string;
  projectMode: ProjectMode;
  value: string;
  onChange: (value: string) => void;
  insertionRequest?: ExternalInsertRequest | null;
};

function shouldUseStructuredEditor(projectMode: ProjectMode, fileName: string) {
  if (projectMode === "hybrid" || projectMode === "rich") {
    return !/\.(ya?ml|bib|tex|csv|png|jpe?g|svg|pdf)$/i.test(fileName);
  }

  return fileName.endsWith(".svx");
}

export function DocumentEditor({ fileName, projectMode, value, onChange, insertionRequest }: DocumentEditorProps) {
  if (shouldUseStructuredEditor(projectMode, fileName)) {
    return (
      <StructuredEditor
        fileName={fileName}
        insertionRequest={insertionRequest}
        onChange={onChange}
        value={value}
      />
    );
  }

  return (
    <CodeEditor
      fileName={fileName}
      insertionRequest={insertionRequest}
      onChange={onChange}
      value={value}
    />
  );
}
