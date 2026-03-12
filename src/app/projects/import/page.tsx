import Link from "next/link";
import { ImportProjectWizard } from "@/components/projects/import-project-wizard";

type ImportProjectPageProps = {
  searchParams?: Promise<{
    template?: string | string[];
  }>;
};

export default async function ImportProjectPage({ searchParams }: ImportProjectPageProps) {
  const resolvedSearchParams = await searchParams;
  const templateParam = resolvedSearchParams?.template;
  const initialTemplateSlug = Array.isArray(templateParam) ? templateParam[0] : templateParam;

  return (
    <main className="directory-page">
      <div className="directory-header">
        <div>
          <p className="eyebrow">Import project</p>
          <h1>Bring an existing draft into Scrivix.</h1>
          <p className="directory-subtitle">
            Import markdown, LaTeX, or prose into a serious document workspace with files, sources, outline, and trust
            state generated up front.
          </p>
        </div>

        <div className="directory-actions">
          <Link className="ghost-button" href="/projects">
            Browse projects
          </Link>
          <Link className="ghost-button" href="/projects/new">
            Create from template
          </Link>
        </div>
      </div>

      <ImportProjectWizard initialTemplateSlug={initialTemplateSlug} />
    </main>
  );
}
