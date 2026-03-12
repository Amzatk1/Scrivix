import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  projects as seedProjects,
  type BuildMessage,
  type ProjectRecord,
  type StatusTone,
} from "@/lib/product-data";
import {
  applyWorkspaceIntelligence,
  buildCommentActionItem,
  buildCommentRecord,
  buildSourceRecord,
  type CommentDraftInput,
  type SourceDraftInput,
} from "@/lib/document-intelligence";
import { runProjectCompileWorker, type CompileResult } from "@/lib/server/compile-runner";
import { generateProjectArtifactFile } from "@/lib/server/export-runner";
import {
  buildProjectFromTemplate,
  buildImportedProject,
  cloneRecord,
  fallbackDocumentForFile,
  type CreateProjectInput,
  type ImportProjectInput,
} from "@/lib/project-utils";
import { buildVersionSnapshot } from "@/lib/version-utils";
import { createFileRecord } from "@/lib/editor-utils";

const dataDirectory = path.join(process.cwd(), "data");
const exportDirectory = path.join(dataDirectory, "exports");
const storePath = path.join(dataDirectory, "projects.json");

async function ensureStoreFile() {
  await mkdir(dataDirectory, { recursive: true });
  await mkdir(exportDirectory, { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(cloneRecord(seedProjects), null, 2), "utf8");
  }
}

async function readProjectsFromDisk() {
  await ensureStoreFile();
  const fileContents = await readFile(storePath, "utf8");

  try {
    const parsed = JSON.parse(fileContents) as ProjectRecord[];
    if (Array.isArray(parsed)) {
      const normalizedProjects = parsed.map((project) => applyWorkspaceIntelligence(project));

      if (JSON.stringify(parsed) !== JSON.stringify(normalizedProjects)) {
        await writeProjectsToDisk(normalizedProjects);
      }

      return normalizedProjects;
    }
  } catch {
    // Fall through to reseed.
  }

  const reseededProjects = cloneRecord(seedProjects).map((project) => applyWorkspaceIntelligence(project));
  await writeProjectsToDisk(reseededProjects);
  return reseededProjects;
}

async function writeProjectsToDisk(projects: ProjectRecord[]) {
  await ensureStoreFile();
  await writeFile(storePath, JSON.stringify(projects, null, 2), "utf8");
}

function exportTimestamp() {
  return `Today, ${compileTimestamp()}`;
}

function compileTimestamp() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function analyzeProjectBuild(project: ProjectRecord) {
  const documents = Object.entries(project.workspace.documents);
  const combinedText = documents.map(([, content]) => content).join("\n");
  const nextMessages: BuildMessage[] = [];

  if (project.mode === "latex") {
    const beginTableCount = (combinedText.match(/\\begin\{table\}/g) ?? []).length;
    const endTableCount = (combinedText.match(/\\end\{table\}/g) ?? []).length;

    if (beginTableCount !== endTableCount) {
      nextMessages.push({
        severity: "error" as const,
        location: project.workspace.currentFile,
        text: "Unbalanced table environment detected. Check matching \\begin{table} and \\end{table}.",
      });
    }

    if (combinedText.includes("\\undefined") || combinedText.includes("\\badmacro")) {
      nextMessages.push({
        severity: "error" as const,
        location: project.workspace.currentFile,
        text: "Undefined LaTeX command detected in the current build graph.",
      });
    }
  }

  if (combinedText.toLowerCase().includes("todo_cite") || combinedText.toLowerCase().includes("needs citation")) {
    nextMessages.push({
      severity: "warn" as const,
      location: project.workspace.currentFile,
      text: "Citation placeholder still present in the draft. Resolve evidence coverage before final export.",
    });
  }

  documents
    .filter(([fileName]) => fileName.endsWith(".bib"))
    .forEach(([fileName, content]) => {
      if (!content.includes("year")) {
        nextMessages.push({
          severity: "warn" as const,
          location: fileName,
          text: "Bibliography entry missing a year field.",
        });
      }
    });

  if (project.workspace.evidenceIssues.length > 0) {
    nextMessages.push({
      severity: "warn" as const,
      location: project.workspace.evidenceIssues[0]?.location ?? project.workspace.currentFile,
      text: `${project.workspace.evidenceIssues.length} evidence ${project.workspace.evidenceIssues.length === 1 ? "gap remains" : "gaps remain"} before final export.`,
    });
  }

  if (nextMessages.length === 0) {
    nextMessages.push({
      severity: "info" as const,
      location: project.workspace.currentFile,
      text: `Build completed successfully at ${compileTimestamp()}.`,
    });
  }

  const hasError = nextMessages.some((message) => message.severity === "error");
  const hasWarn = nextMessages.some((message) => message.severity === "warn");
  const tone: StatusTone = hasError || hasWarn ? "warn" : "good";

  return {
    compileStatus: hasError ? "Build failed" : hasWarn ? "Build warnings" : "Build healthy",
    compileTone: tone,
    status: hasError ? "Build failed" : hasWarn ? "Build warnings" : "Build healthy",
    statusTone: tone,
    buildMessages: nextMessages,
  };
}

