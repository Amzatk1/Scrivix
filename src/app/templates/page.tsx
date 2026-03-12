import Link from "next/link";
import { templates } from "@/lib/product-data";

export default function TemplatesPage() {
  return (
    <main className="directory-page">
      <div className="directory-header">
        <div>
          <p className="eyebrow">Template gallery</p>
          <h1>Templates that encode real writing workflows.</h1>
          <p className="directory-subtitle">
            Start from dissertation, policy, and technical-document structures that already understand citations,
            review, and export expectations.
          </p>
        </div>

        <div className="directory-actions">
          <Link className="ghost-button" href="/projects">
            View projects
          </Link>
          <Link className="primary-button" href="/projects/new">
            Start from template
          </Link>
        </div>
      </div>

      <section className="template-gallery-grid">
        {templates.map((template) => (
          <article key={template.slug} className="template-gallery-card panel">
            <div className="template-showcase-card__top">
              <span className="template-chip">{template.category}</span>
              <span className="quiet-label">{template.mode}</span>
            </div>

            <h2>{template.title}</h2>
            <p>{template.description}</p>

            <div className="template-detail-list">
              <div>
                <span className="quiet-label">Audience</span>
                <strong>{template.audience}</strong>
              </div>
              <div>
                <span className="quiet-label">Citations</span>
                <strong>{template.citationStyle}</strong>
              </div>
              <div>
                <span className="quiet-label">Output</span>
                <strong>{template.output}</strong>
              </div>
            </div>

            <div className="template-highlights">
              {template.highlights.map((highlight) => (
                <span key={highlight} className="template-highlight">
                  {highlight}
                </span>
              ))}
            </div>

            <div className="project-browser-card__actions">
              <Link className="ghost-button" href={`/projects/new?template=${template.slug}`}>
                Use template
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

