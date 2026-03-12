export type StatusTone = "good" | "warn" | "neutral";
export type BuildSeverity = "error" | "warn" | "info";
export type WorkspaceMode = "Draft" | "Research" | "Review" | "Submission";
export type ProjectMode = "latex" | "hybrid" | "markdown" | "rich";
export type FileType = "root" | "folder" | "file" | "bib" | "asset" | "config";

export type NavLink = {
  label: string;
  href: string;
};

export type FocusArea = {
  title: string;
  description: string;
};

export type TemplateRecord = {
  slug: string;
  title: string;
  category: string;
  description: string;
  audience: string;
  mode: ProjectMode;
  citationStyle: string;
  buildProfile: string;
  output: string;
  highlights: string[];
};

export type ProjectFile = {
  name: string;
  type: FileType;
  active?: boolean;
};

export type OutlineSection = {
  title: string;
  note: string;
};

export type SourceCard = {
  title: string;
  detail: string;
  state: string;
};

export type CommentRecord = {
  author: string;
  body: string;
  target: string;
};

export type HistoryEvent = {
  label: string;
  meta: string;
};

export type TrustSignal = {
  label: string;
  value: string;
  tone: StatusTone;
};

export type BuildMessage = {
  severity: BuildSeverity;
  location: string;
  text: string;
};

export type SearchHit = {
  term: string;
  summary: string;
};

export type WorkspaceRecord = {
  defaultMode: WorkspaceMode;
  currentFile: string;
  wordEstimate: string;
  lastExport: string;
  compileStatus: string;
  compileTone: StatusTone;
  editorChips: string[];
  files: ProjectFile[];
  outline: OutlineSection[];
  searchHits: SearchHit[];
  sources: SourceCard[];
  comments: CommentRecord[];
  history: HistoryEvent[];
  trustSignals: TrustSignal[];
  buildMessages: BuildMessage[];
  aiAssist: {
    title: string;
    body: string;
  };
  nextStep: string;
  editorSample: string;
  previewParagraphs: string[];
  previewCallout: {
    title: string;
    body: string;
  };
};

export type ProjectRecord = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  templateSlug: string;
  status: string;
  statusTone: StatusTone;
  meta: string;
  stage: string;
  dueLabel: string;
  audience: string;
  mode: ProjectMode;
  queue: string[];
  workspace: WorkspaceRecord;
};

