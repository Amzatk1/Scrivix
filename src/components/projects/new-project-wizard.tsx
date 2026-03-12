"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState, useTransition } from "react";
import { useScrivix } from "@/components/providers/scrivix-provider";
import { templates, type ProjectMode } from "@/lib/product-data";

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
  const router = useRouter();
  const { createProject, syncError } = useScrivix();
  const fallbackTemplate = templates[0];
  const initialTemplate =
    templates.find((template) => template.slug === initialTemplateSlug) ?? fallbackTemplate;
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState(initialTemplate.slug);
  const [selectedMode, setSelectedMode] = useState<ProjectMode>(initialTemplate.mode);
  const [title, setTitle] = useState(`${initialTemplate.title} Workspace`);
  const [subtitle, setSubtitle] = useState(initialTemplate.title);
  const [audience, setAudience] = useState(initialTemplate.audience);
  const [isPending, startCreating] = useTransition();

  const selectedTemplate =
    templates.find((template) => template.slug === selectedTemplateSlug) ?? fallbackTemplate;

  function handleCreateProject() {
    startCreating(() => {
      void createProject({
        title,
        subtitle,
        audience,
        templateSlug: selectedTemplate.slug,
        mode: selectedMode,
        summary: selectedTemplate.description,
      }).then((project) => {
        startTransition(() => {
          router.push(`/workspace/${project.slug}`);
        });
      });
    });
  }

  return (
    <div className="wizard-layout">
      <section className="wizard-panel panel">
        {syncError && <div className="sync-banner sync-banner--compact panel">{syncError}</div>}
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
                  setTitle(`${template.title} Workspace`);
                  setSubtitle(template.title);
                  setAudience(template.audience);
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
            <span className="wizard-step__number">3</span>
            <div>
              <h2>Name the workspace</h2>
              <p>Set the document identity that will appear across the dashboard, project browser, and workspace.</p>
            </div>
          </div>

          <div className="wizard-form-grid">
            <label className="wizard-field">
              <span>Project title</span>
              <input onChange={(event) => setTitle(event.target.value)} value={title} />
            </label>

            <label className="wizard-field">
              <span>Subtitle / template label</span>
              <input onChange={(event) => setSubtitle(event.target.value)} value={subtitle} />
            </label>

            <label className="wizard-field wizard-field--full">
              <span>Audience</span>
              <input onChange={(event) => setAudience(event.target.value)} value={audience} />
            </label>
          </div>
        </div>

        <div className="wizard-step">
          <div className="wizard-step__header">
            <span className="wizard-step__number">4</span>
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
          <button className="primary-button" disabled={isPending} onClick={handleCreateProject} type="button">
            {isPending ? "Creating..." : "Create project"}
          </button>
          <Link className="ghost-button" href={`/projects/new?template=${selectedTemplate.slug}`}>
            Refresh selection
          </Link>
          <Link className="ghost-button" href="/templates">
            Compare templates
          </Link>
        </div>

        <div className="wizard-summary__actions">
          <Link className="ghost-button" href="/projects">
            View existing projects
          </Link>
        </div>

        <div className="wizard-summary__footnote">
          Project creation now persists locally in the browser so you can create a workspace, open it, and continue
          editing without losing the draft state between reloads.
        </div>
      </aside>
    </div>
  );
}
