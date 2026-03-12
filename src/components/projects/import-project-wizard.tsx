"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState, useTransition } from "react";
import { useScrivix } from "@/components/providers/scrivix-provider";
import { templates, type ProjectMode } from "@/lib/product-data";
import type { ImportedTextFile, ImportFormat } from "@/lib/project-utils";

const modeOptions: Array<{ value: ProjectMode; label: string; description: string }> = [
  { value: "latex", label: "LaTeX", description: "Preserve file-native workflows for theses and technical templates." },
  { value: "hybrid", label: "Hybrid", description: "Convert an existing draft into structured writing with stronger review and citation support." },
  { value: "markdown", label: "Markdown", description: "Keep the draft plain-text and portable for technical writing workflows." },
  { value: "rich", label: "Rich text", description: "Bring prose into a guided formal-writing environment with minimal syntax exposure." },
];

const importFormatOptions: Array<{ value: ImportFormat; label: string; description: string }> = [
  { value: "latex", label: "LaTeX source", description: "Paste a `.tex` document, chapter draft, or upload a zipped project." },
  { value: "markdown", label: "Markdown", description: "Paste markdown sections, headings, and citations." },
  { value: "plain", label: "Plain prose", description: "Paste text from Docs, Word, or notes and let Scrivix structure it." },
];

type ImportProjectWizardProps = {
  initialTemplateSlug?: string;
};

