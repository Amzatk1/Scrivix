import { NextResponse } from "next/server";
import {
  applyProjectRepair,
  createProjectSnapshot,
  createProjectFile,
  createProjectSource,
  generateProjectExportArtifact,
  getProject,
  rollbackProjectRepair,
  runProjectSubmissionPreflight,
  restoreProjectSnapshot,
  selectProjectExportProfile,
  selectProjectFile,
  updateProjectDocument,
} from "@/lib/server/project-store";

type RouteContext = {
  params: Promise<{
    projectSlug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { projectSlug } = await context.params;
  const project = await getProject(projectSlug);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { projectSlug } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | {
        action?: string;
        fileName?: string;
        content?: string;
        exportProfileId?: string;
        snapshotId?: string;
        snapshotLabel?: string;
        source?: {
          title?: string;
          detail?: string;
          author?: string;
          year?: string;
          citationKey?: string;
        };
      }
    | null;

  if (!body?.action) {
    return NextResponse.json({ error: "Invalid patch payload." }, { status: 400 });
  }

  if (body.action === "selectFile") {
    if (!body.fileName) {
      return NextResponse.json({ error: "Missing file name." }, { status: 400 });
    }

    const project = await selectProjectFile(projectSlug, body.fileName);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "updateDocument" && typeof body.content === "string") {
    if (!body.fileName) {
      return NextResponse.json({ error: "Missing file name." }, { status: 400 });
    }

    const project = await updateProjectDocument(projectSlug, body.fileName, body.content);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "createFile") {
    if (!body.fileName) {
      return NextResponse.json({ error: "Missing file name." }, { status: 400 });
    }

    const project = await createProjectFile(projectSlug, body.fileName);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "createSource") {
    if (!body.source?.title || !body.source?.detail) {
      return NextResponse.json({ error: "Invalid source payload." }, { status: 400 });
    }

    const project = await createProjectSource(projectSlug, {
      title: body.source.title,
      detail: body.source.detail,
      author: body.source.author,
      year: body.source.year,
      citationKey: body.source.citationKey,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "createSnapshot") {
    const project = await createProjectSnapshot(projectSlug, body.snapshotLabel);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "selectExportProfile") {
    if (!body.exportProfileId) {
      return NextResponse.json({ error: "Missing export profile identifier." }, { status: 400 });
    }

    const project = await selectProjectExportProfile(projectSlug, body.exportProfileId);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "generateExportArtifact") {
    const result = await generateProjectExportArtifact(projectSlug);

    if (!result.project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project: result.project });
  }

  if (body.action === "applyRepair") {
    const project = await applyProjectRepair(projectSlug);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "runSubmissionPreflight") {
    const project = await runProjectSubmissionPreflight(projectSlug);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "restoreSnapshot") {
    if (!body.snapshotId) {
      return NextResponse.json({ error: "Missing snapshot identifier." }, { status: 400 });
    }

    const project = await restoreProjectSnapshot(projectSlug, body.snapshotId);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "rollbackRepair") {
    const project = await rollbackProjectRepair(projectSlug);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  return NextResponse.json({ error: "Unsupported patch action." }, { status: 400 });
}
