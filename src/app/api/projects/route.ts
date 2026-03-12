import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/server/project-store";
import type { CreateProjectInput } from "@/lib/project-utils";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

function isCreateProjectInput(value: unknown): value is CreateProjectInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.title === "string" &&
    typeof candidate.subtitle === "string" &&
    typeof candidate.audience === "string" &&
    typeof candidate.templateSlug === "string" &&
    typeof candidate.mode === "string"
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isCreateProjectInput(body)) {
    return NextResponse.json({ error: "Invalid project payload." }, { status: 400 });
  }

  const project = await createProject(body);
  return NextResponse.json({ project }, { status: 201 });
}

