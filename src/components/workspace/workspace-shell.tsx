"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { DocumentEditor } from "@/components/editor/document-editor";
import { buildPreviewModel } from "@/lib/editor-utils";
import {
  canInsertCitationIntoFile,
  formatCitationToken,
  type SourceDraftInput,
} from "@/lib/document-intelligence";
import type { BuildSeverity, ProjectRecord, RepairOperation } from "@/lib/product-data";

const modeOptions = ["Draft", "Research", "Review", "Submission"] as const;
const utilityTabs = ["AI", "Sources", "Comments", "Trust", "History"] as const;
const leftTabs = ["Files", "Outline", "Search"] as const;

type Mode = (typeof modeOptions)[number];
type UtilityTab = (typeof utilityTabs)[number];
type LeftTab = (typeof leftTabs)[number];

type WorkspaceShellProps = {
  isCompiling: boolean;
  isRepairing: boolean;
  onApplyRepair: () => void;
  onCompile: () => void;
  onCreateFile: (fileName: string) => void;
  onCreateSource: (input: SourceDraftInput) => Promise<void> | void;
  onRollbackRepair: () => void;
  project: ProjectRecord;
  onSelectFile: (fileName: string) => void;
  onUpdateDocument: (fileName: string, content: string) => void;
};

type SourceDraftState = {
  title: string;
  author: string;
  year: string;
  detail: string;
};

type ConsoleEntry = {
  id: string;
  severity: BuildSeverity;
  location: string;
  text: string;
};

const emptySourceDraft: SourceDraftState = {
  title: "",
  author: "",
  year: "",
  detail: "",
};

function buildDiffPreview(operation: RepairOperation) {
  const beforeLines = operation.beforeContent.split("\n");
  const afterLines = operation.afterContent.split("\n");
  let startIndex = 0;

  while (
    startIndex < beforeLines.length &&
    startIndex < afterLines.length &&
    beforeLines[startIndex] === afterLines[startIndex]
  ) {
    startIndex += 1;
  }

  let beforeEndIndex = beforeLines.length - 1;
  let afterEndIndex = afterLines.length - 1;

  while (
    beforeEndIndex >= startIndex &&
    afterEndIndex >= startIndex &&
    beforeLines[beforeEndIndex] === afterLines[afterEndIndex]
  ) {
    beforeEndIndex -= 1;
    afterEndIndex -= 1;
  }

  const previewStart = Math.max(0, startIndex - 1);
  const previewBeforeEnd = Math.min(beforeLines.length, beforeEndIndex + 2);
  const previewAfterEnd = Math.min(afterLines.length, afterEndIndex + 2);

  return {
    before: beforeLines.slice(previewStart, previewBeforeEnd).join("\n"),
    after: afterLines.slice(previewStart, previewAfterEnd).join("\n"),
  };
}

