import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getProjectBySlug } from "@/lib/product-data";

type WorkspaceProjectPageProps = {
  params: Promise<{
    projectSlug: string;
  }>;
};

export default async function WorkspaceProjectPage({ params }: WorkspaceProjectPageProps) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);

  if (!project) {
    notFound();
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
        <WorkspaceShell project={project} />
      </div>
    </main>
  );
}

