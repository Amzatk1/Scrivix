import Link from "next/link";
import { NewProjectWizard } from "@/components/projects/new-project-wizard";

type NewProjectPageProps = {
  searchParams?: Promise<{
    template?: string | string[];
  }>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const resolvedSearchParams = await searchParams;
  const templateParam = resolvedSearchParams?.template;
  const initialTemplateSlug = Array.isArray(templateParam) ? templateParam[0] : templateParam;

  return (
    <main className="directory-page">
      <div className="directory-header">
        <div>
          <p className="eyebrow">New project</p>
          <h1>Create a serious document workspace.</h1>
          <p className="directory-subtitle">
            Choose a workflow, set the authoring mode, and start from a product shape designed for real writing.
          </p>
        </div>

        <div className="directory-actions">
          <Link className="ghost-button" href="/projects">
            Browse projects
          </Link>
          <Link className="ghost-button" href="/templates">
            Browse templates
          </Link>
        </div>
      </div>

      <NewProjectWizard initialTemplateSlug={initialTemplateSlug} />
    </main>
  );
}