export const navLinks: NavLink[] = [
  { label: "Product", href: "#product" },
  { label: "Workspace", href: "#workspace" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
];

export const focusAreas: FocusArea[] = [
  {
    title: "Write with structure",
    description:
      "Draft chapters, reports, and proposals inside a file-aware workspace that scales from a single essay to a full dissertation.",
  },
  {
    title: "Ground every claim",
    description:
      "Move from PDF highlights to citations, notes, and evidence coverage without jumping across four different products.",
  },
  {
    title: "Repair broken builds safely",
    description:
      "Use project-aware agent workflows to explain compile failures, propose minimal patches, and roll back instantly.",
  },
];

export const templates: TemplateRecord[] = [
  {
    slug: "imperial-thesis",
    title: "Imperial Thesis",
    category: "Dissertation",
    description:
      "A LaTeX-native thesis starter with chapter structure, BibTeX, supervisor review packs, and submission readiness defaults.",
    audience: "Master's and PhD researchers",
    mode: "latex",
    citationStyle: "BibTeX / Harvard",
    buildProfile: "latexmk + thesis export",
    output: "PDF, archive ZIP",
    highlights: ["Chapter folder scaffold", "Supervisor review checkpoints", "Submission checklist"],
  },
  {
    slug: "policy-brief",
    title: "Policy Brief",
    category: "Report",
    description:
      "A hybrid rich-text workspace for evidence-heavy policy writing with briefing sections, claim prompts, and clean PDF export.",
    audience: "Consultants, policy teams, legal-style writers",
    mode: "hybrid",
    citationStyle: "Chicago author-date",
    buildProfile: "structured rich export",
    output: "PDF, DOCX",
    highlights: ["Executive summary prompts", "Evidence coverage panel", "Stakeholder review mode"],
  },
  {
    slug: "technical-design-report",
    title: "Technical Design Report",
    category: "Technical",
    description:
      "A markdown-first technical writing starter for specs, architecture docs, and appendices with review and export discipline.",
    audience: "Technical writers, product and engineering teams",
    mode: "markdown",
    citationStyle: "Inline links + CSL references",
    buildProfile: "markdown + pandoc",
    output: "HTML, PDF, DOCX",
    highlights: ["Architecture outline", "Decision log section", "Appendix and glossary support"],
  },
];

export const projects: ProjectRecord[] = [
  {
    slug: "institutional-thesis-project",
    title: "Institutional Thesis Project",
    subtitle: "Imperial College template",
    summary:
      "A dissertation workspace combining a LaTeX-native chapter structure, bibliography management, and supervisor review checkpoints.",
    templateSlug: "imperial-thesis",
    status: "Build warnings",
    statusTone: "warn",
    meta: "4 chapters active",
    stage: "Methodology draft",
    dueLabel: "Submission in 18 days",
    audience: "PhD Research",
    mode: "latex",
    queue: [
      "Resolve 2 methodology comments",
      "Patch bibliography metadata for 3 sources",
      "Run final submission checklist after the next build",
    ],
    workspace: {
      defaultMode: "Research",
      currentFile: "chapter-03-methodology.tex",
      wordEstimate: "2,814",
      lastExport: "09:32",
      compileStatus: "Build warnings",
      compileTone: "warn",
      editorChips: ["Section-aware AI", "Citations on", "Strict sync"],
      files: [
        { name: "main.tex", type: "root", active: true },
        { name: "frontmatter/", type: "folder" },
        { name: "chapters/", type: "folder" },
        { name: "chapter-03-methodology.tex", type: "file" },
        { name: "references.bib", type: "bib" },
        { name: "figures/", type: "folder" },
        { name: "submission-checklist.md", type: "file" },
      ],
      outline: [
        { title: "3.0 Methodology", note: "Active section" },
        { title: "3.1 Research design", note: "Needs source check" },
        { title: "3.2 Data collection", note: "2 comments" },
        { title: "3.3 Limitations", note: "Outline only" },
      ],
      searchHits: [
        { term: "selection bias", summary: "2 comments, 1 source note, 1 methodology section" },
        { term: "mixed methods", summary: "3 source highlights, 2 chapter mentions" },
      ],
      sources: [
        { title: "Crawford et al. (2024)", detail: "Methods benchmark / pages 14-18", state: "Linked to 3.2" },
        { title: "UK AI Safety Report", detail: "Claim coverage review", state: "Uncited" },
        { title: "Supervisor interview notes", detail: "Private source note", state: "Pinned" },
      ],
      comments: [
        {
          author: "Dr. Shah",
          body: "Clarify why this sampling choice is defensible against selection bias.",
          target: "Paragraph 4",
        },
        {
          author: "Mina A.",
          body: "The transition from design to data collection feels abrupt.",
          target: "Section 3.1",
        },
      ],
      history: [
        { label: "Pre-AI snapshot", meta: "Today, 09:18" },
        { label: "Supervisor review pack", meta: "Yesterday, 18:42" },
        { label: "Template import", meta: "Mar 9, 13:02" },
      ],
      trustSignals: [
        { label: "Citation coverage", value: "84%", tone: "good" },
        { label: "Unsupported claims", value: "5", tone: "warn" },
        { label: "Style shift alerts", value: "2", tone: "neutral" },
        { label: "Bibliography health", value: "Healthy", tone: "good" },
      ],
      buildMessages: [
        {
          severity: "error",
          location: "chapter-03-methodology.tex:182",
          text: "Undefined control sequence near custom table macro.",
        },
        {
          severity: "warn",
          location: "references.bib:44",
          text: "Entry missing publisher field for institutional report.",
        },
        {
          severity: "info",
          location: "main.tex",
          text: "Last successful PDF export completed in 9.2s.",
        },
      ],
      aiAssist: {
        title: "Compile-fix proposal ready",
        body:
          "I found an undefined control sequence in the custom table macro. The minimal fix updates the macro signature in one file and preserves the current layout.",
      },
      nextStep:
        "Your methodology section is structurally solid. The highest-value improvement is evidence coverage for the sampling rationale and a smoother transition into data collection.",
      editorSample: `\\section{Methodology}

This chapter explains the research design, data collection strategy, and
analysis workflow used to evaluate institutional adoption of AI-native writing
systems. The aim is to justify the methodological choices in a way that is
transparent, reproducible, and aligned with the dissertation rubric.

The project uses a mixed-methods design. First, the study maps the workflow
friction experienced by postgraduate writers across planning, drafting,
citation management, and final submission. Second, it evaluates how an
integrated workspace changes that experience when compared with fragmented tool
chains built around word processors, note systems, and general-purpose AI
assistants.

\\subsection{Research design}

The research design combines interview data, workflow diaries, and analysis of
document artefacts produced during the study. This allows the project to assess
both perceived usability and observable writing outcomes.`,
      previewParagraphs: [
        "Methodology",
        "This chapter explains the research design, data collection strategy, and analysis workflow used to evaluate institutional adoption of AI-native writing systems.",
        "The project uses a mixed-methods design to compare fragmented writing toolchains against an integrated workspace model.",
      ],
      previewCallout: {
        title: "Needs evidence",
        body: "Sampling claim in paragraph 4 should cite a methodological source.",
      },
    },
  },
  {
    slug: "ai-governance-memo",
    title: "AI Governance Memo",
    subtitle: "Policy brief",
    summary:
      "A hybrid policy-writing project focused on institutional recommendations, supporting evidence, and review-ready stakeholder exports.",
    templateSlug: "policy-brief",
    status: "Needs evidence",
    statusTone: "warn",
    meta: "7 source gaps",
    stage: "Recommendation pass",
    dueLabel: "Cabinet review on Monday",
    audience: "Policy Team",
    mode: "hybrid",
    queue: [
      "Cite all claims in section 2 before circulation",
      "Prepare a redline version for legal review",
      "Convert stakeholder comments into action items",
    ],
    workspace: {
      defaultMode: "Review",
      currentFile: "sections/recommendations.svx",
      wordEstimate: "1,940",
      lastExport: "Yesterday, 18:04",
      compileStatus: "Needs evidence",
      compileTone: "warn",
      editorChips: ["Claim coverage", "Formal tone", "Executive summary linked"],
      files: [
        { name: "brief.svx", type: "root", active: true },
        { name: "sections/", type: "folder" },
        { name: "recommendations.svx", type: "file" },
        { name: "sources/", type: "folder" },
        { name: "evidence-register.csv", type: "asset" },
        { name: "export-profile.yml", type: "config" },
      ],
      outline: [
        { title: "1. Executive summary", note: "Locked for review" },
        { title: "2. Current risk landscape", note: "4 evidence prompts" },
        { title: "3. Recommendations", note: "Active section" },
        { title: "4. Implementation plan", note: "Legal review pending" },
      ],
      searchHits: [
        { term: "proportionality", summary: "3 recommendation paragraphs, 2 comments" },
        { term: "procurement", summary: "1 source note, 1 appendix table" },
      ],
      sources: [
        { title: "National Audit Office review", detail: "Public sector AI governance", state: "Linked to section 2" },
        { title: "Internal procurement policy", detail: "Private team source", state: "Pinned" },
        { title: "OECD AI policy framework", detail: "Comparative reference", state: "Candidate citation" },
      ],
      comments: [
        {
          author: "Legal counsel",
          body: "Recommendation 3 needs narrower wording before external distribution.",
          target: "Section 3",
        },
        {
          author: "Chief of staff",
          body: "The summary should say what changes in the next 90 days, not just the longer-term direction.",
          target: "Executive summary",
        },
      ],
      history: [
        { label: "Stakeholder draft", meta: "Today, 08:10" },
        { label: "Evidence sweep", meta: "Yesterday, 14:26" },
        { label: "Template instantiated", meta: "Mar 10, 10:48" },
      ],
      trustSignals: [
        { label: "Citation coverage", value: "69%", tone: "warn" },
        { label: "Unsupported claims", value: "7", tone: "warn" },
        { label: "Style shift alerts", value: "1", tone: "neutral" },
        { label: "Review readiness", value: "In progress", tone: "neutral" },
      ],
      buildMessages: [
        {
          severity: "warn",
          location: "sections/risk-landscape.svx",
          text: "Four claims in the current section are missing linked evidence.",
        },
        {
          severity: "info",
          location: "export-profile.yml",
          text: "Board-brief PDF export last completed in 4.1s.",
        },
      ],
      aiAssist: {
        title: "Recommendation tightening available",
        body:
          "I can produce a narrower, more defensible rewrite of Recommendation 3 based on the legal comment and the internal procurement policy.",
      },
      nextStep:
        "This document is close to stakeholder-ready. The blocking issue is evidence coverage in section 2 and sharper near-term recommendations in the summary.",
      editorSample: `## Recommendations

The department should adopt a staged governance model for AI-enabled writing
systems. In the first ninety days, procurement and assurance teams should
define a minimum evidence standard for any system used in high-stakes drafting.

The operating model should require three controls. First, every generated claim
used in policy drafting must be linked to a verifiable source or marked for
review. Second, document review workflows should preserve revision provenance.
Third, export profiles should ensure that the final briefing pack remains
consistent across internal and external circulation.`,
      previewParagraphs: [
        "Recommendations",
        "The department should adopt a staged governance model for AI-enabled writing systems.",
        "In the first ninety days, procurement and assurance teams should define a minimum evidence standard for high-stakes drafting.",
      ],
      previewCallout: {
        title: "Review note",
        body: "Legal review recommends narrower language for Recommendation 3 before circulation.",
      },
    },
  },
  {
    slug: "technical-design-report",
    title: "Series A Narrative",
    subtitle: "Investor deck appendix",
    summary:
      "A strategy-heavy technical narrative linking product direction, system architecture, and execution confidence for investors and advisors.",
    templateSlug: "technical-design-report",
    status: "Review pending",
    statusTone: "neutral",
    meta: "12 comments unresolved",
    stage: "Narrative refinement",
    dueLabel: "Partner meeting tomorrow",
    audience: "Founder / Product",
    mode: "markdown",
    queue: [
      "Resolve GTM comments from the finance lead",
      "Tighten the architecture section for non-technical readers",
      "Export a short appendix and a full technical version",
    ],
    workspace: {
      defaultMode: "Draft",
      currentFile: "appendix/system-architecture.md",
      wordEstimate: "1,220",
      lastExport: "Today, 07:54",
      compileStatus: "Review pending",
      compileTone: "neutral",
      editorChips: ["Narrative consistency", "Investor mode", "Appendix split export"],
      files: [
        { name: "narrative.md", type: "root", active: true },
        { name: "appendix/", type: "folder" },
        { name: "system-architecture.md", type: "file" },
        { name: "market-evidence.md", type: "file" },
        { name: "exports/", type: "folder" },
      ],
      outline: [
        { title: "1. Why this market now", note: "Stable" },
        { title: "2. Product wedge", note: "2 comments" },
        { title: "3. Architecture", note: "Active file" },
        { title: "4. Expansion model", note: "Needs simplification" },
      ],
      searchHits: [
        { term: "defensibility", summary: "4 mentions, 2 comments" },
        { term: "university", summary: "3 GTM notes, 1 market evidence section" },
      ],
      sources: [
        { title: "Market interview synthesis", detail: "Founder research notes", state: "Linked to market section" },
        { title: "Workflow benchmark deck", detail: "Internal analysis", state: "Pinned" },
      ],
      comments: [
        {
          author: "Finance lead",
          body: "The margin profile is clear, but the expansion path still reads too product-heavy.",
          target: "Section 4",
        },
        {
          author: "Advisor",
          body: "The architecture section is strong but needs one simpler explanation for generalist investors.",
          target: "Section 3",
        },
      ],
      history: [
        { label: "Partner preview draft", meta: "Today, 06:50" },
        { label: "Narrative rewrite", meta: "Yesterday, 21:10" },
        { label: "Appendix split", meta: "Mar 11, 16:05" },
      ],
      trustSignals: [
        { label: "Source coverage", value: "76%", tone: "good" },
        { label: "Narrative consistency", value: "Needs pass", tone: "neutral" },
        { label: "Style shift alerts", value: "0", tone: "good" },
      ],
      buildMessages: [
        {
          severity: "info",
          location: "narrative.md",
          text: "Investor appendix PDF export last completed in 2.7s.",
        },
      ],
      aiAssist: {
        title: "Audience-aware rewrite prepared",
        body:
          "I can simplify the architecture section for non-technical investors while preserving the product moat and cost logic.",
      },
      nextStep:
        "The document is clear, but the architecture section needs one plainer-language pass and the expansion model needs a sharper business framing.",
      editorSample: `## Architecture

Scrivix is built as a modular document system rather than a general-purpose
editor with AI bolted on. The product keeps document state, source state, build
state, and review state in one workspace so users do not need to reconstruct
context across tools.

This matters because the moat is not just model access. It is the combination
of structured document workflows, safe diff application, evidence grounding, and
submission readiness in one product shell.`,
      previewParagraphs: [
        "Architecture",
        "Scrivix is built as a modular document system rather than a general-purpose editor with AI bolted on.",
        "The moat comes from structured workflows, safe diffs, evidence grounding, and submission readiness.",
      ],
      previewCallout: {
        title: "Audience prompt",
        body: "Consider one simpler paragraph for generalist investors before the deeper systems explanation.",
      },
    },
  },
];

export function getTemplateBySlug(slug: string): TemplateRecord | undefined {
  return templates.find((template) => template.slug === slug);
}

export function getProjectBySlug(slug: string): ProjectRecord | undefined {
  return projects.find((project) => project.slug === slug);
}

