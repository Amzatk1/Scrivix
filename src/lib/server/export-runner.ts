import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import JSZip from "jszip";
import type { ExportProfile, ProjectRecord } from "@/lib/product-data";
import {
  buildExportArtifactRecord,
  buildExportDocumentSections,
  renderProjectExportHtml,
} from "@/lib/export-utils";

const execFileAsync = promisify(execFile);

export async function generateProjectArtifactFile(args: {
  exportDirectory: string;
  profile: ExportProfile;
  project: ProjectRecord;
  timestamp: string;
}) {
  const { exportDirectory, profile, project, timestamp } = args;
  const artifactId = randomUUID();
  const projectExportDirectory = path.join(exportDirectory, project.slug);
  await mkdir(projectExportDirectory, { recursive: true });
  const exportHtml = renderProjectExportHtml(project, profile);

  if (profile.format === "html") {
    const fileName = `${artifactId}.html`;
    const artifactPath = path.join(projectExportDirectory, fileName);
    await writeFile(artifactPath, exportHtml, "utf8");

    return buildExportArtifactRecord({
      id: artifactId,
      profile,
      outputFormat: "html",
      fileName,
      downloadPath: `${project.slug}/${fileName}`,
      createdAt: timestamp,
      byteLength: Buffer.byteLength(exportHtml, "utf8"),
      summary: `Generated a standalone HTML export for ${profile.label}.`,
    });
  }

  if (profile.format === "zip") {
    const fileName = `${artifactId}.zip`;
    const zip = new JSZip();
    zip.file("preview.html", exportHtml);
    zip.file(
      "manifest.json",
      JSON.stringify(
        {
          project: project.title,
          subtitle: project.subtitle,
          profile: profile.label,
          targetFormat: profile.format,
          generatedAt: timestamp,
          note: "This package contains source files and an HTML preview.",
        },
        null,
        2,
      ),
    );

    Object.entries(project.workspace.documents).forEach(([documentFileName, content]) => {
      zip.file(`source/${documentFileName}`, content);
    });

    const artifactBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const artifactPath = path.join(projectExportDirectory, fileName);
    await writeFile(artifactPath, artifactBuffer);

    return buildExportArtifactRecord({
      id: artifactId,
      profile,
      outputFormat: "zip",
      fileName,
      downloadPath: `${project.slug}/${fileName}`,
      createdAt: timestamp,
      byteLength: artifactBuffer.byteLength,
      summary: "Generated a downloadable source archive with preview and manifest.",
    });
  }

  const manifest = {
    title: project.title,
    subtitle: project.subtitle,
    audience: project.audience,
    profile_id: profile.id,
    profile_label: profile.label,
    profile_format: profile.format,
    sections: buildExportDocumentSections(project),
  };
  const manifestPath = path.join(projectExportDirectory, `${artifactId}.json`);
  const extension = profile.format === "pdf" ? "pdf" : "docx";
  const fileName = `${artifactId}.${extension}`;
  const artifactPath = path.join(projectExportDirectory, fileName);
  const pythonPath = path.join(process.cwd(), ".venv-export", "bin", "python");
  const scriptPath = path.join(process.cwd(), "scripts", "export_document.py");

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  await execFileAsync(pythonPath, [scriptPath, manifestPath, extension, artifactPath], {
    timeout: 20_000,
  });

  const artifactStats = await stat(artifactPath);

  return buildExportArtifactRecord({
    id: artifactId,
    profile,
    outputFormat: extension,
    fileName,
    downloadPath: `${project.slug}/${fileName}`,
    createdAt: timestamp,
    byteLength: artifactStats.size,
    summary: `Generated a ${extension.toUpperCase()} export for ${profile.label}.`,
  });
}
