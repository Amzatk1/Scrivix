import { NextResponse } from "next/server";
import { compileProject } from "@/lib/server/project-store";

type RouteContext = {
  params: Promise<{
    projectSlug: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { projectSlug } = await context.params;
  const project = await compileProject(projectSlug);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ project });
}

