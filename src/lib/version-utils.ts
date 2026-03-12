import type { ProjectFile, WorkspaceRecord } from "@/lib/product-data";

export type VersionSnapshot = {
  id: string;
  label: string;
  createdAt: string;
  currentFile: string;
  files: ProjectFile[];
  documents: Record<string, string>;
};

function cloneFiles(files: ProjectFile[]) {
  return files.map((file) => ({ ...file }));
}

function cloneDocuments(documents: Record<string, string>) {
  return Object.fromEntries(Object.entries(documents).map(([fileName, content]) => [fileName, content]));
}

function slugifySnapshotLabel(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function buildVersionSnapshot(
  workspace: Pick<WorkspaceRecord, "currentFile" | "files" | "documents">,
  label: string,
  createdAt: string,
  explicitId?: string,
): VersionSnapshot {
  const id = explicitId ?? `${slugifySnapshotLabel(label) || "snapshot"}-${Object.keys(workspace.documents).length}`;

  return {
    id,
    label,
    createdAt,
    currentFile: workspace.currentFile,
    files: cloneFiles(workspace.files),
    documents: cloneDocuments(workspace.documents),
  };
}

export function ensureVersionSnapshots(
  workspace: Pick<WorkspaceRecord, "currentFile" | "files" | "documents" | "history" | "versionSnapshots">,
) {
  if (workspace.versionSnapshots && workspace.versionSnapshots.length > 0) {
    return workspace.versionSnapshots.map((snapshot) => ({
      ...snapshot,
      files: cloneFiles(snapshot.files),
      documents: cloneDocuments(snapshot.documents),
    }));
  }

  return [
    buildVersionSnapshot(
      workspace,
      "Baseline snapshot",
      workspace.history.at(-1)?.meta ?? "Current workspace",
      "baseline-snapshot",
    ),
  ];
}