export function WorkspaceShell({
  isCompiling,
  isRepairing,
  onApplyRepair,
  onCompile,
  onCreateFile,
  onCreateSource,
  onRollbackRepair,
  project,
  onSelectFile,
  onUpdateDocument,
}: WorkspaceShellProps) {
  const workspace = project.workspace;
  const [mode, setMode] = useState<Mode>(workspace.defaultMode);
  const [utilityTab, setUtilityTab] = useState<UtilityTab>("AI");
  const [leftTab, setLeftTab] = useState<LeftTab>("Files");
  const [showPreview, setShowPreview] = useState(true);
  const [showUtility, setShowUtility] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceDraft, setSourceDraft] = useState<SourceDraftState>(emptySourceDraft);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [showSourceComposer, setShowSourceComposer] = useState(false);
  const [showRepairDiff, setShowRepairDiff] = useState(false);
  const [showRepairExplanation, setShowRepairExplanation] = useState(false);
  const [citationInsertionRequest, setCitationInsertionRequest] = useState<{ id: string; text: string } | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const currentDocument =
    workspace.documents[workspace.currentFile] ?? `Start drafting in ${workspace.currentFile}.`;
  const previewModel = buildPreviewModel(currentDocument, workspace.currentFile, project.mode);
  const query = deferredSearchQuery.trim().toLowerCase();
  const canInsertCitation = canInsertCitationIntoFile(workspace.currentFile);
  const repairSuggestion = workspace.repairSuggestion ?? null;
  const hasRollbackSnapshot = Boolean(workspace.rollbackSnapshot);
  const filteredSearchHits = query
    ? [
        ...workspace.searchHits
          .filter((hit) => `${hit.term} ${hit.summary}`.toLowerCase().includes(query))
          .map((hit) => ({ title: hit.term, summary: hit.summary, kind: "Project hit" })),
        ...workspace.files
          .filter((file) => file.type !== "folder" && file.name.toLowerCase().includes(query))
          .map((file) => ({ title: file.name, summary: "File match", kind: "File" })),
        ...workspace.outline
          .filter((section) => `${section.title} ${section.note}`.toLowerCase().includes(query))
          .map((section) => ({ title: section.title, summary: section.note, kind: "Outline" })),
      ].slice(0, 6)
    : workspace.searchHits.map((hit) => ({ title: hit.term, summary: hit.summary, kind: "Recent hit" }));
  const consoleEntries = useMemo<ConsoleEntry[]>(
    () => [
      ...workspace.buildMessages.map((message, index) => ({
        id: `build-${message.location}-${index}`,
        severity: message.severity,
        location: message.location,
        text: message.text,
      })),
      ...workspace.evidenceIssues.map((issue) => ({
        id: `evidence-${issue.id}`,
        severity: issue.tone === "good" ? ("info" as const) : ("warn" as const),
        location: issue.location,
        text: `${issue.title}. ${issue.detail}`,
      })),
    ],
    [workspace.buildMessages, workspace.evidenceIssues],
  );

  useEffect(() => {
    setShowRepairDiff(false);
    setShowRepairExplanation(false);
  }, [repairSuggestion?.id]);

  async function handleCreateSource() {
    if (!sourceDraft.title.trim() || !sourceDraft.detail.trim()) {
      return;
    }

    setIsAddingSource(true);

    try {
      await onCreateSource(sourceDraft);
      setSourceDraft(emptySourceDraft);
      setShowSourceComposer(false);
    } finally {
      setIsAddingSource(false);
    }
  }

  function handleInsertCitation(citationKey: string) {
    if (!canInsertCitation) {
      return;
    }

    setCitationInsertionRequest({
      id: `${citationKey}-${Date.now()}`,
      text: formatCitationToken(project.mode, workspace.currentFile, citationKey),
    });
  }

  function jumpToIssue(location: string) {
    onSelectFile(location.split(":")[0] ?? location);
    setLeftTab("Files");
  }

  return (
    <div className="workspace-shell">
      <div className="workspace-topbar">
        <div>
          <p className="eyebrow">Scrivix Workspace</p>
          <h1>{project.title}</h1>
          <p className="workspace-subtitle">
            {project.subtitle} · {project.stage} · {project.dueLabel}
          </p>
        </div>

        <div className="workspace-actions">
          <div className={`status-pill status-pill--${project.statusTone}`}>{workspace.compileStatus}</div>
          <button className="ghost-button" type="button">
            Export PDF
          </button>
          <button className="ghost-button" type="button">
            Share
          </button>
          <button className="primary-button" disabled={isCompiling} onClick={onCompile} type="button">
            {isCompiling ? "Compiling..." : "Compile"}
          </button>
        </div>
      </div>

      <div className="workspace-modebar">
        <div className="segmented-control" role="tablist" aria-label="Workspace mode">
          {modeOptions.map((option) => (
            <button
              key={option}
              className={option === mode ? "segment segment--active" : "segment"}
              onClick={() => setMode(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="workspace-toggle-row">
          <button className="toggle-chip" onClick={() => setShowPreview((value) => !value)} type="button">
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <button className="toggle-chip" onClick={() => setShowUtility((value) => !value)} type="button">
            {showUtility ? "Hide utility pane" : "Show utility pane"}
          </button>
          <button className="toggle-chip" onClick={() => setShowConsole((value) => !value)} type="button">
            {showConsole ? "Hide console" : "Show console"}
          </button>
        </div>
      </div>

      <div className="workspace-grid">
        <aside className="workspace-sidebar panel">
          <div className="sidebar-tabs">
            {leftTabs.map((tab) => (
              <button
                key={tab}
                className={tab === leftTab ? "sidebar-tab sidebar-tab--active" : "sidebar-tab"}
                onClick={() => setLeftTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          {leftTab === "Files" && (
            <div className="sidebar-content">
              <div className="sidebar-header">
                <span>Project tree</span>
                <button
                  className="inline-action"
                  onClick={() => {
                    const fallbackExtension = project.mode === "latex" ? ".tex" : project.mode === "markdown" ? ".md" : ".svx";
                    const requestedFileName = window.prompt("Name the new file", `notes${fallbackExtension}`);

                    if (!requestedFileName) {
                      return;
                    }

                    onCreateFile(requestedFileName.trim());
                  }}
                  type="button"
                >
                  New file
                </button>
              </div>
              <ul className="tree-list">
                {workspace.files.map((file) => (
                  <li key={file.name} className={file.active ? "tree-item tree-item--active" : "tree-item"}>
                    <button
                      className={file.type === "folder" ? "tree-button tree-button--static" : "tree-button"}
                      onClick={() => {
                        if (file.type !== "folder") {
                          onSelectFile(file.name);
                        }
                      }}
                      type="button"
                    >
                      <span className={`tree-badge tree-badge--${file.type}`}>{file.type.slice(0, 1).toUpperCase()}</span>
                      <span>{file.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {leftTab === "Outline" && (
            <div className="sidebar-content">
              <div className="sidebar-header">
                <span>Document outline</span>
                <span className="quiet-label">{workspace.outline.length} active sections</span>
              </div>
              <ul className="outline-list">
                {workspace.outline.map((section) => (
                  <li key={section.title} className="outline-item">
                    <span>{section.title}</span>
                    <small>{section.note}</small>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {leftTab === "Search" && (
            <div className="sidebar-content">
              <div className="search-card">
                <label htmlFor="project-search">Search project</label>
                <input
                  id="project-search"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Find files, comments, sources..."
                  value={searchQuery}
                />
              </div>
              {filteredSearchHits.map((hit) => (
                <button
                  key={`${hit.kind}-${hit.title}`}
                  className="search-result-card"
                  onClick={() => {
                    if (hit.kind === "File") {
                      onSelectFile(hit.title);
                    }
                  }}
                  type="button"
                >
                  <p>{hit.kind}</p>
                  <strong>{hit.title}</strong>
                  <span>{hit.summary}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="editor-stage">
          <div className="editor-stage__header panel">
            <div>
              <p className="eyebrow">Current file</p>
              <h2>{workspace.currentFile}</h2>
            </div>
            <div className="editor-meta">
              <span>Mode: {mode}</span>
              <span>Word estimate: {workspace.wordEstimate}</span>
              <span>Last export: {workspace.lastExport}</span>
              <span>State: {project.meta}</span>
            </div>
          </div>

          <div className={`editor-stage__body ${showPreview ? "editor-stage__body--split" : ""}`}>
            <article className="editor-pane panel">
              <div className="editor-toolbar">
                {workspace.editorChips.map((chip) => (
                  <span key={chip} className="editor-chip">
                    {chip}
                  </span>
                ))}
              </div>

              <DocumentEditor
                fileName={workspace.currentFile}
                insertionRequest={citationInsertionRequest}
                onChange={(value) => onUpdateDocument(workspace.currentFile, value)}
                projectMode={project.mode}
                value={currentDocument}
              />

              <div className="editor-footer">
                <button className="ghost-button" onClick={() => setUtilityTab("Trust")} type="button">
                  Review evidence gaps
                </button>
                <button className="ghost-button" onClick={() => setUtilityTab("Sources")} type="button">
                  Open source library
                </button>
              </div>
            </article>

            {showPreview && (
              <aside className="preview-pane panel">
                <div className="preview-header">
                  <div>
                    <p className="eyebrow">Preview</p>
                    <h3>Compiled page view</h3>
                  </div>
                  <span className="quiet-label">Synced to current selection</span>
                </div>

                <div className="page-preview">
                  {previewModel.kind === "structured" ? (
                    <div
                      className="page-preview__rich"
                      dangerouslySetInnerHTML={{ __html: previewModel.html }}
                    />
                  ) : (
                    previewModel.paragraphs.map((paragraph, index) => (
                      <p key={`${paragraph}-${index}`} className={index === 0 ? "page-preview__title" : ""}>
                        {paragraph}
                      </p>
                    ))
                  )}
                  <div className="preview-callout">
                    <strong>{workspace.previewCallout.title}</strong>
                    <span>{workspace.previewCallout.body}</span>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>

        {showUtility && (
          <aside className="utility-pane panel">
            <div className="utility-tabs">
              {utilityTabs.map((tab) => (
                <button
                  key={tab}
                  className={tab === utilityTab ? "utility-tab utility-tab--active" : "utility-tab"}
                  onClick={() => setUtilityTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            {utilityTab === "AI" && (
              <div className="utility-content">
                {repairSuggestion ? (
                  <div className="assistant-card assistant-card--primary">
                    <p className="eyebrow">Suggested repair</p>
                    <h3>{repairSuggestion.title}</h3>
                    <p>{repairSuggestion.summary}</p>
                    <div className="assistant-meta">
                      <span>{repairSuggestion.confidenceLabel}</span>
                      <span>
                        {repairSuggestion.operations.length} file {repairSuggestion.operations.length === 1 ? "change" : "changes"}
                      </span>
                    </div>
                    <div className="assistant-actions">
                      <button className="ghost-button" onClick={() => setShowRepairDiff((value) => !value)} type="button">
                        {showRepairDiff ? "Hide diff" : "Review diff"}
                      </button>
                      <button className="primary-button" disabled={isRepairing} onClick={onApplyRepair} type="button">
                        {isRepairing ? "Applying..." : "Apply patch"}
                      </button>
                    </div>
                    <div className="assistant-actions">
                      <button className="ghost-button" onClick={() => setShowRepairExplanation((value) => !value)} type="button">
                        {showRepairExplanation ? "Hide reasoning" : "Explain change"}
                      </button>
                      {hasRollbackSnapshot && (
                        <button className="ghost-button" disabled={isRepairing} onClick={onRollbackRepair} type="button">
                          {isRepairing ? "Working..." : "Rollback last repair"}
                        </button>
                      )}
                    </div>

                    {showRepairExplanation && <div className="assistant-explanation">{repairSuggestion.explanation}</div>}

                    {showRepairDiff && (
                      <div className="repair-diff-list">
                        {repairSuggestion.operations.map((operation) => {
                          const preview = buildDiffPreview(operation);

                          return (
                            <article key={`${repairSuggestion.id}-${operation.fileName}`} className="repair-diff-card">
                              <div className="repair-diff-card__header">
                                <div>
                                  <strong>{operation.fileName}</strong>
                                  <span>{operation.summary}</span>
                                </div>
                              </div>
                              <div className="repair-diff-grid">
                                <div className="repair-diff-block repair-diff-block--before">
                                  <p>Before</p>
                                  <pre>{preview.before}</pre>
                                </div>
                                <div className="repair-diff-block repair-diff-block--after">
                                  <p>After</p>
                                  <pre>{preview.after}</pre>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="assistant-card assistant-card--primary">
                    <p className="eyebrow">Agentic assist</p>
                    <h3>{workspace.aiAssist.title}</h3>
                    <p>{workspace.aiAssist.body}</p>
                    <div className="assistant-actions">
                      <button className="ghost-button" onClick={() => setShowRepairExplanation((value) => !value)} type="button">
                        {showRepairExplanation ? "Hide context" : "Explain context"}
                      </button>
                    </div>
                    {showRepairExplanation && <div className="assistant-explanation">{workspace.aiAssist.body}</div>}
                  </div>
                )}

                <div className="assistant-card">
                  <p className="eyebrow">Next step</p>
                  <p>{workspace.nextStep}</p>
                </div>

                {hasRollbackSnapshot && !repairSuggestion && (
                  <div className="assistant-card">
                    <p className="eyebrow">Rollback available</p>
                    <h3>{workspace.rollbackSnapshot?.label}</h3>
                    <p>Restore the last pre-repair snapshot if the current draft needs to be reverted.</p>
                    <div className="assistant-actions">
                      <button className="ghost-button" disabled={isRepairing} onClick={onRollbackRepair} type="button">
                        {isRepairing ? "Working..." : "Rollback last repair"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {utilityTab === "Sources" && (
              <div className="utility-content">
                <div className="utility-section-header">
                  <div>
                    <p className="eyebrow">Source library</p>
                    <h3>{workspace.sources.length} project sources</h3>
                  </div>
                  <button
                    className="ghost-button ghost-button--compact"
                    onClick={() => setShowSourceComposer((value) => !value)}
                    type="button"
                  >
                    {showSourceComposer ? "Close" : "Add source"}
                  </button>
                </div>

                {!canInsertCitation && (
                  <div className="utility-banner">
                    Open a prose file to insert citations. Config, bibliography, and asset files are read-only for citation actions.
                  </div>
                )}

                {showSourceComposer && (
                  <div className="source-form-card">
                    <div className="source-form-grid">
                      <label className="source-field">
                        <span>Title</span>
                        <input
                          onChange={(event) => setSourceDraft((current) => ({ ...current, title: event.target.value }))}
                          placeholder="Source title"
                          value={sourceDraft.title}
                        />
                      </label>
                      <label className="source-field">
                        <span>Author</span>
                        <input
                          onChange={(event) => setSourceDraft((current) => ({ ...current, author: event.target.value }))}
                          placeholder="Author or organisation"
                          value={sourceDraft.author}
                        />
                      </label>
                      <label className="source-field">
                        <span>Year</span>
                        <input
                          onChange={(event) => setSourceDraft((current) => ({ ...current, year: event.target.value }))}
                          placeholder="2026"
                          value={sourceDraft.year}
                        />
                      </label>
                      <label className="source-field source-field--full">
                        <span>Notes / detail</span>
                        <textarea
                          onChange={(event) => setSourceDraft((current) => ({ ...current, detail: event.target.value }))}
                          placeholder="Why this source matters, pages, notes, or provenance"
                          rows={3}
                          value={sourceDraft.detail}
                        />
                      </label>
                    </div>
                    <div className="assistant-actions">
                      <button className="primary-button" disabled={isAddingSource} onClick={() => void handleCreateSource()} type="button">
                        {isAddingSource ? "Adding..." : "Save source"}
                      </button>
                      <button
                        className="ghost-button"
                        onClick={() => {
                          setSourceDraft(emptySourceDraft);
                          setShowSourceComposer(false);
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="source-stack">
                  {workspace.sources.map((source) => (
                    <article key={source.id} className="source-card">
                      <div className="source-card__header">
                        <div>
                          <strong>{source.title}</strong>
                          <span>{source.detail}</span>
                        </div>
                        <span className="source-key">{source.citationKey}</span>
                      </div>
                      <div className="source-card__meta">
                        <small>{source.state}</small>
                        {source.linkedFiles && source.linkedFiles.length > 0 && (
                          <small>{source.linkedFiles.join(", ")}</small>
                        )}
                      </div>
                      <div className="source-card__actions">
                        <button
                          className="ghost-button ghost-button--compact"
                          disabled={!canInsertCitation}
                          onClick={() => handleInsertCitation(source.citationKey)}
                          type="button"
                        >
                          Insert citation
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {utilityTab === "Comments" && (
              <div className="utility-content">
                {workspace.comments.map((comment) => (
                  <article key={`${comment.author}-${comment.target}`} className="comment-card">
                    <div className="comment-card__header">
                      <strong>{comment.author}</strong>
                      <span>{comment.target}</span>
                    </div>
                    <p>{comment.body}</p>
                  </article>
                ))}
              </div>
            )}

            {utilityTab === "Trust" && (
              <div className="utility-content">
                <div className="signal-grid">
                  {workspace.trustSignals.map((signal) => (
                    <article key={signal.label} className={`signal-card signal-card--${signal.tone}`}>
                      <span>{signal.label}</span>
                      <strong>{signal.value}</strong>
                    </article>
                  ))}
                </div>

                <div className="trust-list">
                  <div className="utility-section-header utility-section-header--compact">
                    <div>
                      <p className="eyebrow">Evidence review</p>
                      <h3>{workspace.evidenceIssues.length} issues surfaced</h3>
                    </div>
                  </div>
                  {workspace.evidenceIssues.length === 0 ? (
                    <div className="utility-banner utility-banner--positive">
                      No evidence gaps are currently surfaced in the open draft.
                    </div>
                  ) : (
                    workspace.evidenceIssues.map((issue) => (
                      <article key={issue.id} className={`trust-issue trust-issue--${issue.tone}`}>
                        <div>
                          <strong>{issue.title}</strong>
                          <p>{issue.detail}</p>
                          <small>{issue.recommendation}</small>
                        </div>
                        <button className="ghost-button ghost-button--compact" onClick={() => jumpToIssue(issue.location)} type="button">
                          Open file
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}

            {utilityTab === "History" && (
              <div className="utility-content">
                {workspace.history.map((event) => (
                  <article key={`${event.label}-${event.meta}`} className="history-card">
                    <strong>{event.label}</strong>
                    <span>{event.meta}</span>
                  </article>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>

      {showConsole && (
        <section className="console-panel panel">
          <div className="console-header">
            <div>
              <p className="eyebrow">Build console</p>
              <h3>Warnings, errors, and evidence health</h3>
            </div>
            <div className="console-actions">
              {repairSuggestion && (
                <button
                  className="ghost-button"
                  onClick={() => {
                    setShowUtility(true);
                    setUtilityTab("AI");
                    setShowRepairDiff(true);
                  }}
                  type="button"
                >
                  Review suggested repair
                </button>
              )}
              <button
                className="ghost-button"
                onClick={() => {
                  const nextIssue = consoleEntries.find((entry) => entry.severity !== "info");

                  if (nextIssue) {
                    jumpToIssue(nextIssue.location);
                  }
                }}
                type="button"
              >
                Jump to next issue
              </button>
            </div>
          </div>

          <div className="console-list">
            {consoleEntries.map((message) => (
              <article key={message.id} className={`console-item console-item--${message.severity}`}>
                <span className="console-severity">{message.severity}</span>
                <div>
                  <strong>{message.location}</strong>
                  <p>{message.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