function buildInlineCompileFallback(project: ProjectRecord, reason: string): CompileResult {
  const buildResult = analyzeProjectBuild(project);

  return {
    ...buildResult,
    buildMessages: [
      {
        severity: "info",
        location: project.workspace.currentFile,
        text: reason,
      },
      ...buildResult.buildMessages,
    ],
    engineLabel: "inline fallback",
    engineDetail: reason,
  };
}

function applyCompileResult(
  project: ProjectRecord,
  buildResult: CompileResult,
  meta: string,
  historyLabel: string,
  historyMeta: string,
  lastBuildLabel: string,
) {
  const analyzedProject = applyWorkspaceIntelligence(project);

  return {
    ...analyzedProject,
    meta,
    status: buildResult.status,
    statusTone: buildResult.statusTone,
    workspace: {
      ...analyzedProject.workspace,
      compileStatus: buildResult.compileStatus,
      compileTone: buildResult.compileTone,
      lastExport: lastBuildLabel,
      buildMessages: buildResult.buildMessages,
      history: [
        {
          label: historyLabel,
          meta: historyMeta,
        },
        ...project.workspace.history.slice(0, 4),
      ],
    },
  };
}

function buildProjectStatus(
  project: ProjectRecord,
  meta: string,
  historyLabel: string,
  historyMeta: string,
  lastBuildLabel: string,
) {
  const analyzedProject = applyWorkspaceIntelligence(project);

  return applyCompileResult(
    analyzedProject,
    buildInlineCompileFallback(
      analyzedProject,
      "Build state refreshed with inline analysis after a local workspace change.",
    ),
    meta,
    historyLabel,
    historyMeta,
    lastBuildLabel,
  );
}

export async function listProjects() {
  return readProjectsFromDisk();
}

export async function getProject(projectSlug: string) {
  const projects = await readProjectsFromDisk();
  return projects.find((project) => project.slug === projectSlug);
}

export async function createProject(input: CreateProjectInput) {
  const projects = await readProjectsFromDisk();
  const project = buildProjectFromTemplate(input, projects);
  const nextProjects = [project, ...projects];
  await writeProjectsToDisk(nextProjects);
  return project;
}

export async function createImportedProject(input: ImportProjectInput) {
  const projects = await readProjectsFromDisk();
  const project = buildImportedProject(input, projects);
  const nextProjects = [project, ...projects];
  await writeProjectsToDisk(nextProjects);
  return project;
}

