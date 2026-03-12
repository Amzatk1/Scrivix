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
    completeProjectQueueItem,
    createProjectComment,
    compilingProjectSlugs,
    createProjectSnapshot,
    createProjectFile,
    createProjectSource,
    exportingProjectSlugs,
    generateProjectExportArtifact,
    hydrated,
    projects,
    queueProjectComment,
    repairingProjectSlugs,
    runProjectSubmissionPreflight,
    restoreProjectSnapshot,
    rollbackProjectRepair,
    selectProjectFile,
    selectProjectExportProfile,
    submittingProjectSlugs,
    syncError,
    updateProjectCommentStatus,
    updateProjectDocument,
    versioningProjectSlugs,
  } = useScrivix();
  const project = projects.find((entry) => entry.slug === projectSlug);
  const isCompiling = compilingProjectSlugs.includes(projectSlug);
  const isExporting = exportingProjectSlugs.includes(projectSlug);
  const isRepairing = repairingProjectSlugs.includes(projectSlug);
  const isSubmitting = submittingProjectSlugs.includes(projectSlug);
  const isVersioning = versioningProjectSlugs.includes(projectSlug);

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
          isExporting={isExporting}
          isRepairing={isRepairing}
          isSubmitting={isSubmitting}
          isVersioning={isVersioning}
          onApplyRepair={() => applyProjectRepair(project.slug)}
          onCompile={() => compileProject(project.slug)}
          onCompleteQueueItem={(queueItem) => completeProjectQueueItem(project.slug, queueItem)}
          onCreateComment={(input) => createProjectComment(project.slug, input)}
          onCreateSnapshot={(snapshotLabel) => createProjectSnapshot(project.slug, snapshotLabel)}
          onCreateFile={(fileName) => createProjectFile(project.slug, fileName)}
          onCreateSource={(input) => createProjectSource(project.slug, input)}
          onGenerateExportArtifact={() => generateProjectExportArtifact(project.slug)}
          onRollbackRepair={() => rollbackProjectRepair(project.slug)}
          onRunSubmissionPreflight={() => runProjectSubmissionPreflight(project.slug)}
          onRestoreSnapshot={(snapshotId) => restoreProjectSnapshot(project.slug, snapshotId)}
          onSelectExportProfile={(profileId) => selectProjectExportProfile(project.slug, profileId)}
          onSelectFile={(fileName) => selectProjectFile(project.slug, fileName)}
          onQueueComment={(commentId) => queueProjectComment(project.slug, commentId)}
          onUpdateCommentStatus={(commentId, status) => updateProjectCommentStatus(project.slug, commentId, status)}
          onUpdateDocument={(fileName, content) => updateProjectDocument(project.slug, fileName, content)}
          project={project}
        />
      </div>
    </main>
  );
}
