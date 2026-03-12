import Link from "next/link";
import { getTemplateBySlug, projects } from "@/lib/product-data";

export default function ProjectsPage() {
  return (
    <main className="directory-page">
      <div className="directory-header">
        <div>
          <p className="eyebrow">Project browser</p>
          <h1>Projects built for serious document workflows.</h1>
          <p className="directory-subtitle">
            Browse active writing systems, inspect their current stage, and jump directly into the workspace that
            matters.
          </p>
        </div>

        <div className="directory-actions">
          <Link className="ghost-button" href="/templates">
            Browse templates
          </Link>
          <Link className="primary-button" href="/projects/new">
            Create project
          </Link>
        </div>
      </div>

      <section className="project-browser-grid">
        {projects.map((project) => {
          const template = getTemplateBySlug(project.templateSlug);

          return (
            <article key={project.slug} className="project-browser-card panel">
              <div className="project-browser-card__header">
                <div>
                  <span className={`status-pill status-pill--${project.statusTone}`}>{project.status}</span>
                  <h2>{project.title}</h2>
                </div>
                <span className="quiet-label">{project.dueLabel}</span>
              </div>

              <p className="project-browser-card__summary">{project.summary}</p>

              <div className="project-browser-card__meta">
                <span>{project.subtitle}</span>
                <span>{project.audience}</span>
                <span>{template?.buildProfile}</span>
              </div>

              <div className="template-highlights">
                {project.queue.slice(0, 2).map((item) => (
                  <span key={item} className="template-highlight">
                    {item}
                  </span>
                ))}
              </div>

              <div className="project-browser-card__actions">
                <Link className="ghost-button" href={`/workspace/${project.slug}`}>
                  Open workspace
                </Link>
                <Link className="ghost-button" href={`/projects/new?template=${project.templateSlug}`}>
                  Create similar
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

