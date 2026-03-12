import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getProjectExportArtifact } from "@/lib/server/project-store";

type RouteContext = {
  params: Promise<{
    artifactId: string;
    projectSlug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { artifactId, projectSlug } = await context.params;
  const result = await getProjectExportArtifact(projectSlug, artifactId);

  if (!result) {
    return NextResponse.json({ error: "Export artifact not found." }, { status: 404 });
  }

  const contents = await readFile(result.absolutePath);
  const contentType =
    result.artifact.outputFormat === "html"
      ? "text/html; charset=utf-8"
      : result.artifact.outputFormat === "pdf"
        ? "application/pdf"
        : result.artifact.outputFormat === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/zip";

  return new NextResponse(contents, {
    headers: {
      "Content-Disposition": `attachment; filename="${result.artifact.fileName}"`,
      "Content-Type": contentType,
    },
  });
}
