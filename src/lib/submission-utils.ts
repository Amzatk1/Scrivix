import {
  getTemplateBySlug,
  type ExportProfile,
  type ProjectRecord,
  type SubmissionCheck,
} from "@/lib/product-data";

function uniqueProfiles(profiles: ExportProfile[]) {
  const seen = new Set<string>();

  return profiles.filter((profile) => {
    if (seen.has(profile.id)) {
      return false;
    }

    seen.add(profile.id);
    return true;
  });
}

export function deriveExportProfiles(project: ProjectRecord) {
  if (project.workspace.exportProfiles && project.workspace.exportProfiles.length > 0) {
    return project.workspace.exportProfiles;
  }

  const template = getTemplateBySlug(project.templateSlug);
  const profiles: ExportProfile[] = [];

  if (project.mode === "latex") {
    profiles.push(
      {
        id: "thesis-pdf",
        label: "Thesis PDF",
        format: "pdf",
        description: "Compile the primary LaTeX build into a submission-ready PDF.",
      },
      {
        id: "source-archive",
        label: "Source Archive",
        format: "zip",
        description: "Bundle source files, bibliography, and config for archive or supervisor handoff.",
      },
    );
  } else if (project.mode === "markdown") {
    profiles.push(
      {
        id: "review-pdf",
        label: "Review PDF",
        format: "pdf",
        description: "Generate a review copy that preserves section structure and comments context.",
      },
      {
        id: "handoff-docx",
        label: "DOCX Handoff",
        format: "docx",
        description: "Prepare a Word-compatible handoff for stakeholder edits.",
      },
      {
        id: "publish-html",
        label: "Publish HTML",
        format: "html",
        description: "Prepare a clean HTML export for technical publishing flows.",
      },
    );
  } else {
    profiles.push(
      {
        id: "review-pdf",
        label: "Review PDF",
        format: "pdf",
        description: "Create a polished PDF for review or submission.",
      },
      {
        id: "handoff-docx",
        label: "DOCX Handoff",
        format: "docx",
        description: "Export a document-editable version for collaborators and reviewers.",
      },
    );
  }

  if (template?.output.includes("HTML")) {
    profiles.push({
      id: "publish-html",
      label: "Publish HTML",
      format: "html",
      description: "Prepare a web-ready export using the current structure and citations.",
    });
  }

  return uniqueProfiles(profiles);
}

export function deriveActiveExportProfile(project: ProjectRecord, exportProfiles: ExportProfile[]) {
  return (
    project.workspace.activeExportProfile ??
    exportProfiles[0]?.id ??
    null
  );
}

export function deriveSubmissionChecks(project: ProjectRecord, activeExportProfile: string | null) {
  const buildMessages = project.workspace.buildMessages ?? [];
  const hasBuildError = buildMessages.some((message) => message.severity === "error");
  const hasBuildWarning = buildMessages.some((message) => message.severity === "warn");
  const uncitedSourceCount = project.workspace.sources.filter((source) => /^uncited$/i.test(source.state)).length;
  const versionSnapshotCount = project.workspace.versionSnapshots?.length ?? 0;
  const unresolvedComments = project.workspace.comments.filter((comment) => comment.status !== "resolved").length;
  const resolvedComments = project.workspace.comments.length - unresolvedComments;
  const evidenceGapCount = project.workspace.evidenceIssues.length;

  const checks: SubmissionCheck[] = [
    {
      id: "build-health",
      label: "Build health",
      detail: hasBuildError
        ? "The project still has blocking build errors."
        : hasBuildWarning
          ? "The build succeeds with warnings that should be reviewed before export."
          : "The latest build state is healthy for export.",
      status: hasBuildError ? "block" : hasBuildWarning ? "warn" : "ready",
      tone: hasBuildError ? "warn" : hasBuildWarning ? "neutral" : "good",
      location: buildMessages.find((message) => message.severity !== "info")?.location,
    },
    {
      id: "evidence-coverage",
      label: "Evidence coverage",
      detail:
        evidenceGapCount > 0
          ? `${evidenceGapCount} evidence ${evidenceGapCount === 1 ? "gap remains" : "gaps remain"} in the draft.`
          : "No active evidence gaps are surfaced in the current draft.",
      status: evidenceGapCount >= 3 ? "block" : evidenceGapCount > 0 ? "warn" : "ready",
      tone: evidenceGapCount >= 3 ? "warn" : evidenceGapCount > 0 ? "neutral" : "good",
      location: project.workspace.evidenceIssues[0]?.location,
    },
    {
      id: "review-resolution",
      label: "Review resolution",
      detail:
        unresolvedComments > 0
          ? `${unresolvedComments} reviewer ${unresolvedComments === 1 ? "comment is" : "comments are"} still open in the workspace.`
          : resolvedComments > 0
            ? `All reviewer comments are resolved. ${resolvedComments} resolved ${resolvedComments === 1 ? "comment" : "comments"} remain in history.`
            : "No unresolved reviewer comments remain in the current workspace.",
      status: unresolvedComments >= 4 ? "block" : unresolvedComments > 0 ? "warn" : "ready",
      tone: unresolvedComments >= 4 ? "warn" : unresolvedComments > 0 ? "neutral" : "good",
    },
    {
      id: "source-readiness",
      label: "Source readiness",
      detail:
        project.workspace.sources.length === 0
          ? "No sources are attached to this project yet."
          : uncitedSourceCount > 0
            ? `${uncitedSourceCount} source ${uncitedSourceCount === 1 ? "remains" : "remain"} uncited or unlinked.`
            : "All current sources are linked or cited in the workspace.",
      status:
        project.workspace.sources.length === 0 ? "block" : uncitedSourceCount > 2 ? "warn" : "ready",
      tone:
        project.workspace.sources.length === 0 ? "warn" : uncitedSourceCount > 2 ? "neutral" : "good",
    },
    {
      id: "revision-safety",
      label: "Revision safety",
      detail:
        versionSnapshotCount > 1
          ? `${versionSnapshotCount} saved snapshot${versionSnapshotCount === 1 ? "" : "s"} available for rollback and compare.`
          : "Create at least one named snapshot before final export so the current state can be restored safely.",
      status: versionSnapshotCount > 1 ? "ready" : "warn",
      tone: versionSnapshotCount > 1 ? "good" : "neutral",
    },
    {
      id: "export-profile",
      label: "Export profile",
      detail: activeExportProfile
        ? `The current preflight target is ${activeExportProfile}.`
        : "Choose an export profile before running a final preflight.",
      status: activeExportProfile ? "ready" : "warn",
      tone: activeExportProfile ? "good" : "neutral",
    },
  ];

  return checks;
}

export function deriveSubmissionStatus(checks: SubmissionCheck[]) {
  if (checks.some((check) => check.status === "block")) {
    return "Blocked for export";
  }

  if (checks.some((check) => check.status === "warn")) {
    return "Needs review before export";
  }

  return "Ready to export";
}
