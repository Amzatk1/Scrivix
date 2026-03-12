import Link from "next/link";
import { focusAreas, navLinks, templates } from "@/lib/product-data";

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="marketing-nav">
        <Link className="brand-mark" href="/">
          Scrivix
        </Link>
        <nav className="marketing-nav__links" aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="marketing-nav__actions">
          <Link className="ghost-button" href="/projects">
            Open app
          </Link>
          <Link className="ghost-button" href="/projects/import">
            Import draft
          </Link>
          <Link className="primary-button" href="/projects/new">
            Start workspace
          </Link>
        </div>
      </header>

      <section className="hero-shell panel" id="product">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">The intelligent workspace for serious writing</p>
            <h1>Write, ground, review, repair, and submit serious documents in one system.</h1>
            <p className="dashboard-subtitle">
              Scrivix combines the file-aware familiarity of Overleaf with source-native research workflows,
              diff-first AI assistance, and a calm workspace built for high-stakes writing.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" href="/projects/new">
                Create your first project
              </Link>
              <Link className="ghost-button" href="/projects/import">
                Import an existing draft
              </Link>
              <Link className="ghost-button" href="/dashboard">
                View dashboard
              </Link>
            </div>

            <div className="hero-stats">
              <article className="hero-stat">
                <strong>Overleaf-familiar shell</strong>
                <span>Files, editor, preview, utilities, and build status in one clear layout.</span>
              </article>
              <article className="hero-stat">
                <strong>Source-grounded AI</strong>
                <span>Context-aware assistance tied to sections, sources, comments, and build state.</span>
              </article>
              <article className="hero-stat">
                <strong>Submission-ready workflows</strong>
                <span>From first outline to final export with evidence checks and compile repair.</span>
              </article>
            </div>
          </div>

          <div className="hero-preview">
            <div className="hero-preview__panel">
              <div className="hero-preview__top">
                <span className="status-pill status-pill--warn">Build warnings</span>
                <span className="quiet-label">Imperial thesis · methodology</span>
              </div>
              <div className="hero-preview__body">
                <div className="hero-preview__column">
                  <p className="eyebrow">Workspace</p>
                  <strong>Files · Draft · Preview · Sources · Trust</strong>
                  <p>
                    A calmer three-pane shell for long-form writing with project navigation, rich or technical editing,
                    and adjacent review tools.
                  </p>
                </div>
                <div className="hero-preview__column">
                  <p className="eyebrow">Document health</p>
                  <ul>
                    <li>3 evidence gaps surfaced in the current chapter</li>
                    <li>1 bibliography key ready to insert</li>
                    <li>Compile-fix patch prepared for one macro issue</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="workspace">
        <div className="section-heading">
          <p className="eyebrow">Product pillars</p>
          <h2>A serious-document operating system, not an AI text box.</h2>
        </div>
        <div className="focus-grid">
          {focusAreas.map((area) => (
            <article key={area.title} className="panel marketing-card">
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section" id="templates">
        <div className="section-heading">
          <p className="eyebrow">Template system</p>
          <h2>Start from a workflow that already understands the document job.</h2>
        </div>
        <div className="template-gallery-grid">
          {templates.map((template) => (
            <article key={template.slug} className="template-gallery-card panel">
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

      <section className="marketing-section marketing-section--cta" id="pricing">
        <div className="panel cta-panel">
          <div>
            <p className="eyebrow">Launch path</p>
            <h2>Build the thesis, report, or technical document workspace people actually want to stay in.</h2>
            <p className="dashboard-subtitle">
              Start with a real project, then grow into sources, review, compile repair, and submission workflows
              without switching tools.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="primary-button" href="/projects/new">
              Start a serious document
            </Link>
            <Link className="ghost-button" href="/projects/import">
              Import a draft
            </Link>
            <Link className="ghost-button" href="/templates">
              Browse templates
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