export function ImportProjectWizard({ initialTemplateSlug }: ImportProjectWizardProps) {
  const router = useRouter();
  const { createImportedProject, syncError } = useScrivix();
  const fallbackTemplate = templates[0];
  const initialTemplate = templates.find((template) => template.slug === initialTemplateSlug) ?? fallbackTemplate;
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState(initialTemplate.slug);
  const [selectedMode, setSelectedMode] = useState<ProjectMode>(initialTemplate.mode);
  const [importFormat, setImportFormat] = useState<ImportFormat>(
    initialTemplate.mode === "latex" ? "latex" : initialTemplate.mode === "markdown" ? "markdown" : "plain",
  );
  const [title, setTitle] = useState("Imported workspace");
  const [subtitle, setSubtitle] = useState("Imported draft");
  const [audience, setAudience] = useState(initialTemplate.audience);
  const [documentText, setDocumentText] = useState("");
  const [bibliographyText, setBibliographyText] = useState("");
  const [fileReadError, setFileReadError] = useState<string | null>(null);
  const [importedFiles, setImportedFiles] = useState<ImportedTextFile[]>([]);
  const [notesText, setNotesText] = useState("");
  const [sourceFileLabel, setSourceFileLabel] = useState("No file selected");
  const [bibliographyFileLabel, setBibliographyFileLabel] = useState("Optional");
  const [notesFileLabel, setNotesFileLabel] = useState("Optional");
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isPending, startImport] = useTransition();

  const selectedTemplate = templates.find((template) => template.slug === selectedTemplateSlug) ?? fallbackTemplate;
  const generatedFiles = useMemo(() => {
    if (importedFiles.length > 0) {
      const archiveFiles = [...importedFiles.map((file) => file.fileName)];

      if (notesText.trim() && !archiveFiles.includes("import-notes.md")) {
        archiveFiles.push("import-notes.md");
      }

      if (bibliographyText.trim() && !archiveFiles.some((file) => file.endsWith(".bib"))) {
        archiveFiles.push("references.bib");
      }

      return archiveFiles.slice(0, 10);
    }

    const files =
      selectedMode === "latex"
        ? importFormat === "latex"
          ? ["main.tex", "references.bib"]
          : ["main.tex", "chapters/imported-draft.tex", "references.bib"]
        : [selectedMode === "markdown" ? "imported-draft.md" : "imported-draft.svx", "references.bib"];

    return bibliographyText.trim() ? files : files.filter((file) => file !== "references.bib");
  }, [bibliographyText, importFormat, importedFiles, notesText, selectedMode]);

  async function readLatexArchive(file: File) {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const readableEntries = Object.values(zip.files).filter((entry) => {
      if (entry.dir || entry.name.startsWith("__MACOSX/")) {
        return false;
      }

      return /\.(tex|bib|cls|sty|bst|md|txt|ya?ml|json)$/i.test(entry.name);
    });

    const archiveFiles = (
      await Promise.all(
        readableEntries.map(async (entry) => ({
          fileName: entry.name.replace(/^\.\/+/, "").replace(/^\/+/, ""),
          content: await entry.async("string"),
        })),
      )
    )
      .filter((entry) => entry.fileName && entry.content.trim())
      .sort((left, right) => left.fileName.localeCompare(right.fileName));

    if (archiveFiles.length === 0) {
      throw new Error("No readable LaTeX project files were found in the archive.");
    }

    const primaryFile =
      archiveFiles.find((entry) => entry.fileName === "main.tex") ??
      archiveFiles.find((entry) => entry.fileName.endsWith(".tex") && /\\documentclass|\\begin\{document\}/.test(entry.content)) ??
      archiveFiles.find((entry) => entry.fileName.endsWith(".tex")) ??
      archiveFiles[0];
    const mergedBibliography = archiveFiles
      .filter((entry) => entry.fileName.endsWith(".bib"))
      .map((entry) => entry.content.trim())
      .filter(Boolean)
      .join("\n\n");

    setImportedFiles(archiveFiles);
    setDocumentText(primaryFile?.content ?? "");
    setBibliographyText(mergedBibliography);
    setBibliographyFileLabel(
      archiveFiles.some((entry) => entry.fileName.endsWith(".bib"))
        ? `${archiveFiles.filter((entry) => entry.fileName.endsWith(".bib")).length} bibliography file${
            archiveFiles.filter((entry) => entry.fileName.endsWith(".bib")).length === 1 ? "" : "s"
          }`
        : "Optional",
    );
    setImportFormat("latex");
    setSelectedMode("latex");
  }

  async function readPrimaryFile(file: File) {
    const fileName = file.name.toLowerCase();
    const baseName = file.name.replace(/\.[^.]+$/, "");

    setIsReadingFile(true);
    setFileReadError(null);

    try {
      if (fileName.endsWith(".zip")) {
        await readLatexArchive(file);
      } else if (fileName.endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });

        setImportedFiles([]);
        setDocumentText(result.value.trim());
        setBibliographyText("");
        setBibliographyFileLabel("Optional");
        setImportFormat("plain");
        setSelectedMode("hybrid");
      } else {
        const text = await file.text();
        setImportedFiles([]);
        setDocumentText(text);

        if (fileName.endsWith(".tex")) {
          setImportFormat("latex");
          setSelectedMode("latex");
        } else if (fileName.endsWith(".md")) {
          setImportFormat("markdown");
          if (selectedMode === "latex") {
            setSelectedMode("markdown");
          }
        } else {
          setImportFormat("plain");
          if (selectedMode === "latex") {
            setSelectedMode("hybrid");
          }
        }
      }

      setTitle(`${baseName} Workspace`);
      setSubtitle(`Imported from ${file.name}`);
      setSourceFileLabel(file.name);
    } catch (error) {
      setFileReadError(error instanceof Error ? error.message : "This file could not be imported.");
    } finally {
      setIsReadingFile(false);
    }
  }

  async function readTextAttachment(file: File, target: "bibliography" | "notes") {
    const text = await file.text();

    if (target === "bibliography") {
      setBibliographyText(text);
      setBibliographyFileLabel(file.name);
      return;
    }

    setNotesText(text);
    setNotesFileLabel(file.name);
  }

  function handleImportProject() {
    if (!title.trim() || !documentText.trim()) {
      return;
    }

    startImport(() => {
      void createImportedProject({
        title,
        subtitle,
        audience,
        templateSlug: selectedTemplate.slug,
        mode: selectedMode,
        importFormat,
        documentText,
        bibliographyText,
        importedFiles,
        importSourceLabel: sourceFileLabel,
        notesText,
        summary:
          importedFiles.length > 1
            ? `Imported ${importedFiles.length} preserved files into ${selectedMode} mode.`
            : `Imported ${importFormat} draft into ${selectedMode} mode.`,
      }).then((project) => {
        startTransition(() => {
          router.push(`/workspace/${project.slug}`);
        });
      });
    });
  }

  return (
    <div className="wizard-layout">
      <section className="wizard-panel panel">
        {syncError && <div className="sync-banner sync-banner--compact panel">{syncError}</div>}

        <div className="wizard-step">
          <div className="wizard-step__header">
            <span className="wizard-step__number">1</span>
            <div>
              <h2>Choose the target workflow</h2>
              <p>Import into the template and authoring mode that best matches how the document should live in Scrivix.</p>
            </div>
          </div>

          <div className="wizard-template-grid">
            {templates.map((template) => (
              <button
                key={template.slug}
                className={template.slug === selectedTemplateSlug ? "wizard-option wizard-option--active" : "wizard-option"}
                onClick={() => {
                  setSelectedTemplateSlug(template.slug);
                  setAudience(template.audience);
                  if (selectedMode === "latex" && template.mode !== "latex") {
                    setSelectedMode(template.mode);
                  }
                }}
                type="button"
              >
                <span className="template-chip">{template.category}</span>
                <strong>{template.title}</strong>
                <p>{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="wizard-step">
          <div className="wizard-step__header">
            <span className="wizard-step__number">2</span>
            <div>
              <h2>Define the import type</h2>
              <p>Tell Scrivix what you are pasting so it can choose the right file structure and editor behavior.</p>
            </div>
          </div>

          <div className="wizard-mode-grid">
            {importFormatOptions.map((option) => (
              <button
                key={option.value}
                className={option.value === importFormat ? "wizard-option wizard-option--active" : "wizard-option"}
                onClick={() => {
                  setImportFormat(option.value);
                  if (option.value === "latex") {
                    setSelectedMode("latex");
                  }
                }}
                type="button"
              >
                <strong>{option.label}</strong>
                <p>{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="wizard-step">
          <div className="wizard-step__header">
            <span className="wizard-step__number">3</span>
            <div>
              <h2>Choose the destination mode</h2>
              <p>LaTeX imports stay technical; markdown and prose can land in markdown, hybrid, or rich mode.</p>
            </div>
          </div>

          <div className="wizard-mode-grid">
            {modeOptions.map((option) => {
              const isDisabled = importFormat === "latex" && option.value !== "latex";

              return (
                <button
                  key={option.value}
                  className={option.value === selectedMode ? "wizard-option wizard-option--active" : "wizard-option"}
                  disabled={isDisabled}
                  onClick={() => setSelectedMode(option.value)}
                  type="button"
                >
                  <strong>{option.label}</strong>
                  <p>{isDisabled ? "LaTeX source imports stay in LaTeX mode." : option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="wizard-step">
          <div className="wizard-step__header">
            <span className="wizard-step__number">4</span>
            <div>
              <h2>Name the imported project</h2>
              <p>Set the project identity and audience before Scrivix generates files, outline, and trust state.</p>
            </div>
          </div>

          <div className="wizard-form-grid">
            <label className="wizard-field">
              <span>Project title</span>
              <input onChange={(event) => setTitle(event.target.value)} value={title} />
            </label>

            <label className="wizard-field">
              <span>Subtitle</span>
              <input onChange={(event) => setSubtitle(event.target.value)} value={subtitle} />
            </label>

            <label className="wizard-field wizard-field--full">
              <span>Audience</span>
              <input onChange={(event) => setAudience(event.target.value)} value={audience} />
            </label>
          </div>
        </div>

        <div className="wizard-step">
          <div className="wizard-step__header">
            <span className="wizard-step__number">5</span>
            <div>
              <h2>Paste the draft and bibliography</h2>
              <p>Start with the primary text. Add BibTeX if you have it so Scrivix can seed the source library immediately.</p>
            </div>
          </div>

          <div className="import-upload-grid">
            <label className="upload-card">
              <span className="template-chip">Primary draft</span>
              <strong>{sourceFileLabel}</strong>
              <p>Upload `.docx`, `.md`, `.txt`, `.tex`, or a zipped LaTeX project and Scrivix will detect the import shape.</p>
              <input
                accept=".docx,.md,.txt,.tex,.zip"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void readPrimaryFile(file);
                  }
                }}
                type="file"
              />
            </label>

            <label className="upload-card">
              <span className="template-chip">Bibliography</span>
              <strong>{bibliographyFileLabel}</strong>
              <p>Optional `.bib` import to seed the source library and citation keys immediately.</p>
              <input
                accept=".bib,.txt"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void readTextAttachment(file, "bibliography");
                  }
                }}
                type="file"
              />
            </label>

            <label className="upload-card">
              <span className="template-chip">Notes</span>
              <strong>{notesFileLabel}</strong>
              <p>Optional `.md` or `.txt` notes file for import context, reviewer instructions, or cleanup tasks.</p>
              <input
                accept=".md,.txt"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void readTextAttachment(file, "notes");
                  }
                }}
                type="file"
              />
            </label>
          </div>

          {fileReadError && <div className="utility-banner">{fileReadError}</div>}

          <div className="source-form-grid">
            <label className="source-field source-field--full">
              <span>Document text</span>
              <textarea
                onChange={(event) => setDocumentText(event.target.value)}
                placeholder={importFormat === "latex" ? "\\section{Introduction}\n\nPaste your LaTeX draft here." : "# Introduction\n\nPaste your draft here."}
                rows={14}
                value={documentText}
              />
            </label>

            <label className="source-field">
              <span>Bibliography / references</span>
              <textarea
                onChange={(event) => setBibliographyText(event.target.value)}
                placeholder="@article{source2026,\n  title = {Imported Source},\n  author = {Author, Example},\n  year = {2026}\n}"
                rows={8}
                value={bibliographyText}
              />
            </label>

            <label className="source-field">
              <span>Import notes</span>
              <textarea
                onChange={(event) => setNotesText(event.target.value)}
                placeholder="Optional notes about how this draft should be reviewed or restructured."
                rows={8}
                value={notesText}
              />
            </label>
          </div>
        </div>
      </section>

      <aside className="wizard-summary panel">
        <p className="eyebrow">Import preview</p>
        <h2>{title || "Imported workspace"}</h2>
        <p className="wizard-summary__body">
          Scrivix will create a project from the pasted draft, build an initial outline, seed sources from any BibTeX
          entries, and open the imported document in the workspace shell.
        </p>

        <div className="wizard-summary__stats">
          <div>
            <span className="quiet-label">Template</span>
            <strong>{selectedTemplate.title}</strong>
          </div>
          <div>
            <span className="quiet-label">Import type</span>
            <strong>{importFormat}</strong>
          </div>
          <div>
            <span className="quiet-label">Destination mode</span>
            <strong>{selectedMode}</strong>
          </div>
          <div>
            <span className="quiet-label">Draft length</span>
            <strong>{documentText.trim().split(/\s+/).filter(Boolean).length} words</strong>
          </div>
          <div>
            <span className="quiet-label">Preserved files</span>
            <strong>{importedFiles.length || generatedFiles.length}</strong>
          </div>
        </div>

        <div className="template-highlights">
          {generatedFiles.map((file) => (
            <span key={file} className="template-highlight">
              {file}
            </span>
          ))}
        </div>

        <div className="wizard-summary__actions">
          <button
            className="primary-button"
            disabled={isPending || isReadingFile || !documentText.trim()}
            onClick={handleImportProject}
            type="button"
          >
            {isPending ? "Importing..." : isReadingFile ? "Reading file..." : "Import into Scrivix"}
          </button>
          <Link className="ghost-button" href="/projects/new">
            Start from template instead
          </Link>
        </div>

        <div className="wizard-summary__actions">
          <Link className="ghost-button" href="/projects">
            View existing projects
          </Link>
        </div>

        <div className="wizard-summary__footnote">
          {importedFiles.length > 0
            ? "Archive import preserves readable project files, seeds the workspace tree, and keeps BibTeX files in place for later compile and repair workflows."
            : "This import flow supports pasted text, document uploads, and optional BibTeX so Scrivix can create a clean working project before deeper compile tooling lands."}
        </div>
      </aside>
    </div>
  );
}