export async function selectProjectFile(projectSlug: string, fileName: string) {
  const projects = await readProjectsFromDisk();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    return applyWorkspaceIntelligence({
      ...project,
      workspace: {
        ...project.workspace,
        currentFile: fileName,
        files: project.workspace.files.map((file) => ({
          ...file,
          active: file.name === fileName,
        })),
        documents: {
          ...project.workspace.documents,
          [fileName]: project.workspace.documents[fileName] ?? fallbackDocumentForFile(fileName),
        },
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function updateProjectDocument(projectSlug: string, fileName: string, content: string) {
  const projects = await readProjectsFromDisk();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    return applyWorkspaceIntelligence({
      ...project,
      meta: "Saved to workspace",
      workspace: {
        ...project.workspace,
        documents: {
          ...project.workspace.documents,
          [fileName]: content,
        },
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function createProjectFile(projectSlug: string, fileName: string) {
  const projects = await readProjectsFromDisk();
  const trimmedFileName = fileName.trim();

  if (!trimmedFileName) {
    return null;
  }

  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    if (project.workspace.files.some((file) => file.name === trimmedFileName)) {
      return {
        ...project,
        meta: "File already exists",
      };
    }

    return applyWorkspaceIntelligence({
      ...project,
      meta: "File created",
      workspace: {
        ...project.workspace,
        currentFile: trimmedFileName,
        files: createFileRecord(trimmedFileName, project.workspace.files),
        documents: {
          ...project.workspace.documents,
          [trimmedFileName]: project.workspace.documents[trimmedFileName] ?? fallbackDocumentForFile(trimmedFileName),
        },
        history: [
          {
            label: "File created",
            meta: trimmedFileName,
          },
          ...project.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function createProjectSource(projectSlug: string, input: SourceDraftInput) {
  const projects = await readProjectsFromDisk();
  const title = input.title.trim();

  if (!title) {
    return null;
  }

  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const source = buildSourceRecord(input, project.workspace.sources);

    return applyWorkspaceIntelligence({
      ...project,
      meta: "Source added",
      workspace: {
        ...project.workspace,
        sources: [source, ...project.workspace.sources],
        history: [
          {
            label: "Source added",
            meta: source.title,
          },
          ...project.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function createProjectComment(projectSlug: string, input: CommentDraftInput) {
  const projects = await readProjectsFromDisk();
  const author = input.author.trim();
  const body = input.body.trim();
  const target = input.target.trim();

  if (!author || !body || !target) {
    return null;
  }

  const timestamp = `Today, ${compileTimestamp()}`;
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const comment = {
      ...buildCommentRecord(
        {
          author,
          body,
          target,
        },
        project.workspace.comments,
      ),
      createdAt: timestamp,
    };

    return applyWorkspaceIntelligence({
      ...project,
      meta: "Comment added",
      workspace: {
        ...project.workspace,
        comments: [comment, ...project.workspace.comments],
        history: [
          {
            label: "Comment added",
            meta: `${author} · ${target}`,
          },
          ...project.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function updateProjectCommentStatus(
  projectSlug: string,
  commentId: string,
  status: "open" | "resolved",
) {
  const projects = await readProjectsFromDisk();
  const timestamp = compileTimestamp();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const existingComment = project.workspace.comments.find((comment) => comment.id === commentId);

    if (!existingComment) {
      return {
        ...project,
        meta: "Comment not found",
      };
    }

    return applyWorkspaceIntelligence({
      ...project,
      meta: status === "resolved" ? "Comment resolved" : "Comment reopened",
      workspace: {
        ...project.workspace,
        comments: project.workspace.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                status,
              }
            : comment,
        ),
        history: [
          {
            label: status === "resolved" ? "Comment resolved" : "Comment reopened",
            meta: `${existingComment.author} · ${existingComment.target} · Today, ${timestamp}`,
          },
          ...project.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function queueProjectComment(projectSlug: string, commentId: string) {
  const projects = await readProjectsFromDisk();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const comment = project.workspace.comments.find((entry) => entry.id === commentId);

    if (!comment) {
      return {
        ...project,
        meta: "Comment not found",
      };
    }

    const queueItem = buildCommentActionItem(comment, project.queue, project.dueLabel || "Before export");

    if (project.queue.some((item) => item.id === queueItem.id || item.sourceId === commentId)) {
      return {
        ...project,
        meta: "Action already queued",
      };
    }

    return applyWorkspaceIntelligence({
      ...project,
      meta: "Comment converted to action",
      queue: [queueItem, ...project.queue].slice(0, 8),
      workspace: {
        ...project.workspace,
        history: [
          {
            label: "Queue item added",
            meta: `${comment.author} · ${comment.target}`,
          },
          ...project.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function completeProjectQueueItem(projectSlug: string, queueItemId: string) {
  const projects = await readProjectsFromDisk();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const existingAction = project.queue.find((item) => item.id === queueItemId);

    if (!existingAction) {
      return {
        ...project,
        meta: "Action not found",
      };
    }

    return applyWorkspaceIntelligence({
      ...project,
      meta: "Action completed",
      queue: project.queue.map((item) =>
        item.id === queueItemId
          ? {
              ...item,
              status: "done",
            }
          : item,
      ),
      workspace: {
        ...project.workspace,
        history: [
          {
            label: "Queue item completed",
            meta: existingAction.label,
          },
          ...project.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function createProjectSnapshot(projectSlug: string, label?: string) {
  const projects = await readProjectsFromDisk();
  const timestamp = `Today, ${compileTimestamp()}`;
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const analyzedProject = applyWorkspaceIntelligence(project);
    const trimmedLabel = label?.trim();
    const snapshotCount = analyzedProject.workspace.versionSnapshots?.length ?? 0;
    const snapshotLabel = trimmedLabel || `Snapshot ${snapshotCount + 1}`;
    const snapshot = buildVersionSnapshot(
      analyzedProject.workspace,
      snapshotLabel,
      timestamp,
      `snapshot-${Date.now()}`,
    );

    return applyWorkspaceIntelligence({
      ...analyzedProject,
      meta: "Snapshot saved",
      workspace: {
        ...analyzedProject.workspace,
        versionSnapshots: [snapshot, ...(analyzedProject.workspace.versionSnapshots ?? []).slice(0, 11)],
        history: [
          {
            label: "Snapshot saved",
            meta: snapshotLabel,
          },
          ...analyzedProject.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function selectProjectExportProfile(projectSlug: string, profileId: string) {
  const projects = await readProjectsFromDisk();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    return applyWorkspaceIntelligence({
      ...project,
      meta: "Export profile selected",
      workspace: {
        ...project.workspace,
        activeExportProfile: profileId,
        history: [
          {
            label: "Export profile selected",
            meta: profileId,
          },
          ...project.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function generateProjectExportArtifact(projectSlug: string) {
  const projects = await readProjectsFromDisk();
  const timestamp = exportTimestamp();
  let generatedArtifactPath: string | null = null;

  const nextProjects = await Promise.all(
    projects.map(async (project) => {
      if (project.slug !== projectSlug) {
        return project;
      }

      const analyzedProject = applyWorkspaceIntelligence(project);
      const activeProfile =
        analyzedProject.workspace.exportProfiles?.find(
          (profile) => profile.id === analyzedProject.workspace.activeExportProfile,
        ) ?? analyzedProject.workspace.exportProfiles?.[0];

      if (!activeProfile) {
        return {
          ...analyzedProject,
          meta: "No export profile available",
        };
      }

      const artifact = await generateProjectArtifactFile({
        exportDirectory,
        profile: activeProfile,
        project: analyzedProject,
        timestamp,
      });
      generatedArtifactPath = path.join(exportDirectory, artifact.downloadPath);

      return applyWorkspaceIntelligence({
        ...analyzedProject,
        meta: "Export package generated",
        workspace: {
          ...analyzedProject.workspace,
          lastExport: timestamp,
          exportArtifacts: [artifact, ...(analyzedProject.workspace.exportArtifacts ?? []).slice(0, 7)],
          history: [
            {
              label: "Export package generated",
              meta: activeProfile.label,
            },
            ...analyzedProject.workspace.history.slice(0, 4),
          ],
        },
      });
    }),
  );

  await writeProjectsToDisk(nextProjects);
  return {
    project: nextProjects.find((project) => project.slug === projectSlug),
    generatedArtifactPath,
  };
}

export async function compileProject(projectSlug: string) {
  const projects = await readProjectsFromDisk();
  const timestamp = compileTimestamp();

  const nextProjects = await Promise.all(
    projects.map(async (project) => {
      if (project.slug !== projectSlug) {
        return project;
      }

      const analyzedProject = applyWorkspaceIntelligence(project);
      let buildResult: CompileResult;

      try {
        buildResult = await runProjectCompileWorker(analyzedProject);
      } catch {
        buildResult = buildInlineCompileFallback(
          analyzedProject,
          "Compile worker failed to return a result, so Scrivix used inline analysis instead.",
        );
      }

      return applyCompileResult(
        analyzedProject,
        buildResult,
        `Compiled with ${buildResult.engineLabel} at ${timestamp}`,
        "Compile run",
        `${buildResult.engineLabel} · Today, ${timestamp}`,
        `Today, ${timestamp}`,
      );
    }),
  );

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function applyProjectRepair(projectSlug: string) {
  const projects = await readProjectsFromDisk();
  const timestamp = compileTimestamp();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const analyzedProject = applyWorkspaceIntelligence(project);
    const suggestion = analyzedProject.workspace.repairSuggestion;

    if (!suggestion) {
      return {
        ...analyzedProject,
        meta: "No deterministic repair suggestion available",
      };
    }

    const nextDocuments = cloneRecord(analyzedProject.workspace.documents);

    suggestion.operations.forEach((operation) => {
      nextDocuments[operation.fileName] = operation.afterContent;
    });

    return buildProjectStatus(
      {
        ...analyzedProject,
        workspace: {
          ...analyzedProject.workspace,
          currentFile: suggestion.operations[0]?.fileName ?? analyzedProject.workspace.currentFile,
          files: analyzedProject.workspace.files.map((file) => ({
            ...file,
            active: file.name === (suggestion.operations[0]?.fileName ?? analyzedProject.workspace.currentFile),
          })),
          documents: nextDocuments,
          rollbackSnapshot: {
            label: suggestion.title,
            appliedAt: `Today, ${timestamp}`,
            documents: cloneRecord(analyzedProject.workspace.documents),
          },
        },
      },
      `Repair applied at ${timestamp}`,
      "AI repair applied",
      suggestion.title,
      `Today, ${timestamp}`,
    );
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function rollbackProjectRepair(projectSlug: string) {
  const projects = await readProjectsFromDisk();
  const timestamp = compileTimestamp();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const analyzedProject = applyWorkspaceIntelligence(project);
    const rollbackSnapshot = analyzedProject.workspace.rollbackSnapshot;

    if (!rollbackSnapshot) {
      return {
        ...analyzedProject,
        meta: "No repair snapshot available",
      };
    }

    return buildProjectStatus(
      {
        ...analyzedProject,
        workspace: {
          ...analyzedProject.workspace,
          documents: cloneRecord(rollbackSnapshot.documents),
          rollbackSnapshot: null,
        },
      },
      `Repair rolled back at ${timestamp}`,
      "Repair rolled back",
      rollbackSnapshot.label,
      `Today, ${timestamp}`,
    );
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function restoreProjectSnapshot(projectSlug: string, snapshotId: string) {
  const projects = await readProjectsFromDisk();
  const timestamp = `Today, ${compileTimestamp()}`;
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const analyzedProject = applyWorkspaceIntelligence(project);
    const snapshots = analyzedProject.workspace.versionSnapshots ?? [];
    const snapshot = snapshots.find((entry) => entry.id === snapshotId);

    if (!snapshot) {
      return {
        ...analyzedProject,
        meta: "Snapshot not found",
      };
    }

    const safetySnapshot = buildVersionSnapshot(
      analyzedProject.workspace,
      `Auto snapshot before restoring ${snapshot.label}`,
      timestamp,
      `auto-${Date.now()}`,
    );

    return buildProjectStatus(
      {
        ...analyzedProject,
        workspace: {
          ...analyzedProject.workspace,
          currentFile: snapshot.currentFile,
          files: snapshot.files.map((file) => ({
            ...file,
            active: file.name === snapshot.currentFile,
          })),
          documents: cloneRecord(snapshot.documents),
          versionSnapshots: [safetySnapshot, ...snapshots.filter((entry) => entry.id !== safetySnapshot.id)].slice(0, 12),
        },
      },
      `Restored snapshot at ${compileTimestamp()}`,
      "Snapshot restored",
      snapshot.label,
      timestamp,
    );
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function runProjectSubmissionPreflight(projectSlug: string) {
  const projects = await readProjectsFromDisk();
  const timestamp = `Today, ${compileTimestamp()}`;
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    const analyzedProject = applyWorkspaceIntelligence(project);

    return applyWorkspaceIntelligence({
      ...analyzedProject,
      meta: "Submission preflight complete",
      status: analyzedProject.workspace.submissionStatus ?? analyzedProject.status,
      statusTone:
        analyzedProject.workspace.submissionStatus === "Blocked for export"
          ? "warn"
          : analyzedProject.workspace.submissionStatus === "Needs review before export"
            ? "neutral"
            : analyzedProject.statusTone,
      workspace: {
        ...analyzedProject.workspace,
        lastPreflight: timestamp,
        history: [
          {
            label: "Submission preflight",
            meta: timestamp,
          },
          ...analyzedProject.workspace.history.slice(0, 4),
        ],
      },
    });
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function getProjectExportArtifact(projectSlug: string, artifactId: string) {
  const project = await getProject(projectSlug);

  if (!project) {
    return null;
  }

  const artifact = project.workspace.exportArtifacts?.find((entry) => entry.id === artifactId);

  if (!artifact) {
    return null;
  }

  return {
    artifact,
    absolutePath: path.join(exportDirectory, artifact.downloadPath),
  };
}
