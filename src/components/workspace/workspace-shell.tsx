"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { DocumentEditor } from "@/components/editor/document-editor";
import { buildPreviewModel } from "@/lib/editor-utils";
import {
  canInsertCitationIntoFile,
  formatCitationToken,
  type CommentDraftInput,
  type SourceDraftInput,
} from "@/lib/document-intelligence";
import type { BuildSeverity, ProjectRecord, SubmissionCheck } from "@/lib/product-data";

const modeOptions = ["Draft", "Research", "Review", "Submission"] as const;
const utilityTabs = ["AI", "Sources", "Comments", "Trust", "History", "Submission"] as const;
const leftTabs = ["Files", "Outline", "Search"] as const;

type Mode = (typeof modeOptions)[number];
type UtilityTab = (typeof utilityTabs)[number];
type LeftTab = (typeof leftTabs)[number];

type WorkspaceShellProps = {
  isCompiling: boolean;
  isExporting: boolean;
  isRepairing: boolean;
  isSubmitting: boolean;
  isVersioning: boolean;
  onApplyRepair: () => void;
  onCompile: () => void;
  onCompleteQueueItem: (queueItem: string) => Promise<void> | void;
  onCreateComment: (input: CommentDraftInput) => Promise<void> | void;
  onCreateSnapshot: (snapshotLabel?: string) => void;
  onCreateFile: (fileName: string) => void;
  onCreateSource: (input: SourceDraftInput) => Promise<void> | void;
  onGenerateExportArtifact: () => void;
  onRollbackRepair: () => void;
  onRunSubmissionPreflight: () => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onQueueComment: (commentId: string) => Promise<void> | void;
  onSelectExportProfile: (profileId: string) => void;
  onUpdateCommentStatus: (commentId: string, status: "open" | "resolved") => Promise<void> | void;
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

type CommentDraftState = {
  author: string;
  body: string;
  target: string;
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

const emptyCommentDraft: CommentDraftState = {
  author: "",
  body: "",
  target: "",
};

function buildDiffPreview(beforeContent: string, afterContent: string) {
  const beforeLines = beforeContent.split("\n");
  const afterLines = afterContent.split("\n");
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
  isExporting,
  isRepairing,
  isSubmitting,
  isVersioning,
  onApplyRepair,
  onCompile,
  onCompleteQueueItem,
  onCreateComment,
  onCreateSnapshot,
  onCreateFile,
  onCreateSource,
  onGenerateExportArtifact,
  onRollbackRepair,
  onRunSubmissionPreflight,
  onRestoreSnapshot,
  onQueueComment,
  onSelectExportProfile,
  onUpdateCommentStatus,
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
  const [commentDraft, setCommentDraft] = useState<CommentDraftState>({
    ...emptyCommentDraft,
    target: workspace.currentFile,
  });
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showCommentComposer, setShowCommentComposer] = useState(false);
  const [showResolvedComments, setShowResolvedComments] = useState(false);
  const [showRepairDiff, setShowRepairDiff] = useState(false);
  const [showRepairExplanation, setShowRepairExplanation] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(workspace.versionSnapshots?.[0]?.id ?? null);
  const [citationInsertionRequest, setCitationInsertionRequest] = useState<{ id: string; text: string } | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const currentDocument =
    workspace.documents[workspace.currentFile] ?? `Start drafting in ${workspace.currentFile}.`;
  const previewModel = buildPreviewModel(currentDocument, workspace.currentFile, project.mode);
  const query = deferredSearchQuery.trim().toLowerCase();
  const canInsertCitation = canInsertCitationIntoFile(workspace.currentFile);
  const repairSuggestion = workspace.repairSuggestion ?? null;
  const hasRollbackSnapshot = Boolean(workspace.rollbackSnapshot);
  const exportProfiles = workspace.exportProfiles ?? [];
  const exportArtifacts = workspace.exportArtifacts ?? [];
  const activeExportProfile = workspace.activeExportProfile ?? exportProfiles[0]?.id ?? null;
  const activeProfileRecord = exportProfiles.find((profile) => profile.id === activeExportProfile) ?? exportProfiles[0] ?? null;
  const submissionChecks = workspace.submissionChecks ?? [];
  const queueItems = project.queue ?? [];
  const openQueueItems = queueItems.filter((item) => item.status !== "done");
  const completedQueueItems = queueItems.filter((item) => item.status === "done");
  const openComments = workspace.comments.filter((comment) => comment.status !== "resolved");
  const resolvedComments = workspace.comments.filter((comment) => comment.status === "resolved");
  const visibleComments = showResolvedComments ? workspace.comments : openComments;
  const versionSnapshots = workspace.versionSnapshots ?? [];
  const selectedSnapshot =
    versionSnapshots.find((snapshot) => snapshot.id === selectedSnapshotId) ?? versionSnapshots[0] ?? null;
  const compareFileName = selectedSnapshot
    ? selectedSnapshot.documents[workspace.currentFile]
      ? workspace.currentFile
      : selectedSnapshot.currentFile
    : workspace.currentFile;
  const snapshotCompare = selectedSnapshot
    ? buildDiffPreview(selectedSnapshot.documents[compareFileName] ?? "", workspace.documents[compareFileName] ?? "")
    : null;
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

  useEffect(() => {
    if (mode === "Submission") {
      setShowUtility(true);
      setUtilityTab("Submission");
    }
  }, [mode]);

  useEffect(() => {
    if (!selectedSnapshotId && versionSnapshots.length > 0) {
      setSelectedSnapshotId(versionSnapshots[0]?.id ?? null);
      return;
    }

    if (selectedSnapshotId && !versionSnapshots.some((snapshot) => snapshot.id === selectedSnapshotId)) {
      setSelectedSnapshotId(versionSnapshots[0]?.id ?? null);
    }
  }, [selectedSnapshotId, versionSnapshots]);

  useEffect(() => {
    setCommentDraft((current) => (current.target ? current : { ...current, target: workspace.currentFile }));
  }, [workspace.currentFile]);

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

  async function handleCreateComment() {
    if (!commentDraft.author.trim() || !commentDraft.body.trim() || !commentDraft.target.trim()) {
      return;
    }

    setIsAddingComment(true);

    try {
      await onCreateComment(commentDraft);
      setCommentDraft({
        ...emptyCommentDraft,
        target: workspace.currentFile,
      });
      setShowCommentComposer(false);
    } finally {
      setIsAddingComment(false);
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

  function jumpToSubmissionCheck(check: SubmissionCheck) {
    if (check.location) {
      jumpToIssue(check.location);
      return;
    }

    setUtilityTab("Submission");
    setShowUtility(true);
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
          <button
            className="ghost-button"
            onClick={() => {
              setMode("Submission");
              setShowUtility(true);
              setUtilityTab("Submission");
            }}
            type="button"
          >
            {activeProfileRecord ? activeProfileRecord.label : "Export"}
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
                <button
                  className="ghost-button"
                  onClick={() => {
                    setMode("Submission");
                    setShowUtility(true);
                    setUtilityTab("Submission");
                  }}
                  type="button"
                >
                  Open submission preflight
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
                          const preview = buildDiffPreview(operation.beforeContent, operation.afterContent);

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

                <div className="assistant-card">
                  <div className="utility-section-header utility-section-header--compact">
                    <div>
                      <p className="eyebrow">Action queue</p>
                      <h3>{openQueueItems.length} active items</h3>
                    </div>
                    <span className="quiet-label">{completedQueueItems.length} done</span>
                  </div>
                  {openQueueItems.length > 0 ? (
                    <div className="queue-list queue-list--utility">
                      {openQueueItems.slice(0, 6).map((item) => (
                        <div key={item.id} className="queue-item queue-item--utility">
                          <span className="queue-dot" />
                          <div className="queue-item__body">
                            <p>{item.label}</p>
                            <small>
                              {item.owner ?? "Unassigned"}
                              {item.target ? ` · ${item.target}` : ""}
                              {item.dueLabel ? ` · ${item.dueLabel}` : ""}
                            </small>
                          </div>
                          <button className="ghost-button ghost-button--compact" onClick={() => void onCompleteQueueItem(item.id)} type="button">
                            Done
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="utility-banner utility-banner--positive">
                      No queued actions right now. Convert a comment into an action item when review feedback needs follow-through.
                    </div>
                  )}
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
                <div className="utility-section-header">
                  <div>
                    <p className="eyebrow">Review threads</p>
                    <h3>{openComments.length} open comments</h3>
                  </div>
                  <button
                    className="ghost-button ghost-button--compact"
                    onClick={() => {
                      setShowCommentComposer((value) => !value);
                      setCommentDraft((current) => ({
                        ...current,
                        target: current.target || workspace.currentFile,
                      }));
                    }}
                    type="button"
                  >
                    {showCommentComposer ? "Close" : "Add comment"}
                  </button>
                </div>

                <div className="assistant-actions">
                  <button className="ghost-button ghost-button--compact" onClick={() => setShowResolvedComments((value) => !value)} type="button">
                    {showResolvedComments ? "Hide resolved" : `Show resolved (${resolvedComments.length})`}
                  </button>
                </div>

                {showCommentComposer && (
                  <div className="source-form-card">
                    <div className="source-form-grid">
                      <label className="source-field">
                        <span>Author</span>
                        <input
                          onChange={(event) => setCommentDraft((current) => ({ ...current, author: event.target.value }))}
                          placeholder="Reviewer name"
                          value={commentDraft.author}
                        />
                      </label>
                      <label className="source-field">
                        <span>Target</span>
                        <input
                          onChange={(event) => setCommentDraft((current) => ({ ...current, target: event.target.value }))}
                          placeholder={workspace.currentFile}
                          value={commentDraft.target}
                        />
                      </label>
                      <label className="source-field source-field--full">
                        <span>Comment</span>
                        <textarea
                          onChange={(event) => setCommentDraft((current) => ({ ...current, body: event.target.value }))}
                          placeholder="Add a review note or revision request"
                          rows={3}
                          value={commentDraft.body}
                        />
                      </label>
                    </div>
                    <div className="assistant-actions">
                      <button className="primary-button" disabled={isAddingComment} onClick={() => void handleCreateComment()} type="button">
                        {isAddingComment ? "Adding..." : "Save comment"}
                      </button>
                      <button
                        className="ghost-button"
                        onClick={() => {
                          setCommentDraft({
                            ...emptyCommentDraft,
                            target: workspace.currentFile,
                          });
                          setShowCommentComposer(false);
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {visibleComments.length > 0 ? (
                  visibleComments.map((comment) => {
                    const canOpenTarget = Boolean(workspace.documents[comment.target]);
                    const alreadyQueued = queueItems.some((item) => item.sourceId === comment.id && item.status !== "done");

                    return (
                      <article
                        key={comment.id}
                        className={comment.status === "resolved" ? "comment-card comment-card--resolved" : "comment-card"}
                      >
                        <div className="comment-card__header">
                          <div>
                            <strong>{comment.author}</strong>
                            <span>{comment.target}</span>
                          </div>
                          <span className={comment.status === "resolved" ? "status-chip status-chip--good" : "status-chip status-chip--neutral"}>
                            {comment.status === "resolved" ? "Resolved" : "Open"}
                          </span>
                        </div>
                        <p>{comment.body}</p>
                        <div className="comment-card__meta">
                          <small>{comment.createdAt ?? "Today"}</small>
                        </div>
                        <div className="assistant-actions">
                          {canOpenTarget && (
                            <button className="ghost-button ghost-button--compact" onClick={() => onSelectFile(comment.target)} type="button">
                              Open file
                            </button>
                          )}
                          <button
                            className="ghost-button ghost-button--compact"
                            disabled={alreadyQueued}
                            onClick={() => void onQueueComment(comment.id)}
                            type="button"
                          >
                            {alreadyQueued ? "Queued" : "Add to queue"}
                          </button>
                          <button
                            className="ghost-button ghost-button--compact"
                            onClick={() => void onUpdateCommentStatus(comment.id, comment.status === "resolved" ? "open" : "resolved")}
                            type="button"
                          >
                            {comment.status === "resolved" ? "Reopen" : "Resolve"}
                          </button>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="utility-banner utility-banner--positive">
                    No {showResolvedComments ? "" : "open "}comments to review right now.
                  </div>
                )}
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
                <div className="utility-section-header">
                  <div>
                    <p className="eyebrow">Snapshots</p>
                    <h3>{versionSnapshots.length} saved revisions</h3>
                  </div>
                  <button
                    className="ghost-button ghost-button--compact"
                    disabled={isVersioning}
                    onClick={() => {
                      const label = window.prompt("Name this snapshot", `${project.title} checkpoint`);

                      if (!label) {
                        return;
                      }

                      onCreateSnapshot(label.trim());
                    }}
                    type="button"
                  >
                    {isVersioning ? "Saving..." : "Save snapshot"}
                  </button>
                </div>

                {versionSnapshots.length > 0 ? (
                  <div className="snapshot-stack">
                    {versionSnapshots.map((snapshot) => (
                      <button
                        key={snapshot.id}
                        className={snapshot.id === selectedSnapshot?.id ? "snapshot-card snapshot-card--active" : "snapshot-card"}
                        onClick={() => setSelectedSnapshotId(snapshot.id)}
                        type="button"
                      >
                        <strong>{snapshot.label}</strong>
                        <span>{snapshot.createdAt}</span>
                        <small>
                          {Object.keys(snapshot.documents).length} files · {snapshot.currentFile}
                        </small>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="utility-banner">No snapshots saved yet. Create a checkpoint before deeper revisions.</div>
                )}

                {selectedSnapshot && snapshotCompare && (
                  <div className="history-compare-card">
                    <div className="utility-section-header utility-section-header--compact">
                      <div>
                        <p className="eyebrow">Compare</p>
                        <h3>{selectedSnapshot.label}</h3>
                      </div>
                      <div className="assistant-actions">
                        <button
                          className="ghost-button ghost-button--compact"
                          onClick={() => {
                            if (compareFileName !== workspace.currentFile) {
                              onSelectFile(compareFileName);
                            }
                          }}
                          type="button"
                        >
                          Open file
                        </button>
                        <button
                          className="primary-button"
                          disabled={isVersioning}
                          onClick={() => onRestoreSnapshot(selectedSnapshot.id)}
                          type="button"
                        >
                          {isVersioning ? "Restoring..." : "Restore snapshot"}
                        </button>
                      </div>
                    </div>

                    <div className="assistant-meta">
                      <span>Comparing file: {compareFileName}</span>
                      <span>Snapshot time: {selectedSnapshot.createdAt}</span>
                    </div>

                    <div className="repair-diff-grid">
                      <div className="repair-diff-block repair-diff-block--before">
                        <p>Snapshot</p>
                        <pre>{snapshotCompare.before || "No content in this file at snapshot time."}</pre>
                      </div>
                      <div className="repair-diff-block repair-diff-block--after">
                        <p>Current</p>
                        <pre>{snapshotCompare.after || "No content in the current workspace file."}</pre>
                      </div>
                    </div>
                  </div>
                )}

                <div className="utility-section-header utility-section-header--compact">
                  <div>
                    <p className="eyebrow">Activity</p>
                    <h3>Recent workspace events</h3>
                  </div>
                </div>
                {workspace.history.map((event) => (
                  <article key={`${event.label}-${event.meta}`} className="history-card">
                    <strong>{event.label}</strong>
                    <span>{event.meta}</span>
                  </article>
                ))}
              </div>
            )}

            {utilityTab === "Submission" && (
              <div className="utility-content">
                <div className="assistant-card assistant-card--primary">
                  <p className="eyebrow">Submission readiness</p>
                  <h3>{workspace.submissionStatus ?? "Needs review before export"}</h3>
                  <p>
                    {activeProfileRecord
                      ? `${activeProfileRecord.label} is selected as the current export target. ${activeProfileRecord.description}`
                      : "Choose an export profile before running a final preflight."}
                  </p>
                  <div className="assistant-meta">
                    <span>Last preflight: {workspace.lastPreflight ?? "Not run yet"}</span>
                    <span>Last export state: {workspace.lastExport}</span>
                  </div>
                  <div className="assistant-actions">
                    <button className="primary-button" disabled={isSubmitting} onClick={onRunSubmissionPreflight} type="button">
                      {isSubmitting ? "Running..." : "Run preflight"}
                    </button>
                    <button className="ghost-button" disabled={isExporting} onClick={onGenerateExportArtifact} type="button">
                      {isExporting ? "Generating..." : "Generate export"}
                    </button>
                    <button
                      className="ghost-button"
                      disabled={isVersioning}
                      onClick={() => onCreateSnapshot(`${project.title} submission checkpoint`)}
                      type="button"
                    >
                      {isVersioning ? "Saving..." : "Save submission snapshot"}
                    </button>
                  </div>
                </div>

                <div className="utility-section-header utility-section-header--compact">
                  <div>
                    <p className="eyebrow">Export profiles</p>
                    <h3>{exportProfiles.length} available outputs</h3>
                  </div>
                </div>
                <div className="snapshot-stack">
                  {exportProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      className={profile.id === activeExportProfile ? "snapshot-card snapshot-card--active" : "snapshot-card"}
                      onClick={() => onSelectExportProfile(profile.id)}
                      type="button"
                    >
                      <strong>{profile.label}</strong>
                      <span>{profile.format.toUpperCase()}</span>
                      <small>{profile.description}</small>
                    </button>
                  ))}
                </div>

                <div className="utility-section-header utility-section-header--compact">
                  <div>
                    <p className="eyebrow">Preflight checks</p>
                    <h3>{submissionChecks.length} checks evaluated</h3>
                  </div>
                </div>
                <div className="trust-list">
                  {submissionChecks.map((check) => (
                    <article key={check.id} className={`trust-issue trust-issue--${check.tone}`}>
                      <div>
                        <strong>{check.label}</strong>
                        <p>{check.detail}</p>
                        <small>Status: {check.status}</small>
                      </div>
                      <button className="ghost-button ghost-button--compact" onClick={() => jumpToSubmissionCheck(check)} type="button">
                        {check.location ? "Open file" : "View"}
                      </button>
                    </article>
                  ))}
                </div>

                <div className="utility-section-header utility-section-header--compact">
                  <div>
                    <p className="eyebrow">Generated artifacts</p>
                    <h3>{exportArtifacts.length} downloadable exports</h3>
                  </div>
                </div>
                {exportArtifacts.length > 0 ? (
                  <div className="snapshot-stack">
                    {exportArtifacts.map((artifact) => (
                      <article key={artifact.id} className="history-card history-card--artifact">
                        <strong>{artifact.profileLabel}</strong>
                        <span>
                          {artifact.outputFormat.toUpperCase()} {artifact.outputFormat === "zip" ? "archive" : "file"} · {artifact.sizeLabel}
                        </span>
                        <small>
                          Target: {artifact.targetFormat.toUpperCase()} · {artifact.createdAt}
                        </small>
                        <p>{artifact.summary}</p>
                        <div className="assistant-actions">
                          <a
                            className="ghost-button ghost-button--compact"
                            download={artifact.fileName}
                            href={`/api/projects/${project.slug}/exports/${artifact.id}`}
                          >
                            Download
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="utility-banner">No exports generated yet. Run preflight, then generate an artifact for download.</div>
                )}
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
              {submissionChecks.some((check) => check.status !== "ready") && (
                <button
                  className="ghost-button"
                  onClick={() => {
                    setMode("Submission");
                    setShowUtility(true);
                    setUtilityTab("Submission");
                  }}
                  type="button"
                >
                  Review preflight
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
