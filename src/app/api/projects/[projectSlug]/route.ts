import { NextResponse } from "next/server";
import {
  getProject,
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
    | { action?: string; fileName?: string; content?: string }
    | null;

  if (!body?.action || !body.fileName) {
    return NextResponse.json({ error: "Invalid patch payload." }, { status: 400 });
  }

  if (body.action === "selectFile") {
    const project = await selectProjectFile(projectSlug, body.fileName);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  if (body.action === "updateDocument" && typeof body.content === "string") {
    const project = await updateProjectDocument(projectSlug, body.fileName, body.content);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  return NextResponse.json({ error: "Unsupported patch action." }, { status: 400 });
}

