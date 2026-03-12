"use client";

import { useState } from "react";
import type { ProjectRecord } from "@/lib/product-data";

const modeOptions = ["Draft", "Research", "Review", "Submission"] as const;
const utilityTabs = ["AI", "Sources", "Comments", "Trust", "History"] as const;
const leftTabs = ["Files", "Outline", "Search"] as const;

type Mode = (typeof modeOptions)[number];
type UtilityTab = (typeof utilityTabs)[number];
type LeftTab = (typeof leftTabs)[number];

type WorkspaceShellProps = {
  project: ProjectRecord;
};

export function WorkspaceShell({ project }: WorkspaceShellProps) {
  const workspace = project.workspace;
  const [mode, setMode] = useState<Mode>(workspace.defaultMode);
  const [utilityTab, setUtilityTab] = useState<UtilityTab>("AI");
  const [leftTab, setLeftTab] = useState<LeftTab>("Files");
  const [showPreview, setShowPreview] = useState(true);
  const [showUtility, setShowUtility] = useState(true);
  const [showConsole, setShowConsole] = useState(true);

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
          <button className="primary-button" type="button">
            Compile
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
                <button className="inline-action" type="button">
                  New file
                </button>
              </div>
              <ul className="tree-list">
                {workspace.files.map((file) => (
                  <li key={file.name} className={file.active ? "tree-item tree-item--active" : "tree-item"}>
                    <span className={`tree-badge tree-badge--${file.type}`}>{file.type.slice(0, 1).toUpperCase()}</span>
                    <span>{file.name}</span>
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
                <input id="project-search" placeholder="Find files, comments, sources..." />
              </div>
              {workspace.searchHits.map((hit) => (
                <div key={hit.term} className="search-result-card">
                  <p>Recent hit</p>
                  <strong>{hit.term}</strong>
                  <span>{hit.summary}</span>
                </div>
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

              <pre className="editor-surface">{workspace.editorSample}</pre>

              <div className="editor-footer">
                <button className="ghost-button" type="button">
                  Explain selected issue
                </button>
                <button className="ghost-button" type="button">
                  Suggest minimal patch
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
                  {workspace.previewParagraphs.map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`} className={index === 0 ? "page-preview__title" : ""}>
                      {paragraph}
                    </p>
                  ))}
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
                <div className="assistant-card assistant-card--primary">
                  <p className="eyebrow">Agentic assist</p>
                  <h3>{workspace.aiAssist.title}</h3>
                  <p>{workspace.aiAssist.body}</p>
                  <div className="assistant-actions">
                    <button className="primary-button" type="button">
                      Review diff
                    </button>
                    <button className="ghost-button" type="button">
                      Explain change
                    </button>
                  </div>
                </div>

                <div className="assistant-card">
                  <p className="eyebrow">Next step</p>
                  <p>{workspace.nextStep}</p>
                </div>
              </div>
            )}

            {utilityTab === "Sources" && (
              <div className="utility-content">
                {workspace.sources.map((source) => (
                  <article key={source.title} className="source-card">
                    <strong>{source.title}</strong>
                    <span>{source.detail}</span>
                    <small>{source.state}</small>
                  </article>
                ))}
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
                {workspace.trustSignals.map((signal) => (
                  <article key={signal.label} className={`signal-card signal-card--${signal.tone}`}>
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                  </article>
                ))}
              </div>
            )}

            {utilityTab === "History" && (
              <div className="utility-content">
                {workspace.history.map((event) => (
                  <article key={event.label} className="history-card">
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
              <h3>Warnings, errors, and export health</h3>
            </div>
            <button className="ghost-button" type="button">
              Jump to next issue
            </button>
          </div>

          <div className="console-list">
            {workspace.buildMessages.map((message) => (
              <article key={`${message.location}-${message.severity}`} className={`console-item console-item--${message.severity}`}>
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
