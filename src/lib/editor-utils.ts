import type { ProjectMode, ProjectFile, FileType } from "@/lib/product-data";

export type PreviewModel =
  | {
      kind: "structured";
      title: string;
      html: string;
    }
  | {
      kind: "text";
      paragraphs: string[];
    };

export function isStructuredDocument(projectMode: ProjectMode, fileName: string) {
  if (fileName.endsWith(".svx")) {
    return true;
  }

  return (projectMode === "hybrid" || projectMode === "rich") && !/\.(ya?ml|bib|tex)$/i.test(fileName);
}

export function isLikelyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function structuredTextToHtml(value: string) {
  const lines = value.split(/\r?\n/);
  const html: string[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) {
      return;
    }

    html.push(`<ul>${listBuffer.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listBuffer = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
      return;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      html.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      html.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith("# ")) {
      html.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
      return;
    }

    if (trimmed.startsWith("> ")) {
      html.push(`<blockquote><p>${escapeHtml(trimmed.slice(2))}</p></blockquote>`);
      return;
    }

    html.push(`<p>${escapeHtml(trimmed).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
  });

  flushList();

  return html.join("");
}

export function normalizeStructuredDocument(value: string) {
  if (!value.trim()) {
    return "<p></p>";
  }

  return isLikelyHtml(value) ? value : structuredTextToHtml(value);
}

export function sanitizePreviewHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
}

export function deriveTextPreview(document: string, fallbackTitle: string): string[] {
  const trimmed = document.trim();

  if (!trimmed) {
    return [fallbackTitle, "Start drafting in this document to see a live preview summary here."];
  }

  const latexMatch = trimmed.match(/\\section\{([^}]+)\}/);
  const markdownMatch = trimmed.match(/^#{1,3}\s+(.+)$/m);
  const title = latexMatch?.[1] ?? markdownMatch?.[1] ?? fallbackTitle;
  const cleaned = trimmed
    .replace(/\\section\{[^}]+\}/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\\subsection\{([^}]+)\}/g, "$1")
    .replace(/[`*_\\]/g, "")
    .trim();
  const bodyParagraphs = cleaned
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 2);

  return [title, ...bodyParagraphs];
}

export function buildPreviewModel(document: string, fileName: string, projectMode: ProjectMode): PreviewModel {
  if (isStructuredDocument(projectMode, fileName)) {
    const html = sanitizePreviewHtml(normalizeStructuredDocument(document));
    const titleMatch = html.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
    const title = titleMatch?.[1]?.replace(/<[^>]+>/g, "") ?? fileName;

    return {
      kind: "structured",
      title,
      html,
    };
  }

  return {
    kind: "text",
    paragraphs: deriveTextPreview(document, fileName),
  };
}

function inferFileType(fileName: string): FileType {
  if (fileName.endsWith("/")) {
    return "folder";
  }

  if (fileName.endsWith(".bib")) {
    return "bib";
  }

  if (fileName.endsWith(".yml") || fileName.endsWith(".yaml")) {
    return "config";
  }

  if (/\.(png|jpg|jpeg|svg|csv|pdf)$/i.test(fileName)) {
    return "asset";
  }

  return "file";
}

export function createFileRecord(fileName: string, existingFiles: ProjectFile[]) {
  const nextFiles = existingFiles.map((file) => ({
    ...file,
    active: false,
  }));

  nextFiles.push({
    name: fileName,
    type: inferFileType(fileName),
    active: true,
  });

  return nextFiles;
}

