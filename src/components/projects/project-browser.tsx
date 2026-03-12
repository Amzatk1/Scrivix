"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { useScrivix } from "@/components/providers/scrivix-provider";
import { getTemplateBySlug } from "@/lib/product-data";

export function ProjectBrowser() {
  const { projects, syncError } = useScrivix();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => {
    if (!normalizedQuery) {
      return true;
    }

    return [project.title, project.subtitle, project.summary, project.audience, project.stage]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

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
          <div className="directory-search">
            <label className="sr-only" htmlFor="project-browser-search">
              Search projects
            </label>
            <input
              id="project-browser-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects, audiences, or stages"
              value={query}
            />
          </div>
          <Link className="ghost-button" href="/templates">
            Browse templates
          </Link>
          <Link className="ghost-button" href="/projects/import">
            Import draft
          </Link>
          <Link className="primary-button" href="/projects/new">
            Create project
          </Link>
        </div>
      </div>

      {syncError && <div className="sync-banner panel">{syncError}</div>}

      <section className="project-browser-grid">
        {filteredProjects.map((project) => {
          const template = getTemplateBySlug(project.templateSlug);
          const openQueue = project.queue.filter((item) => item.status !== "done");

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
                {openQueue.slice(0, 2).map((item) => (
                  <span key={item.id} className="template-highlight">
                    {item.label}
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
