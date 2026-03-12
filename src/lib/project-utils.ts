import {
  getTemplateBySlug,
  projects as seedProjects,
  templates,
  type ActionItem,
  type BuildMessage,
  type FileType,
  type OutlineSection,
  type ProjectMode,
  type ProjectFile,
  type ProjectRecord,
  type SearchHit,
  type SourceCard,
} from "@/lib/product-data";
import { applyWorkspaceIntelligence } from "@/lib/document-intelligence";
import { isStructuredDocument, normalizeStructuredDocument } from "@/lib/editor-utils";

export type CreateProjectInput = {
  title: string;
  subtitle: string;
  audience: string;
  templateSlug: string;
  mode: ProjectMode;
  summary?: string;
};

export type ImportFormat = "latex" | "markdown" | "plain";

export type ImportedTextFile = {
  fileName: string;
  content: string;
};

export type ImportProjectInput = CreateProjectInput & {
  importFormat: ImportFormat;
  documentText: string;
  bibliographyText?: string;
  importedFiles?: ImportedTextFile[];
  importSourceLabel?: string;
  notesText?: string;
};

export function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function ensureUniqueSlug(title: string, existingProjects: ProjectRecord[]) {
  const base = slugify(title) || "untitled-project";
  let candidate = base;
  let suffix = 2;

  while (existingProjects.some((project) => project.slug === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function fallbackDocumentForFile(fileName: string) {
  if (fileName.endsWith(".bib")) {
    return `@misc{newsource,\n  title = {New Source},\n  year = {2026}\n}`;
  }

  if (fileName.endsWith(".yml") || fileName.endsWith(".yaml")) {
    return "profile: default\noutput: pdf";
  }

  if (fileName.endsWith(".md")) {
    return `# ${fileName}\n\nStart drafting here.`;
  }

  if (fileName.endsWith(".tex")) {
    return `\\section{New Section}\n\nStart drafting here.`;
  }

  if (fileName.endsWith(".svx")) {
    return "<h2>New Section</h2><p>Start drafting here.</p>";
  }

  return `Start drafting in ${fileName}.`;
}

export function buildProjectFromTemplate(input: CreateProjectInput, existingProjects: ProjectRecord[]) {
  const template = getTemplateBySlug(input.templateSlug) ?? templates[0];
  const baseProject =
    cloneRecord(existingProjects.find((project) => project.templateSlug === template.slug) ?? seedProjects[0]);
  const slug = ensureUniqueSlug(input.title, existingProjects);
  const title = input.title.trim() || template.title;
  const subtitle = input.subtitle.trim() || template.title;
  const audience = input.audience.trim() || template.audience;

  baseProject.slug = slug;
  baseProject.title = title;
  baseProject.subtitle = subtitle;
  baseProject.summary = input.summary?.trim() || template.description;
  baseProject.templateSlug = template.slug;
  baseProject.status = input.mode === "latex" ? "Ready to compile" : "Draft ready";
  baseProject.statusTone = "good";
  baseProject.meta = "Stored in workspace";
  baseProject.stage = "Initial draft";
  baseProject.dueLabel = "No deadline set";
  baseProject.audience = audience;
  baseProject.mode = input.mode;
  baseProject.queue = [
    {
      id: `queue-${slug}-1`,
      label: "Review the starter structure",
      status: "open",
      sourceType: "seed",
      owner: "You",
      dueLabel: "Today",
    },
    {
      id: `queue-${slug}-2`,
      label: "Import sources or notes",
      status: "open",
      sourceType: "seed",
      owner: "You",
      dueLabel: "This week",
    },
    {
      id: `queue-${slug}-3`,
      label: "Draft the first section before export",
      status: "open",
      sourceType: "seed",
      owner: "You",
      dueLabel: "Before export",
    },
  ];
  baseProject.workspace.defaultMode = "Draft";
  baseProject.workspace.compileStatus = baseProject.status;
  baseProject.workspace.compileTone = "good";
  baseProject.workspace.lastExport = "Not exported";
  baseProject.workspace.currentFile =
    baseProject.workspace.files.find((file) => file.type !== "folder")?.name ?? baseProject.workspace.currentFile;
  baseProject.workspace.files = baseProject.workspace.files.map((file) => ({
    ...file,
    active: file.name === baseProject.workspace.currentFile,
  }));
  baseProject.workspace.documents = Object.fromEntries(
    baseProject.workspace.files
      .filter((file) => file.type !== "folder")
      .map((file) => {
        const existingDocument = baseProject.workspace.documents[file.name];

        if (!existingDocument) {
          return [file.name, fallbackDocumentForFile(file.name)] as const;
        }

        if (isStructuredDocument(input.mode, file.name) && !existingDocument.trim().startsWith("<")) {
          return [file.name, normalizeStructuredDocument(existingDocument)] as const;
        }

        return [file.name, existingDocument] as const;
      }),
  );

  return applyWorkspaceIntelligence(baseProject);
}

function extractLatexHeadings(content: string) {
  return Array.from(content.matchAll(/\\(?:sub)*section\{([^}]+)\}/g))
    .map((match) => match[1]?.trim())
    .filter(Boolean) as string[];
}

function extractMarkdownHeadings(content: string) {
  return Array.from(content.matchAll(/^#{1,3}\s+(.+)$/gm))
    .map((match) => match[1]?.trim())
    .filter(Boolean) as string[];
}

function extractHtmlHeadings(content: string) {
  return Array.from(content.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi))
    .map((match) => match[1]?.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

function deriveOutline(content: string, format: ImportFormat, mode: ProjectMode): OutlineSection[] {
  const headings =
    format === "latex"
      ? extractLatexHeadings(content)
      : mode === "hybrid" || mode === "rich"
        ? extractHtmlHeadings(normalizeStructuredDocument(content))
        : extractMarkdownHeadings(content);

  if (headings.length > 0) {
    return headings.slice(0, 6).map((heading, index) => ({
      title: heading,
      note: index === 0 ? "Imported section" : "Imported heading",
    }));
  }

  const firstParagraph = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .find(Boolean);

  return [
    {
      title: firstParagraph?.slice(0, 48) || "Imported draft",
      note: "Imported document",
    },
  ];
}

function deriveSearchHits(content: string, outline: OutlineSection[], bibliographyText?: string): SearchHit[] {
  const keywords = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 6);
  const topKeywords = Array.from(new Set(keywords)).slice(0, 3);
  const bibliographyCount = (bibliographyText?.match(/@\w+\{/g) ?? []).length;

  return [
    ...outline.slice(0, 2).map((section) => ({
      term: section.title,
      summary: "Imported section heading",
    })),
    ...topKeywords.map((keyword) => ({
      term: keyword,
      summary: bibliographyCount > 0 ? `Imported draft with ${bibliographyCount} bibliography entr${bibliographyCount === 1 ? "y" : "ies"}` : "Imported draft keyword",
    })),
  ].slice(0, 5);
}

function parseBibTeXSources(bibliographyText: string): SourceCard[] {
  const entries = Array.from(bibliographyText.matchAll(/@(\w+)\{([^,\s]+),([\s\S]*?)\n\}/g));

  return entries.slice(0, 12).map((entry, index) => {
    const [, entryType, citationKey, body] = entry;
    const title = body.match(/title\s*=\s*[{"]([^}"]+)/i)?.[1]?.trim() || `Imported source ${index + 1}`;
    const author = body.match(/author\s*=\s*[{"]([^}"]+)/i)?.[1]?.trim() || "";
    const year = body.match(/year\s*=\s*[{"]([^}"]+)/i)?.[1]?.trim() || "";

    return {
      id: `imported-source-${citationKey}`,
      title,
      detail: [author, year, `Imported ${entryType}`].filter(Boolean).join(" · "),
      state: "Uncited",
      citationKey,
      sourceType: entryType.toLowerCase() === "article" ? "article" : "report",
      linkedFiles: [],
      author,
      year,
    };
  });
}

function normalizeImportedFiles(importedFiles: ImportedTextFile[]) {
  const fileMap = new Map<string, string>();

  importedFiles.forEach((file) => {
    const normalizedName = file.fileName
      .replace(/\\/g, "/")
      .replace(/^\.\/+/, "")
      .replace(/^\/+/, "")
      .trim();

    if (!normalizedName || !file.content.trim()) {
      return;
    }

    fileMap.set(normalizedName, file.content);
  });

  return Array.from(fileMap.entries())
    .map(([fileName, content]) => ({ fileName, content }))
    .sort((left, right) => left.fileName.localeCompare(right.fileName));
}

function inferImportedFileType(fileName: string): FileType {
  if (fileName.endsWith(".bib")) {
    return "bib";
  }

  if (/\.(cls|sty|bst|ya?ml|json)$/i.test(fileName)) {
    return "config";
  }

  if (/\.(png|jpe?g|svg|pdf)$/i.test(fileName)) {
    return "asset";
  }

  return fileName.includes("/") ? "file" : "root";
}

function selectPrimaryImportedFile(importedFiles: ImportedTextFile[]) {
  const mainFile = importedFiles.find((file) => file.fileName === "main.tex");

  if (mainFile) {
    return mainFile.fileName;
  }

  const documentRoot = importedFiles.find(
    (file) => file.fileName.endsWith(".tex") && /\\documentclass|\\begin\{document\}/.test(file.content),
  );

  if (documentRoot) {
    return documentRoot.fileName;
  }

  return (
    importedFiles.find((file) => file.fileName.endsWith(".tex"))?.fileName ??
    importedFiles[0]?.fileName ??
    "main.tex"
  );
}

function buildFileTreeFromDocuments(documents: Record<string, string>, currentFile: string) {
  const documentNames = Object.keys(documents);
  const folderNames = new Set<string>();

  documentNames.forEach((fileName) => {
    const segments = fileName.split("/");

    for (let index = 1; index < segments.length; index += 1) {
      folderNames.add(`${segments.slice(0, index).join("/")}/`);
    }
  });

  const folders = Array.from(folderNames)
    .sort((left, right) => {
      const depthDelta = left.split("/").length - right.split("/").length;
      return depthDelta === 0 ? left.localeCompare(right) : depthDelta;
    })
    .map((name) => ({ name, type: "folder" as const }));
  const files = documentNames
    .sort((left, right) => {
      if (left === "main.tex") {
        return -1;
      }

      if (right === "main.tex") {
        return 1;
      }

      return left.localeCompare(right);
    })
    .map((name) => ({
      name,
      type: inferImportedFileType(name),
      active: name === currentFile,
    }));

  return [...files.filter((file) => file.type === "root"), ...folders, ...files.filter((file) => file.type !== "root")];
}

function buildImportedDocuments(input: ImportProjectInput) {
  const trimmedDocument = input.documentText.trim();
  const bibliographyText = input.bibliographyText?.trim() ?? "";
  const notesText = input.notesText?.trim() ?? "";
  const importedFiles = normalizeImportedFiles(input.importedFiles ?? []);

  if (input.mode === "latex" && importedFiles.length > 0) {
    const documents = Object.fromEntries(importedFiles.map((file) => [file.fileName, file.content]));
    const hasBibliographyFile = importedFiles.some((file) => file.fileName.endsWith(".bib"));
    const currentFile = selectPrimaryImportedFile(importedFiles);

    if (bibliographyText && !hasBibliographyFile) {
      documents["references.bib"] = bibliographyText;
    }

    if (notesText) {
      documents["import-notes.md"] = `# Import notes\n\n${notesText}`;
    }

    return {
      currentFile,
      documents,
      files: buildFileTreeFromDocuments(documents, currentFile),
    };
  }

  if (input.mode === "latex") {
    const documents: Record<string, string> = {};
    const files: ProjectFile[] = [];
    let currentFile = "main.tex";

    if (/\\documentclass|\\begin\{document\}/.test(trimmedDocument)) {
      documents["main.tex"] = trimmedDocument;
      files.push({ name: "main.tex", type: "root", active: true });
    } else {
      documents["main.tex"] = `\\documentclass{report}
\\begin{document}
\\input{chapters/imported-draft}
\\end{document}`;
      documents["chapters/imported-draft.tex"] = trimmedDocument;
      currentFile = "chapters/imported-draft.tex";
      files.push({ name: "main.tex", type: "root" });
      files.push({ name: "chapters/", type: "folder" });
      files.push({ name: "chapters/imported-draft.tex", type: "file", active: true });
    }

    if (bibliographyText) {
      documents["references.bib"] = bibliographyText;
      files.push({ name: "references.bib", type: "bib" });
    }

    if (notesText) {
      documents["import-notes.md"] = `# Import notes\n\n${notesText}`;
      files.push({ name: "import-notes.md", type: "file" });
    }

    return { currentFile, documents, files };
  }

  const fileName = input.mode === "markdown" ? "imported-draft.md" : "imported-draft.svx";
  const documents: Record<string, string> = {
    [fileName]: input.mode === "markdown" ? trimmedDocument : normalizeStructuredDocument(trimmedDocument),
  };
  const files: ProjectFile[] = [{ name: fileName, type: "root", active: true }];

  if (bibliographyText) {
    documents["references.bib"] = bibliographyText;
    files.push({ name: "references.bib", type: "bib" });
  }

  if (notesText) {
    documents["import-notes.md"] = `# Import notes\n\n${notesText}`;
    files.push({ name: "import-notes.md", type: "file" });
  }

  return {
    currentFile: fileName,
    documents,
    files,
  };
}

function buildImportedMessages(input: ImportProjectInput, bibliographyEntryCount: number, primaryLocation: string): BuildMessage[] {
  const messages: BuildMessage[] = [
    {
      severity: "info",
      location: primaryLocation,
      text:
        input.importedFiles && input.importedFiles.length > 1
          ? `Imported archive preserved ${input.importedFiles.length} project files. Review structure, headings, and compile health before export.`
          : "Imported draft created. Review structure, headings, and citation placement before export.",
    },
  ];

  if (bibliographyEntryCount === 0) {
    messages.push({
      severity: "warn",
      location: primaryLocation,
      text: "No bibliography was imported. Add sources or citations before final export.",
    });
  }

  return messages;
}

export function buildImportedProject(input: ImportProjectInput, existingProjects: ProjectRecord[]) {
  const baseProject = buildProjectFromTemplate(input, existingProjects);
  const { currentFile, documents, files } = buildImportedDocuments(input);
  const bibliographyText = [
    input.bibliographyText?.trim() ?? "",
    ...(input.importedFiles ?? [])
      .filter((file) => file.fileName.endsWith(".bib"))
      .map((file) => file.content.trim()),
  ]
    .filter(Boolean)
    .join("\n\n");
  const sourceCards = bibliographyText ? parseBibTeXSources(bibliographyText) : [];
  const contentForOutline = documents[currentFile] ?? input.documentText;
  const outline = deriveOutline(contentForOutline, input.importFormat, input.mode);
  const searchHits = deriveSearchHits(Object.values(documents).join("\n\n"), outline, bibliographyText);
  const bibliographyEntryCount = sourceCards.length;
  const importedFileCount = input.importedFiles?.length ?? 0;
  const importQueue: ActionItem[] = [
    {
      id: `queue-import-${baseProject.slug}-1`,
      label: "Review imported structure and file names",
      status: "open",
      sourceType: "system",
      owner: "You",
      target: currentFile,
      dueLabel: "Today",
    },
    {
      id: `queue-import-${baseProject.slug}-2`,
      label:
        bibliographyEntryCount > 0
          ? `Validate ${bibliographyEntryCount} imported bibliography entr${bibliographyEntryCount === 1 ? "y" : "ies"}`
          : "Add supporting sources to the library",
      status: "open",
      sourceType: "system",
      owner: "You",
      target: bibliographyEntryCount > 0 ? "references.bib" : currentFile,
      dueLabel: "Before export",
    },
    {
      id: `queue-import-${baseProject.slug}-3`,
      label: "Run an evidence pass before final export",
      status: "open",
      sourceType: "system",
      owner: "You",
      target: currentFile,
      dueLabel: "Before export",
    },
  ];

  const importedProject: ProjectRecord = {
    ...baseProject,
    summary:
      input.summary?.trim() ||
      (importedFileCount > 1
        ? `Imported a ${importedFileCount}-file project into a Scrivix workspace.`
        : `Imported ${input.importFormat} draft into a Scrivix workspace.`),
    status: "Imported draft",
    statusTone: "neutral",
    meta: "Imported into workspace",
    stage: "Import review",
    dueLabel: "No deadline set",
    queue: importQueue,
    workspace: {
      ...baseProject.workspace,
      defaultMode: input.mode === "latex" ? "Research" : "Draft",
      currentFile,
      documents,
      files,
      outline,
      searchHits,
      sources: sourceCards,
      comments: [],
      history: [
        {
          label: "Imported document",
          meta: input.importSourceLabel?.trim() || `${input.importFormat.toUpperCase()} import`,
        },
      ],
      buildMessages: buildImportedMessages(input, bibliographyEntryCount, currentFile),
      editorChips:
        input.mode === "latex"
          ? ["Imported LaTeX", "Review compile health", "Citations on"]
          : ["Imported draft", "Evidence review", "Source-aware editing"],
      aiAssist: {
        title: "Import review ready",
        body:
          "I can review the imported structure, highlight likely evidence gaps, and suggest how to split this draft into cleaner sections.",
      },
      nextStep:
        "Review the imported headings, confirm bibliography coverage, and decide which section should be your active starting point.",
      previewCallout: {
        title: "Imported draft",
        body: bibliographyEntryCount > 0 ? "Imported bibliography entries are available for insertion and review." : "Add sources to ground the imported draft before submission.",
      },
    },
  };

  return applyWorkspaceIntelligence(importedProject);
}
