"use client";

import Link from "next/link";
import { useScrivix } from "@/components/providers/scrivix-provider";

export function DashboardView() {
  const { projects, syncError } = useScrivix();
  const featuredProject = projects[0];
  const trustSignals = featuredProject?.workspace.trustSignals ?? [];
  const queue = featuredProject?.queue ?? [];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Good morning. Your writing system is stable.</h1>
          <p className="dashboard-subtitle">
            Continue the thesis project, clear review friction, and close evidence gaps before export.
          </p>
        </div>

        <div className="dashboard-header__actions">
          <Link className="ghost-button" href="/projects">
            Browse projects
          </Link>
          <Link className="ghost-button" href="/projects/new">
            New project
          </Link>
          <Link className="ghost-button" href="/">
            Marketing site
          </Link>
          {featuredProject && (
            <Link className="primary-button" href={`/workspace/${featuredProject.slug}`}>
              Open workspace
            </Link>
          )}
        </div>
      </header>

      {syncError && <div className="sync-banner panel">{syncError}</div>}

      <section className="dashboard-grid">
        <article className="panel dashboard-card">
          <div className="card-heading">
            <h2>Recent projects</h2>
            <span className="quiet-label">{projects.length} active</span>
          </div>
          <div className="dashboard-stack">
            {projects.map((project) => (
              <Link key={project.slug} href={`/workspace/${project.slug}`} className="dashboard-list-card dashboard-list-card--link">
                <div>
                  <strong>{project.title}</strong>
                  <p>{project.subtitle}</p>
                </div>
                <div className="dashboard-list-card__meta">
                  <span>{project.status}</span>
                  <small>{project.meta}</small>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel dashboard-card">
          <div className="card-heading">
            <h2>Priority queue</h2>
            <span className="quiet-label">Today</span>
          </div>
          <div className="queue-list">
            {queue.map((item) => (
              <div key={item} className="queue-item">
                <span className="queue-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel dashboard-card">
          <div className="card-heading">
            <h2>Trust signals</h2>
            <span className="quiet-label">Latest scan</span>
          </div>
          <div className="signal-stack">
            {trustSignals.map((signal) => (
              <div key={signal.label} className={`signal-row signal-row--${signal.tone}`}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
