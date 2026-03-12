import type { BuildMessage, EvidenceIssue, ProjectMode, ProjectRecord, SourceCard, TrustSignal } from "@/lib/product-data";
import { isLikelyHtml, sanitizePreviewHtml } from "@/lib/editor-utils";
import { deriveRepairSuggestion } from "@/lib/repair-assistant";
import { ensureVersionSnapshots } from "@/lib/version-utils";

export type SourceDraftInput = {
  title: string;
  detail: string;
  author?: string;
  year?: string;
  citationKey?: string;
  state?: string;
};

const citationPatternSource = String.raw`\\cite[a-zA-Z*]*\{([^}]+)\}|\[@([A-Za-z0-9:_-]+)\]|\[cite:([A-Za-z0-9:_-]+)\]`;
const nonEditableSourcePattern = /\.(bib|ya?ml|csv|png|jpe?g|svg|pdf)$/i;

function keySlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function dedupe<T>(values: T[]) {
  return Array.from(new Set(values));
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function stripDocumentText(fileName: string, value: string) {
  if (isLikelyHtml(value)) {
    return sanitizePreviewHtml(value)
      .replace(/<\/(p|h1|h2|h3|blockquote|li|ul|ol)>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (fileName.endsWith(".tex")) {
    return value
      .replace(/\\(section|subsection|subsubsection)\{([^}]+)\}/g, "$2")
      .replace(/\\cite[a-zA-Z*]*\{([^}]+)\}/g, "[$1]")
      .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^}]*\})?/g, " ")
      .replace(/[{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[@([A-Za-z0-9:_-]+)\]/g, "[$1]")
    .replace(/\[cite:([A-Za-z0-9:_-]+)\]/g, "[$1]")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEvidenceParagraphs(fileName: string, value: string) {
  if (isLikelyHtml(value)) {
    return sanitizePreviewHtml(value)
      .replace(/<\/(p|h1|h2|h3|blockquote|li|ul|ol)>/gi, "\n\n")
      .replace(/<li>/gi, "• ")
      .replace(/<[^>]+>/g, " ")
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  return value
    .split(/\n\s*\n/)
    .map((paragraph) => stripDocumentText(fileName, paragraph))
    .filter(Boolean);
}

function extractBibKeys(value: string) {
  const keys: string[] = [];
  const matches = value.matchAll(/@\w+\{([^,\s]+),/g);

  for (const match of matches) {
    if (match[1]) {
      keys.push(match[1].trim());
    }
  }

  return dedupe(keys);
}

function extractCitationKeys(value: string) {
  const keys: string[] = [];
  const matches = value.matchAll(new RegExp(citationPatternSource, "g"));

  for (const match of matches) {
    const raw = match[1] ?? match[2] ?? match[3];

    if (!raw) {
      continue;
    }

    raw
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => keys.push(entry));
  }

  return dedupe(keys);
}

function looksLikeClaimParagraph(paragraph: string) {
  return (
    paragraph.length > 90 &&
    /(should|must|demonstrates|shows|indicates|suggests|argues|recommends|reveals|supports|therefore|because|this matters|the study|the research|the department|the system|the project|the model|the workflow)/i.test(
      paragraph,
    )
  );
}

function analyzeEvidence(project: ProjectRecord) {
  const issues: EvidenceIssue[] = [];
  let totalClaimParagraphs = 0;
  let supportedClaimParagraphs = 0;
  const documents = Object.entries(project.workspace.documents).filter(([fileName]) => !fileName.endsWith(".bib"));

  for (const [fileName, content] of documents) {
    const paragraphs = extractEvidenceParagraphs(fileName, content);

    paragraphs.forEach((paragraph, index) => {
      const hasCitation = new RegExp(citationPatternSource, "g").test(paragraph);

      if (!looksLikeClaimParagraph(paragraph)) {
        return;
      }

      totalClaimParagraphs += 1;

      if (hasCitation) {
        supportedClaimParagraphs += 1;
        return;
      }

      issues.push({
        id: `${fileName}-${index}`,
        title: "Potential evidence gap",
        detail: paragraph.slice(0, 180).trim(),
        location: fileName,
        recommendation: "Attach a source, soften the claim, or mark it for review before export.",
        tone: "warn",
      });
    });
  }

  return {
    issues: issues.slice(0, 6),
    totalClaimParagraphs,
    supportedClaimParagraphs,
  };
}

function calculateWordEstimate(project: ProjectRecord) {
  const text = Object.entries(project.workspace.documents)
    .filter(([fileName]) => !nonEditableSourcePattern.test(fileName))
    .map(([fileName, content]) => stripDocumentText(fileName, content))
    .join(" ");
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return new Intl.NumberFormat("en-GB").format(wordCount);
}

function normalizeSource(source: SourceCard, index: number) {
  const fallbackKeyBase = source.author
    ? `${source.author.split(/\s+/)[0] ?? "source"}-${source.year ?? "2026"}`
    : source.title;
  const citationKey = normalizeCitationKey(source.citationKey || fallbackKeyBase);

  return {
    ...source,
    id: source.id || `source-${index + 1}-${citationKey}`,
    citationKey,
    sourceType: source.sourceType ?? "report",
    linkedFiles: source.linkedFiles ?? [],
    author: source.author ?? "",
    year: source.year ?? "",
    state: source.state || "Uncited",
  };
}

function buildSourceState(source: SourceCard, citedFiles: string[]) {
  if (citedFiles.length > 0) {
    return `Cited in ${citedFiles.length} ${pluralize(citedFiles.length, "file")}`;
  }

  if (source.linkedFiles?.length) {
    return `Linked to ${source.linkedFiles[0]}`;
  }

  if (source.pinned) {
    return "Pinned";
  }

  if (source.state && !/^uncited$/i.test(source.state)) {
    return source.state;
  }

  return "Uncited";
}

export function normalizeCitationKey(value: string) {
  const normalized = keySlug(value).replace(/-/g, "");
  return normalized || "source2026";
}

export function canInsertCitationIntoFile(fileName: string) {
  return !nonEditableSourcePattern.test(fileName);
}

export function formatCitationToken(projectMode: ProjectMode, fileName: string, citationKey: string) {
  if (projectMode === "latex" || fileName.endsWith(".tex")) {
    return `\\cite{${citationKey}}`;
  }

  return `[@${citationKey}]`;
}

export function buildSourceRecord(input: SourceDraftInput, existingSources: SourceCard[]) {
  const title = input.title.trim();
  const author = input.author?.trim() ?? "";
  const year = input.year?.trim() ?? "";
  const detailSegments = [author, year, input.detail.trim()].filter(Boolean);
  const citationKey = normalizeCitationKey(input.citationKey?.trim() || `${author || title}-${year || "2026"}`);

  return normalizeSource(
    {
      id: `source-${existingSources.length + 1}-${citationKey}`,
      title,
      detail: detailSegments.join(" · "),
      state: input.state?.trim() || "Uncited",
      citationKey,
      sourceType: "report",
      linkedFiles: [],
      author,
      year,
    },
    existingSources.length,
  );
}

export function applyWorkspaceIntelligence(project: ProjectRecord) {
  const normalizedSources = (project.workspace.sources ?? []).map(normalizeSource);
  const citationKeysByFile = new Map<string, string[]>();
  const allCitationKeys = new Set<string>();
  const bibliographyKeys = new Set<string>();

  Object.entries(project.workspace.documents).forEach(([fileName, content]) => {
    if (fileName.endsWith(".bib")) {
      extractBibKeys(content).forEach((key) => bibliographyKeys.add(key));
      return;
    }

    const keys = extractCitationKeys(content);
    citationKeysByFile.set(fileName, keys);
    keys.forEach((key) => allCitationKeys.add(key));
  });

  const evidenceAnalysis = analyzeEvidence(project);
  const evidenceIssues = evidenceAnalysis.issues;
  const totalClaimParagraphs = evidenceAnalysis.totalClaimParagraphs;
  const coveragePercent =
    totalClaimParagraphs === 0
      ? 100
      : Math.max(0, Math.round((evidenceAnalysis.supportedClaimParagraphs / totalClaimParagraphs) * 100));
  const unresolvedCitationKeys = Array.from(allCitationKeys).filter(
    (key) => !bibliographyKeys.has(key) && !normalizedSources.some((source) => source.citationKey === key),
  );
  const citedSourceCount = normalizedSources.filter((source) => allCitationKeys.has(source.citationKey)).length;

  const sources = normalizedSources.map((source) => {
    const citedFiles = Array.from(citationKeysByFile.entries())
      .filter(([, keys]) => keys.includes(source.citationKey))
      .map(([fileName]) => fileName);
    const linkedFiles = dedupe([...(source.linkedFiles ?? []), ...citedFiles]);

    return {
      ...source,
      linkedFiles,
      state: buildSourceState(source, citedFiles),
    };
  });

  const trustSignals: TrustSignal[] = [
    {
      label: "Citation coverage",
      value: `${coveragePercent}%`,
      tone: coveragePercent >= 80 ? "good" : coveragePercent >= 60 ? "neutral" : "warn",
    },
    {
      label: "Evidence gaps",
      value: `${evidenceIssues.length}`,
      tone: evidenceIssues.length === 0 ? "good" : evidenceIssues.length <= 2 ? "neutral" : "warn",
    },
    {
      label: "Source library",
      value: `${citedSourceCount}/${sources.length || 0} cited`,
      tone: sources.length === 0 ? "warn" : citedSourceCount > 0 ? "good" : "neutral",
    },
    {
      label: "Citation keys",
      value: unresolvedCitationKeys.length === 0 ? "Healthy" : `${unresolvedCitationKeys.length} unresolved`,
      tone: unresolvedCitationKeys.length === 0 ? "good" : "warn",
    },
  ];

  const nextWorkspace = {
    ...project.workspace,
    wordEstimate: calculateWordEstimate(project),
    sources,
    versionSnapshots: ensureVersionSnapshots(project.workspace),
    trustSignals,
    evidenceIssues,
    buildMessages: project.workspace.buildMessages ?? ([] as BuildMessage[]),
    rollbackSnapshot: project.workspace.rollbackSnapshot ?? null,
  };
  const nextProject = {
    ...project,
    workspace: nextWorkspace,
  };

  return {
    ...nextProject,
    workspace: {
      ...nextWorkspace,
      repairSuggestion: deriveRepairSuggestion(nextProject),
    },
  };
}
