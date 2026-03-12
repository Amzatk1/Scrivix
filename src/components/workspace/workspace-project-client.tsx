"use client";

import Link from "next/link";
import { useScrivix } from "@/components/providers/scrivix-provider";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

type WorkspaceProjectClientProps = {
  projectSlug: string;
};

export function WorkspaceProjectClient({ projectSlug }: WorkspaceProjectClientProps) {
  const {
    applyProjectRepair,
    compileProject,
    compilingProjectSlugs,
    createProjectFile,
    createProjectSource,
    hydrated,
    projects,
    repairingProjectSlugs,
    rollbackProjectRepair,
    selectProjectFile,
    syncError,
    updateProjectDocument,
  } = useScrivix();
  const project = projects.find((entry) => entry.slug === projectSlug);
  const isCompiling = compilingProjectSlugs.includes(projectSlug);
  const isRepairing = repairingProjectSlugs.includes(projectSlug);

  if (!project && !hydrated) {
    return (
      <main className="workspace-page">
        <div className="workspace-page__frame">
          <div className="empty-state-panel panel">
            <p className="eyebrow">Loading workspace</p>
            <h1>Preparing your project state.</h1>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="workspace-page">
        <div className="workspace-page__frame">
          <div className="empty-state-panel panel">
            <p className="eyebrow">Project not found</p>
            <h1>This workspace does not exist in local storage.</h1>
            <p className="directory-subtitle">
              Create a new project or return to the project browser to open an existing workspace.
            </p>
            <div className="launch-cta__actions">
              <Link className="ghost-button" href="/projects">
                Browse projects
              </Link>
              <Link className="primary-button" href="/projects/new">
                Create project
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="workspace-page">
      <div className="workspace-page__frame">
        <div className="workspace-page__header workspace-page__header--row">
          <Link className="workspace-backlink" href="/dashboard">
            Back to dashboard
          </Link>
          <div className="workspace-page__header-actions">
            <Link className="ghost-button" href="/projects">
              Browse projects
            </Link>
            <Link className="ghost-button" href="/projects/new">
              New project
            </Link>
          </div>
        </div>
        {syncError && <div className="sync-banner panel">{syncError}</div>}
        <WorkspaceShell
          isCompiling={isCompiling}
          isRepairing={isRepairing}
          onApplyRepair={() => applyProjectRepair(project.slug)}
          onCompile={() => compileProject(project.slug)}
          onCreateFile={(fileName) => createProjectFile(project.slug, fileName)}
          onCreateSource={(input) => createProjectSource(project.slug, input)}
          onRollbackRepair={() => rollbackProjectRepair(project.slug)}
          onSelectFile={(fileName) => selectProjectFile(project.slug, fileName)}
          onUpdateDocument={(fileName, content) => updateProjectDocument(project.slug, fileName, content)}
          project={project}
        />
      </div>
    </main>
  );
}
