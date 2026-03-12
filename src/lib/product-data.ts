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
  id: string;
  title: string;
  detail: string;
  state: string;
  citationKey: string;
  sourceType?: "article" | "report" | "book" | "note" | "dataset" | "policy";
  linkedFiles?: string[];
  author?: string;
  year?: string;
  pinned?: boolean;
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

export type EvidenceIssue = {
  id: string;
  title: string;
  detail: string;
  location: string;
  recommendation: string;
  tone: StatusTone;
};

export type BuildMessage = {
  severity: BuildSeverity;
  location: string;
  text: string;
};

export type RepairOperation = {
  fileName: string;
  summary: string;
  beforeContent: string;
  afterContent: string;
};

export type RepairSuggestion = {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  confidenceLabel: string;
  operations: RepairOperation[];
};

export type RollbackSnapshot = {
  label: string;
  appliedAt: string;
  documents: Record<string, string>;
};

export type SearchHit = {
  term: string;
  summary: string;
};

export type WorkspaceRecord = {
  defaultMode: WorkspaceMode;
  currentFile: string;
  documents: Record<string, string>;
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
  evidenceIssues: EvidenceIssue[];
  buildMessages: BuildMessage[];
  repairSuggestion?: RepairSuggestion | null;
  rollbackSnapshot?: RollbackSnapshot | null;
  aiAssist: {
    title: string;
    body: string;
  };
  nextStep: string;
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
      currentFile: "chapters/chapter-03-methodology.tex",
      documents: {
        "main.tex": `\\documentclass{report}
\\begin{document}
\\input{chapters/chapter-03-methodology}
\\end{document}`,
        "chapters/chapter-03-methodology.tex": `\\section{Methodology}

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
both perceived usability and observable writing outcomes.

\\badmacro{Comparative workflow view}`,
        "references.bib": `@article{crawford2024methods,
  title = {Benchmarking Methods for AI Writing Workflows},
  author = {Crawford, Elena and Shah, Ravi},
  year = {2024},
  journal = {Journal of Research Methods}
}`,
        "submission-checklist.md": `# Submission Checklist

- [ ] Final methodology citations confirmed
- [ ] Supervisor review pack exported
- [ ] PDF passes institutional template check`,
      },
      wordEstimate: "2,814",
      lastExport: "09:32",
      compileStatus: "Build warnings",
      compileTone: "warn",
      editorChips: ["Section-aware AI", "Citations on", "Strict sync"],
      files: [
        { name: "main.tex", type: "root" },
        { name: "frontmatter/", type: "folder" },
        { name: "chapters/", type: "folder" },
        { name: "chapters/chapter-03-methodology.tex", type: "file", active: true },
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
        {
          id: "source-methods-benchmark",
          title: "Crawford et al. (2024)",
          detail: "Methods benchmark / pages 14-18",
          state: "Linked to 3.2",
          citationKey: "crawford2024methods",
          sourceType: "article",
          linkedFiles: ["chapters/chapter-03-methodology.tex"],
          author: "Crawford",
          year: "2024",
        },
        {
          id: "source-uk-ai-safety",
          title: "UK AI Safety Report",
          detail: "Claim coverage review",
          state: "Uncited",
          citationKey: "ukaisafetyreport2025",
          sourceType: "report",
          author: "UK AI Safety Institute",
          year: "2025",
        },
        {
          id: "source-supervisor-notes",
          title: "Supervisor interview notes",
          detail: "Private source note",
          state: "Pinned",
          citationKey: "supervisornotes2026",
          sourceType: "note",
          author: "Supervisor notes",
          year: "2026",
          pinned: true,
        },
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
      evidenceIssues: [
        {
          id: "issue-methodology-sampling",
          title: "Potential evidence gap",
          detail: "The sampling rationale is still stated without a linked methodological source.",
          location: "chapters/chapter-03-methodology.tex",
          recommendation: "Attach a source on sampling validity or narrow the claim.",
          tone: "warn",
        },
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
      documents: {
        "brief.svx": `# Executive Summary

This brief recommends a staged governance model for institutional adoption of
AI-native writing systems.`,
        "sections/recommendations.svx": `## Recommendations

The department should adopt a staged governance model for AI-enabled writing
systems. In the first ninety days, procurement and assurance teams should
define a minimum evidence standard for any system used in high-stakes drafting.

The operating model should require three controls. First, every generated claim
used in policy drafting must be linked to a verifiable source or marked for
review. Second, document review workflows should preserve revision provenance.
Third, export profiles should ensure that the final briefing pack remains
consistent across internal and external circulation.`,
        "export-profile.yml": `profile: board-brief
outputs:
  - pdf
  - docx
tone: formal`,
      },
      wordEstimate: "1,940",
      lastExport: "Yesterday, 18:04",
      compileStatus: "Needs evidence",
      compileTone: "warn",
      editorChips: ["Claim coverage", "Formal tone", "Executive summary linked"],
      files: [
        { name: "brief.svx", type: "root" },
        { name: "sections/", type: "folder" },
        { name: "sections/recommendations.svx", type: "file", active: true },
        { name: "sources/", type: "folder" },
        { name: "sources/evidence-register.csv", type: "asset" },
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
        {
          id: "source-nao-review",
          title: "National Audit Office review",
          detail: "Public sector AI governance",
          state: "Linked to section 2",
          citationKey: "naoaigovernance2025",
          sourceType: "report",
          linkedFiles: ["brief.svx"],
          author: "National Audit Office",
          year: "2025",
        },
        {
          id: "source-procurement-policy",
          title: "Internal procurement policy",
          detail: "Private team source",
          state: "Pinned",
          citationKey: "internalprocurementpolicy2026",
          sourceType: "policy",
          author: "Operations team",
          year: "2026",
          pinned: true,
        },
        {
          id: "source-oecd-framework",
          title: "OECD AI policy framework",
          detail: "Comparative reference",
          state: "Candidate citation",
          citationKey: "oecdaipolicy2024",
          sourceType: "policy",
          author: "OECD",
          year: "2024",
        },
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
      evidenceIssues: [
        {
          id: "issue-policy-recommendations",
          title: "Potential evidence gap",
          detail: "The recommendation list introduces three controls without any attached evidence markers.",
          location: "sections/recommendations.svx",
          recommendation: "Attach the procurement policy and one public framework source before export.",
          tone: "warn",
        },
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
      documents: {
        "narrative.md": `# Why this market now

Serious documents still move through fragmented tools that separate drafting,
review, source grounding, and final export.`,
        "appendix/system-architecture.md": `## Architecture

Scrivix is built as a modular document system rather than a general-purpose
editor with AI bolted on. The product keeps document state, source state, build
state, and review state in one workspace so users do not need to reconstruct
context across tools.

This matters because the moat is not just model access. It is the combination
of structured document workflows, safe diff application, evidence grounding, and
submission readiness in one product shell.`,
        "market-evidence.md": `## Evidence

- 24 user interviews across postgraduate and policy-writing workflows
- repeated pain around citations, formatting, and final submission`,
      },
      wordEstimate: "1,220",
      lastExport: "Today, 07:54",
      compileStatus: "Review pending",
      compileTone: "neutral",
      editorChips: ["Narrative consistency", "Investor mode", "Appendix split export"],
      files: [
        { name: "narrative.md", type: "root" },
        { name: "appendix/", type: "folder" },
        { name: "appendix/system-architecture.md", type: "file", active: true },
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
        {
          id: "source-market-interviews",
          title: "Market interview synthesis",
          detail: "Founder research notes",
          state: "Linked to market section",
          citationKey: "marketinterviews2026",
          sourceType: "note",
          linkedFiles: ["market-evidence.md"],
          author: "Founder research",
          year: "2026",
        },
        {
          id: "source-benchmark-deck",
          title: "Workflow benchmark deck",
          detail: "Internal analysis",
          state: "Pinned",
          citationKey: "workflowbenchmark2026",
          sourceType: "report",
          author: "Internal analysis",
          year: "2026",
          pinned: true,
        },
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
      evidenceIssues: [
        {
          id: "issue-investor-architecture",
          title: "Potential evidence gap",
          detail: "The moat argument in the architecture section would benefit from one supporting benchmark reference.",
          location: "appendix/system-architecture.md",
          recommendation: "Attach one benchmark source or reduce the strength of the claim.",
          tone: "neutral",
        },
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
