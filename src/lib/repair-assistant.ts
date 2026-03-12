import type { ProjectRecord, RepairSuggestion, SourceCard } from "@/lib/product-data";

function orderedDocumentEntries(project: ProjectRecord) {
  const entries = Object.entries(project.workspace.documents);
  const activeIndex = entries.findIndex(([fileName]) => fileName === project.workspace.currentFile);

  if (activeIndex <= 0) {
    return entries;
  }

  return [entries[activeIndex], ...entries.slice(0, activeIndex), ...entries.slice(activeIndex + 1)];
}

function findSourceYear(sources: SourceCard[], citationKey: string) {
  const normalizedKey = citationKey.trim().toLowerCase();

  return (
    sources.find((source) => source.citationKey.trim().toLowerCase() === normalizedKey)?.year?.trim() ??
    sources.find((source) => source.id.trim().toLowerCase() === normalizedKey)?.year?.trim() ??
    ""
  );
}

function buildTableRepair(project: ProjectRecord): RepairSuggestion | null {
  for (const [fileName, content] of orderedDocumentEntries(project)) {
    if (!fileName.endsWith(".tex")) {
      continue;
    }

    const beginCount = (content.match(/\\begin\{table\}/g) ?? []).length;
    const endCount = (content.match(/\\end\{table\}/g) ?? []).length;

    if (beginCount <= endCount) {
      continue;
    }

    const missingCount = beginCount - endCount;
    const appendedClosers = Array.from({ length: missingCount }, () => "\\end{table}").join("\n");
    const afterContent = `${content.trimEnd()}\n${appendedClosers}\n`;

    return {
      id: `repair-table-${fileName}`,
      title: "Close unmatched table environment",
      summary: `Append ${missingCount} missing \\end{table} ${missingCount === 1 ? "command" : "commands"} in ${fileName}.`,
      explanation:
        `The current project has ${beginCount} table openings but only ${endCount} closing commands in ${fileName}. ` +
        "Appending the missing closer restores a balanced table environment without changing surrounding content.",
      confidenceLabel: "High confidence",
      operations: [
        {
          fileName,
          summary: `Append ${missingCount} closing table ${missingCount === 1 ? "command" : "commands"}.`,
          beforeContent: content,
          afterContent,
        },
      ],
    };
  }

  return null;
}

function buildBadMacroRepair(project: ProjectRecord): RepairSuggestion | null {
  for (const [fileName, content] of orderedDocumentEntries(project)) {
    if (!fileName.endsWith(".tex") || !content.includes("\\badmacro")) {
      continue;
    }

    const afterContent = content.replace(/\\badmacro\b/g, "\\textbf");

    if (afterContent === content) {
      continue;
    }

    return {
      id: `repair-badmacro-${fileName}`,
      title: "Replace undefined \\badmacro command",
      summary: `Swap the unsupported \\badmacro command for \\textbf in ${fileName}.`,
      explanation:
        "The current file uses a placeholder macro that is not defined in the project. " +
        "Replacing it with \\textbf keeps the intent of emphasis while removing the compile-blocking command.",
      confidenceLabel: "Medium confidence",
      operations: [
        {
          fileName,
          summary: "Replace \\badmacro with \\textbf.",
          beforeContent: content,
          afterContent,
        },
      ],
    };
  }

  return null;
}

function buildBibliographyYearRepair(project: ProjectRecord): RepairSuggestion | null {
  for (const [fileName, content] of orderedDocumentEntries(project)) {
    if (!fileName.endsWith(".bib")) {
      continue;
    }

    let changed = false;

    const afterContent = content.replace(/@(\w+)\{([^,\s]+),([\s\S]*?)\n\}/g, (entry, entryType, citationKey, body) => {
      if (/year\s*=/i.test(body)) {
        return entry;
      }

      const year = findSourceYear(project.workspace.sources, citationKey);

      if (!year) {
        return entry;
      }

      changed = true;
      const normalizedBody = body.replace(/\s+$/, "");
      const bodyWithComma = normalizedBody.trim().endsWith(",") ? normalizedBody : `${normalizedBody},`;

      return `@${entryType}{${citationKey},${bodyWithComma}\n  year = {${year}}\n}`;
    });

    if (!changed) {
      continue;
    }

    return {
      id: `repair-bibyear-${fileName}`,
      title: "Fill missing bibliography year fields",
      summary: `Copy known source years into unresolved BibTeX entries in ${fileName}.`,
      explanation:
        "The bibliography contains entries without a year field, but the linked source library already includes a trusted year value. " +
        "This repair copies those known years into the BibTeX entries to reduce export and citation-style warnings.",
      confidenceLabel: "High confidence",
      operations: [
        {
          fileName,
          summary: "Insert missing year fields from the linked source library.",
          beforeContent: content,
          afterContent,
        },
      ],
    };
  }

  return null;
}

export function deriveRepairSuggestion(project: ProjectRecord) {
  return buildTableRepair(project) ?? buildBadMacroRepair(project) ?? buildBibliographyYearRepair(project) ?? null;
}
