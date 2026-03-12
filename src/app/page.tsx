import Link from "next/link";
import { focusAreas, navLinks, projects, templates } from "@/lib/product-data";

export default function HomePage() {
  return (
    <main className="marketing-page">
      <header className="marketing-nav">
        <div className="brand-lockup">
          <span className="brand-mark">S</span>
          <div>
            <strong>Scrivix</strong>
            <p>The intelligent workspace for serious writing.</p>
          </div>
        </div>

        <nav className="marketing-links" aria-label="Primary">
          {navLinks.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="marketing-actions">
          <Link className="ghost-button" href="/templates">
            Browse templates
          </Link>
          <Link className="primary-button" href="/projects/new">
            Create project
          </Link>
        </div>
      </header>

      <section className="hero" id="product">
        <div className="hero-copy">
          <p className="eyebrow">AI-native document operating system</p>
          <h1>Serious writing needs more than an editor.</h1>
          <p className="hero-text">
            Scrivix combines an Overleaf-familiar workspace, source-grounded AI, and submission-grade document
            workflows for theses, reports, proposals, and technical writing.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" href={`/workspace/${projects[0]?.slug ?? ""}`}>
              Explore the workspace
            </Link>
            <Link className="ghost-button" href="/dashboard">
              View dashboard
            </Link>
          </div>
        </div>

        <div className="hero-panel panel">
          <div className="hero-panel__header">
            <span className="status-pill status-pill--good">Project healthy</span>
            <span className="quiet-label">Submission profile loaded</span>
          </div>

          <div className="hero-grid">
            {projects.map((project) => (
              <article key={project.slug} className="project-glance">
                <p>{project.subtitle}</p>
                <strong>{project.title}</strong>
                <span>{project.status}</span>
                <small>{project.meta}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="focus-section" id="workspace">
        <div className="section-heading">
          <p className="eyebrow">Designed for real document work</p>
          <h2>The familiar workspace, rebuilt for modern writing.</h2>
        </div>

        <div className="feature-grid">
          {focusAreas.map((area) => (
            <article key={area.title} className="feature-card panel">
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="proof-section" id="research">
        <div className="proof-copy">
          <p className="eyebrow">What makes Scrivix different</p>
          <h2>One workspace for drafting, evidence, review, and repair.</h2>
        </div>

        <div className="proof-panel panel">
          <div className="proof-column">
            <h3>Overleaf mental model</h3>
            <p>Left project tree, dominant editor, adjacent preview, visible compile controls, clear logs.</p>
          </div>
          <div className="proof-column">
            <h3>AI with control</h3>
            <p>Side-panel chat, inline transforms, build repair diffs, and rollback before anything becomes permanent.</p>
          </div>
          <div className="proof-column">
            <h3>Evidence and trust</h3>
            <p>Source library, citation health, unsupported-claim prompts, and explainable authorship-risk signals.</p>
          </div>
        </div>
      </section>

      <section className="templates-section" id="templates">
        <div className="section-heading">
          <p className="eyebrow">Template system</p>
          <h2>Start from a serious document workflow, not a blank page.</h2>
        </div>

        <div className="template-showcase-grid">
          {templates.map((template) => (
            <article key={template.slug} className="template-showcase-card panel">
              <div className="template-showcase-card__top">
                <span className="template-chip">{template.category}</span>
                <span className="quiet-label">{template.mode}</span>
              </div>
              <h3>{template.title}</h3>
              <p>{template.description}</p>
              <div className="template-highlights">
                {template.highlights.map((highlight) => (
                  <span key={highlight} className="template-highlight">
                    {highlight}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="section-heading">
          <p className="eyebrow">Pricing direction</p>
          <h2>Built for students first, extensible to teams and institutions.</h2>
        </div>

        <div className="pricing-grid">
          <article className="pricing-card panel">
            <span>Student</span>
            <strong>Focused drafting, citations, and AI help</strong>
            <p>Low-friction plan for essays, dissertations, and solo research projects.</p>
          </article>
          <article className="pricing-card panel">
            <span>Pro</span>
            <strong>Advanced build repair and submission readiness</strong>
            <p>For power users managing templates, exports, and complex long-form structures.</p>
          </article>
          <article className="pricing-card panel">
            <span>Institution</span>
            <strong>Templates, policy controls, and secure deployments</strong>
            <p>For universities, labs, policy teams, and regulated document workflows.</p>
          </article>
        </div>
      </section>

      <section className="launch-cta">
        <div className="launch-cta__panel panel">
          <div>
            <p className="eyebrow">Ready to continue building?</p>
            <h2>Move from template selection into a real project workspace.</h2>
          </div>
          <div className="launch-cta__actions">
            <Link className="ghost-button" href="/templates">
              View all templates
            </Link>
            <Link className="primary-button" href="/projects/new">
              Start a project
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
