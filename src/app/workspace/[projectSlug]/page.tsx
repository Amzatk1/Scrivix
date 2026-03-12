import { WorkspaceProjectClient } from "@/components/workspace/workspace-project-client";

type WorkspaceProjectPageProps = {
  params: Promise<{
    projectSlug: string;
  }>;
};

export default async function WorkspaceProjectPage({ params }: WorkspaceProjectPageProps) {
  const { projectSlug } = await params;

  return <WorkspaceProjectClient projectSlug={projectSlug} />;
}
