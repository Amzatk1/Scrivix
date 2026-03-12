"use client";

import Link from "next/link";
import { useState } from "react";
import { projects, templates, type ProjectMode } from "@/lib/product-data";

type NewProjectWizardProps = {
  initialTemplateSlug?: string;
};

const modeOptions: Array<{ value: ProjectMode; label: string; description: string }> = [
  { value: "latex", label: "LaTeX", description: "For thesis templates, compile control, and native file workflows." },
  { value: "hybrid", label: "Hybrid", description: "For structured drafting with strong citations and calmer formatting." },
  { value: "markdown", label: "Markdown", description: "For technical docs, specs, and lean plain-text authoring." },
  { value: "rich", label: "Rich text", description: "For guided formal documents with minimal syntax exposure." },
];

export function NewProjectWizard({ initialTemplateSlug }: NewProjectWizardProps) {
  const fallbackTemplate = templates[0];
  const initialTemplate =
    templates.find((template) => template.slug === initialTemplateSlug) ?? fallbackTemplate;
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState(initialTemplate.slug);
  const [selectedMode, setSelectedMode] = useState<ProjectMode>(initialTemplate.mode);

  const selectedTemplate =
    templates.find((template) => template.slug === selectedTemplateSlug) ?? fallbackTemplate;
  const relatedProject =
    projects.find((project) => project.templateSlug === selectedTemplate.slug) ?? projects[0];

  return (
    <div className="wizard-layout">
      <section className="wizard-panel panel">
        <div className="wizard-step">
          <div className="wizard-step__header">
            <span className="wizard-step__number">1</span>
            <div>
              <h2>Choose your starting point</h2>
              <p>Start from a serious document workflow rather than an empty file.</p>
            </div>
          </div>

          <div className="wizard-template-grid">
            {templates.map((template) => (
              <button
                key={template.slug}
                className={template.slug === selectedTemplateSlug ? "wizard-option wizard-option--active" : "wizard-option"}
                onClick={() => {
                  setSelectedTemplateSlug(template.slug);
                  setSelectedMode(template.mode);
                }}
                type="button"
              >
                <span className="template-chip">{template.category}</span>
                <strong>{template.title}</strong>
                <p>{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="wizard-step">
          <div className="wizard-step__header">
            <span className="wizard-step__number">2</span>
            <div>
              <h2>Choose an authoring mode</h2>
              <p>Keep full control over how structured or syntax-heavy the writing experience should be.</p>
            </div>
          </div>

          <div className="wizard-mode-grid">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                className={option.value === selectedMode ? "wizard-option wizard-option--active" : "wizard-option"}
                onClick={() => setSelectedMode(option.value)}
                type="button"
              >
                <strong>{option.label}</strong>
                <p>{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="wizard-summary panel">
        <p className="eyebrow">Project preview</p>
        <h2>{selectedTemplate.title}</h2>
        <p className="wizard-summary__body">{selectedTemplate.description}</p>

        <div className="wizard-summary__stats">
          <div>
            <span className="quiet-label">Audience</span>
            <strong>{selectedTemplate.audience}</strong>
          </div>
          <div>
            <span className="quiet-label">Mode</span>
            <strong>{selectedMode}</strong>
          </div>
          <div>
            <span className="quiet-label">Citations</span>
            <strong>{selectedTemplate.citationStyle}</strong>
          </div>
          <div>
            <span className="quiet-label">Output</span>
            <strong>{selectedTemplate.output}</strong>
          </div>
        </div>

        <div className="template-highlights">
          {selectedTemplate.highlights.map((highlight) => (
            <span key={highlight} className="template-highlight">
              {highlight}
            </span>
          ))}
        </div>

        <div className="wizard-summary__actions">
          <Link className="primary-button" href={`/workspace/${relatedProject.slug}`}>
            Open sample workspace
          </Link>
          <Link className="ghost-button" href="/templates">
            Compare templates
          </Link>
        </div>

        <div className="wizard-summary__footnote">
          This is still a static product foundation. The next backend pass will turn this into a real project creation
          flow with persistent workspaces.
        </div>
      </aside>
    </div>
  );
}
