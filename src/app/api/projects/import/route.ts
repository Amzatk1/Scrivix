import { NextResponse } from "next/server";
import { createImportedProject } from "@/lib/server/project-store";
import type { ImportProjectInput } from "@/lib/project-utils";

function isImportProjectInput(value: unknown): value is ImportProjectInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const importedFiles = candidate.importedFiles;
  const importedFilesValid =
    importedFiles === undefined ||
    (Array.isArray(importedFiles) &&
      importedFiles.every(
        (file) =>
          file &&
          typeof file === "object" &&
          typeof (file as Record<string, unknown>).fileName === "string" &&
          typeof (file as Record<string, unknown>).content === "string",
      ));

  return (
    typeof candidate.title === "string" &&
    typeof candidate.subtitle === "string" &&
    typeof candidate.audience === "string" &&
    typeof candidate.templateSlug === "string" &&
    typeof candidate.mode === "string" &&
    typeof candidate.importFormat === "string" &&
    typeof candidate.documentText === "string" &&
    importedFilesValid
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isImportProjectInput(body)) {
    return NextResponse.json({ error: "Invalid import payload." }, { status: 400 });
  }

  const project = await createImportedProject(body);
  return NextResponse.json({ project }, { status: 201 });
}
