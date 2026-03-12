import { getTemplateBySlug, type ExportArtifact, type ExportProfile, type ProjectRecord } from "@/lib/product-data";
import { isLikelyHtml, sanitizePreviewHtml } from "@/lib/editor-utils";

export type ExportDocumentSection = {
  fileName: string;
  paragraphs: string[];
};

function stripLatex(value: string) {
  return value
    .replace(/\\(section|subsection|subsubsection)\{([^}]+)\}/g, "\n\n$2\n")
    .replace(/\\cite[a-zA-Z*]*\{([^}]+)\}/g, "[$1]")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^}]*\})?/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function stripMarkdown(value: string) {
  return value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[@([A-Za-z0-9:_-]+)\]/g, "[$1]")
    .replace(/\[cite:([A-Za-z0-9:_-]+)\]/g, "[$1]")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function getSectionParagraphs(fileName: string, content: string) {
  if (fileName.endsWith(".bib") || /\.(png|jpe?g|svg|pdf|ya?ml|json|cls|sty|bst)$/i.test(fileName)) {
    return [];
  }

  if (isLikelyHtml(content)) {
    return sanitizePreviewHtml(content)
      .replace(/<\/(p|h1|h2|h3|blockquote|li|ul|ol)>/gi, "\n\n")
      .replace(/<li>/gi, "• ")
      .replace(/<[^>]+>/g, " ")
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  const normalizedText = fileName.endsWith(".tex") ? stripLatex(content) : stripMarkdown(content);

  return normalizedText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function buildExportDocumentSections(project: ProjectRecord) {
  return project.workspace.files
    .filter((file) => file.type !== "folder")
    .map((file) => ({
      fileName: file.name,
      paragraphs: getSectionParagraphs(file.name, project.workspace.documents[file.name] ?? ""),
    }))
    .filter((section) => section.paragraphs.length > 0);
}

function renderDocumentSection(section: ExportDocumentSection) {
  const paragraphs = section.paragraphs
    .map((paragraph) => `<p>${paragraph.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");

  return `<section><h2>${section.fileName}</h2>${paragraphs}</section>`;
}

export function renderProjectExportHtml(project: ProjectRecord, profile: ExportProfile) {
  const sections = buildExportDocumentSections(project)
    .map((section) => renderDocumentSection(section))
    .join("\n");
  const template = getTemplateBySlug(project.templateSlug);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${project.title} · ${profile.label}</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; font-family: "Iowan Old Style", "Palatino Linotype", serif; background: #f5f1e8; color: #1f2b33; }
      main { max-width: 920px; margin: 0 auto; padding: 56px 32px 72px; }
      header { margin-bottom: 36px; padding-bottom: 24px; border-bottom: 1px solid rgba(31, 43, 51, 0.12); }
      h1, h2 { font-family: "Iowan Old Style", "Palatino Linotype", serif; }
      h1 { margin: 0 0 8px; font-size: 2.3rem; }
      h2 { margin-top: 32px; font-size: 1.3rem; }
      p, li { line-height: 1.72; }
      .meta { color: #55636d; font-size: 0.96rem; }
      .callout { margin-top: 18px; padding: 16px 18px; border-radius: 18px; background: rgba(39, 91, 116, 0.08); }
      section + section { margin-top: 28px; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="meta">${template?.title ?? project.templateSlug} · ${profile.label}</p>
        <h1>${project.title}</h1>
        <p class="meta">${project.subtitle} · ${project.audience}</p>
        <div class="callout">
          <strong>Scrivix export preview</strong>
          <p>This export was generated from the current workspace state for the ${profile.label} profile.</p>
        </div>
      </header>
      ${sections || "<p>No exportable document content was found in this project.</p>"}
    </main>
  </body>
</html>`;
}

export function formatArtifactSize(byteLength: number) {
  if (byteLength < 1024) {
    return `${byteLength} B`;
  }

  if (byteLength < 1024 * 1024) {
    return `${(byteLength / 1024).toFixed(1)} KB`;
  }

  return `${(byteLength / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildExportArtifactRecord(args: {
  id: string;
  profile: ExportProfile;
  outputFormat: "pdf" | "docx" | "html" | "zip";
  fileName: string;
  downloadPath: string;
  createdAt: string;
  byteLength: number;
  summary: string;
}): ExportArtifact {
  return {
    id: args.id,
    label: `${args.profile.label} export`,
    profileId: args.profile.id,
    profileLabel: args.profile.label,
    targetFormat: args.profile.format,
    outputFormat: args.outputFormat,
    fileName: args.fileName,
    downloadPath: args.downloadPath,
    createdAt: args.createdAt,
    sizeLabel: formatArtifactSize(args.byteLength),
    summary: args.summary,
  };
}
