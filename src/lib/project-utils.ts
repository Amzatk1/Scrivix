import {
  getTemplateBySlug,
  projects as seedProjects,
  templates,
  type ProjectMode,
  type ProjectRecord,
} from "@/lib/product-data";

export type CreateProjectInput = {
  title: string;
  subtitle: string;
  audience: string;
  templateSlug: string;
  mode: ProjectMode;
  summary?: string;
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
    "Review the starter structure",
    "Import sources or notes",
    "Draft the first section before export",
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
      .map((file) => [file.name, baseProject.workspace.documents[file.name] ?? fallbackDocumentForFile(file.name)]),
  );

  return baseProject;
}

