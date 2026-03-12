# Scrivix: Product Blueprint
_The intelligent workspace for serious writing._

## SECTION 1 — PRODUCT DEFINITION

**Product Name Evaluation**:
"Scrivix" is a strong, distinctive name. It evokes the history of writing (scrivener, scribe) combined with structure and technology (matrix, fix). It implies a tool that is both foundational and capable of repairing or organizing complex writing. It avoids generic "AI" branding, positioning it as a serious tool rather than a trend.

**One-Line Positioning**:
The AI-native workspace for serious documents.

**Product Thesis**:
Long-form, high-stakes writing—dissertations, research papers, legal documents, and technical reports—is too complex for traditional word processors like Google Docs, too fragmented in flexible tools like Notion, and too intimidating in pure markup environments like LaTeX/Overleaf. Meanwhile, current AI tools like ChatGPT are detached from the document's structure, citations, and export logic, often hallucinating references and overwriting the author's voice.
Scrivix treats documents as structured projects with integrated references, data, and logic, augmented by deterministic AI that respects the author's voice and operates within strict trust boundaries. It brings the power of IDE-style agentic assistance (like Cursor or Github Copilot) to the writing process.

**The Core User Problem**:
Writers of complex documents spend over 40% of their time fighting formatting, managing disconnected citations across different apps (e.g., Zotero, Word), resolving compile/build errors (if using LaTeX), and losing context when shifting between research, drafting, and reviewing.

**Who It Is For**:
Academics, researchers, technical writers, consultants, legal professionals, and founders managing multi-file, heavily cited, or strictly formatted documents.

**Why It Matters Now**:
LLMs have commoditized text generation, but serious writing is about synthesis, structure, and original thought. The market is flooded with generic "AI writers" that generate mediocre content. There is a massive vacuum for an AI-native workspace designed specifically for authorship, trust, and project management.

**Why Existing Tools Are Insufficient**:
- Google Docs: Chokes on long documents; citation management is bolted-on and clunky; lacks rigorous structural formatting; AI integrations are generic paragraph generators.
- Overleaf: Incredible for LaTeX collaboration, but hostile to non-coders and beginners. Poor native AI integration; fixing compile errors is a nightmare.
- Notion: Great for knowledge management, but terrible for academic/print export and lacks native rigorous citation management.
- ChatGPT/Claude: Chat interfaces lack persistent document context; dangerous for hallucinated citations; destroys the flow of writing by requiring constant copy-pasting.

**Why Users Would Switch**:
Users will switch to Scrivix because it ends the "Alt-Tab" fragmentation. It brings the citation manager, the build/export pipeline, and project-aware, non-destructive AI directly into a premium, Overleaf-style split workspace that feels modern, calm, and trustworthy.

---

## SECTION 2 — MARKET + COMPETITOR ANALYSIS

| Competitor | Strengths | Weaknesses | User Frustrations | Strategic Opportunity for Scrivix |
|---|---|---|---|---|
| **Overleaf** | LaTeX dominance, academic standard, collaboration. | Intimidating UI, steep learning curve, no native AI repair for errors. | "I spent 3 hours fixing a BibTeX error." | Offer the Overleaf layout but with a WYSIWYG/Markdown hybrid layer and an AI agent that auto-fixes LaTeX compile errors via one-click patches. |
| **Google Docs** | Ubiquity, real-time collab, low friction. | Terrible for 100+ page docs, weak styling, manual formatting. | "My thesis broke when I added a 50th citation or changed margins." | Handle massive multi-file projects effortlessly, with robust citation architectures that never break. |
| **Microsoft Word**| Deep feature set, offline capable, enterprise standard. | Bloated, proprietary styling logic, frequent crashing on massive files. | "Word crashed and corrupted my dissertation formatting." | Cloud-first stability, transparent version history, and predictable, code-backed formatting. |
| **Notion** | Flexible data, nice UI, database blocks. | Not designed for academic/print export, no native citations. | "I can't export this to a compliant IEEE format." | Provide Notion's visual elegance but structured strictly for document compilation and standard exports (PDF, DOCX). |
| **Claude/ChatGPT** | Incredible synthesis, structure, and ideation. | Amnesia across sessions, disjointed from the text editor. | "It rewrote my paragraph and stripped all my citations." | Integrate LLMs into the right pane, fully grounded in the document's references, applying changes inline via diffs. |
| **Cursor / Codex** | Agentic workflows, full-codebase context, diff views. | Built for code, not prose. | N/A (Dev tool). | Adapt the Cursor "Command-K" and "Agent" models for prose: highlight a paragraph and say "Integrate Smith 2023's counter-argument here." |
| **Grammarly** | Excellent syntax checking, ubiquitous. | Overly aggressive, strips academic tone, no structural awareness. | "It made my academic paper sound like a marketing blog." | Context-aware critiques that understand academic tone, rubrics, and the difference between editing and erasing voice. |
| **GPTZero** | First mover in AI detection. | High false positives, punitive, untrustworthy for nuanced writing. | "My original work was flagged as 40% AI." | Shift from "Detection" to "Provenance." Show the document's evolution to prove authorship, rather than relying on flawed statistical guessing. |
| **Zotero/Mendeley**| Powerful library, free, open. | Clunky UI, disconnected from the writing environment. | "Constantly exporting and syncing Bib files." | Build native syncing or a first-party source pane so references are *in the editor*, tightly coupled to the AI. |
| **Scrivener** | Multi-file writing, binder logic, offline. | UI from 2008, no collaboration, zero AI, hard to format output. | "Compiling to PDF is a nightmare." | Scrivix is the modern, cloud-native, collaborative, AI-augmented successor to Scrivener's binder mental model. |

---

## SECTION 3 — USER PERSONAS

**1. Undergraduate Student (The Neophyte)**
- **Goals**: Write essays that meet rubric requirements; avoid plagiarism.
- **Pain Points**: Doesn't know how to format citations; overwhelmed by academic tone; terrified of false AI-detection flags.
- **Current Tools**: Google Docs, generic ChatGPT, Grammarly.
- **Ideal Experience**: A calm workspace where inserting citations is as easy as typing `@`, formatting is automatic, and the AI acts as a tutor rather than a ghostwriter.
- **Must-have Workflows**: One-click MLA/APA formatting; rubric-aware AI checking; safe paraphrasing tutors.

**2. PhD Researcher (The Anchor Persona)**
- **Goals**: Finish an 80,000-word dissertation; get formatting approved by the university.
- **Pain Points**: Managing 300+ references; fighting legacy LaTeX templates; fear of AI overwriting their specific technical voice.
- **Current Tools**: Overleaf, Zotero, Word (begrudgingly).
- **Ideal Experience**: An environment that handles the bibliography silently, provides AI tools for structuring arguments, and guarantees compliant PDF export without LaTeX tears.
- **Must-have Workflows**: Mendeley/Zotero bidirectional sync, robust versioning, safe LaTeX AI-repair, multi-file chapter management.

**3. Lecturer/Supervisor (The Reviewer Persona)**
- **Goals**: Review 15 student papers efficiently; guide students; verify academic integrity.
- **Pain Points**: Getting a mix of Word docs and Overleaf links; struggling with generic "AI Detectors" giving false positives.
- **Current Tools**: Canvas/Blackboard, Word Track Changes, Turnitin.
- **Ideal Experience**: Read in a clean "Review Mode," leave comments that students can easily action, and see a transparent "Originality/Trust" dashboard that shows provenance rather than a binary AI score.
- **Must-have Workflows**: Comment-to-action systems, document health/provenance dashboard.

**4. Technical Writer / Founder (The Power User)**
- **Goals**: Write whitepapers, proposals, API docs, and business plans quickly.
- **Pain Points**: Keeping terminology consistent; referring back to old PDFs and specs; formatting for brand consistency.
- **Current Tools**: Notion, Google Docs, Markdown editors.
- **Ideal Experience**: Upload 10 PDFs (competitor manuals, raw specs) to the Source Library, open the editor, and have the AI draft structured sections fully grounded in those PDFs.
- **Must-have Workflows**: RAG-backed source chat, hybrid markdown/WYSIWYG editor, custom template exports.

---

## SECTION 4 — CORE PRODUCT PILLARS

1. **The Writing Workspace Core**: Multi-file, project-based architecture. A central editor that supports Rich Text, Markdown, and LaTeX under one unified hood, preventing the need to context-switch between files or apps.
2. **Project-Aware Document Intelligence**: The AI does not just read the current paragraph; it reads the *entire* project (all files, bibliographies, uploaded PDFs, outlines) to maintain global coherence.
3. **Agentic Repair/Help System (The Cursor Model)**: Non-intrusive AI that suggests diff-based patches for text, formatting, or code (LaTeX compile errors). The AI acts as an agent that fixes broken states, which the user explicitly approves or rejects.
4. **First-Class Source & Citation Engine**: A built-in reference manager that lives next to the text. Citations are treated as deterministic data links, not easily manipulated text strings.
5. **Trust & Originality Layer**: Provenance tracking. The system proves authorship by tracking the evolution of the document over time (keystrokes, AI diffs, edits), shielding users from false "AI Detector" claims and encouraging responsible AI usage.
6. **Collaboration and Review**: Robust comment systems where supervisor feedback can be directly translated into AI action items or tracked revisions.
7. **Export and Submission**: A deterministic build pipeline that guarantees the PDF or DOCX will match the required template perfectly, every time.

---

## SECTION 5 — INFORMATION ARCHITECTURE

**Familiarity Strategy**: The IA strictly mirrors the Overleaf/IDE mental model, which academics already understand, but upgrades the UI to feel like a modern consumer app (e.g., Linear, Notion). 

* **Left Panel**: Project Navigator
  - File tree (chapters, sections, appendices).
  - Assets (images, charts, datasets).
  - Outline (auto-generated navigable headers of the current active file).
* **Top Bar**: Global Controls & Compile
  - Project title, Breadcrumbs.
  - Export/Compile button (prominent, green/blue).
  - Status indicator (Syncing, Compiled, Error).
  - View mode toggles: Edit, Split (Edit + PDF), Review.
* **Center**: Main Canvas (The Editor)
  - Clean, centered, distraction-free writing area.
  - Floating command palette (Cmd/Ctrl + K) for quick actions.
* **Right Panel**: The Intelligence & Utility Pane (Tabbable)
  - Tab 1: AI Copilot (Chat & Actions context-aware to the document).
  - Tab 2: Sources / Citation Library (View PDFs, manage metadata).
  - Tab 3: Comments & Review.
  - Tab 4: Trust / Provenance Dashboard.
* **Bottom Console**: Collapsible utility area.
  - Build Logs, LaTeX errors, sync warnings, word count telemetry. Usually hidden unless compiling or requested.

**Bridging the Gap**:
For academics, the left-center-right layout is immediately recognizable as Overleaf. For new users, it feels like an advanced Notion. By keeping the left side strictly for file structure and the right side strictly for intelligence/utility, the cognitive load remains predictably localized.

---

## SECTION 6 — FULL SCREEN/PAGE INVENTORY

1. **Marketing Site / Landing Page**: Highlighting the "Cursor for Writing" wedge. Beautiful product shots, LaTeX error-fixing demo, and Trust dashboard preview.
2. **Dashboard**: Ethereal, grid/list view. "New Project from Template" is highly visible. Recent projects, team workspaces.
3. **Project Creation / Import Flow**: "Start Blank," "Import from Overleaf (Zip)," "Import Word/Google Doc," "Connect Zotero."
4. **Editor Workspace (Main)**: The core IDE-style view (detailed in Section 7).
5. **Template Gallery**: Beautiful preview cards for IEEE, APA, Harvard, University-specific theses, whitepapers.
6. **Source Library (Full View)**: A dedicated view for deep-reading and highlighting PDFs before writing. Extracts highlights into the AI project context.
7. **Citation Manager**: A metadata editor for tweaking BibTeX/CSL data.
8. **Originality/Trust Dashboard**: A heatmap of the document showing authorship history, AI contribution percentages, and citation coverage.
9. **Version History**: Linear-style commit history. Visual diffs of what changed, and *who* (human vs. AI) made the change.
10. **Comments/Review Panel**: Threaded comments, with "✨ Resolve with AI" buttons for simple structural fixes.
11. **Collaboration/Team Admin**: Workspace settings, role assignments (Viewer, Commenter, Editor, Supervisor).
12. **Settings**: General, Editor Preferences, Integrations (Zotero, Mendeley), API keys (if providing BYOK), Export defaults.

**Progressive Disclosure**:
The core Editor Workspace hides the Bottom Console unless there's an error. The Right panel defaults to closed or minimal state. Users only see the AI or Trust features when they actively click them. 

---

## SECTION 7 — THE PERFECT EDITOR WORKSPACE

The workspace must balance immense power with absolute calm. It uses a 3-column layout: 15% (Nav) | 45% (Editor) | 40% (Preview/Intelligence).

**The Center Editor (The Dominant Area)**
- **Typography & Spacing**: Uncompromisingly readable. Deep dark mode or crisp light mode. CMU Serif, Garamond, or modern alternatives for text; a beautiful monospaced font (Geist Mono, JetBrains) for LaTeX code blocks.
- **The Gutter**: Contains line numbers (crucial for error tracking) and subtle "AI spark" icons where agentic suggestions are pending.
- **Interaction Behavior**: Hovering over a citation `[@smith2023]` pops up a beautiful card with the paper's abstract and a link to open the PDF in the Right Pane. 
- **Keyboard Philosophy**: Everything is accessible via the keyboard. Cmd+K opens a universal palette to insert citations, run AI passes, or switch modes.

**The Adjacent Right Pane (The Split)**
- *Split Mode*: Shows the live-rendered PDF. Fast, WebGL-accelerated scrolling. Synchronized scrolling with the editor (Clicking the PDF jumps the code/text, and vice versa).
- *Intelligence Mode*: Flips the PDF out and brings in the AI Chat, Source Manager, or Review comments. This prevents the UI from becoming a claustrophobic 4-column nightmare.

**The Bottom Console (Errors & Build Messages)**
- Radically improves Overleaf's cryptic red text. If a LaTeX build fails, the console pops up displaying a human-readable interpretation: "Missing bracket on line 42." Beside it is a ✨ "Auto-Fix via AI" button.

**How it Improves on Overleaf**:
Overleaf forces users to look at raw formatting code constantly. Scrivix introduces an optional "Rich Text Mode" where complex LaTeX environments collapse into beautiful UI blocks (like Notion properties) until explicitly clicked. 

---

## SECTION 8 — AI SYSTEM INSIDE THE PRODUCT

The AI in Scrivix must never act as a ghostwriter that silently overwrites the user's voice. It acts as an **Agentic Assistant** using a strict **Patch & Diff Model**.

**Inline Edit (The Cursor Model for Prose)**:
- User highlights a paragraph and hits Cmd+K.
- Types: "Integrate Smith 2023's counter-argument here while tightening the prose."
- The AI streams a *diff* into the editor (red strikeout for deletions, green underline for additions). 
- The user can accept word-by-word, reject entirely, or quickly ask for a revision.

**Agentic Assistance Layer (Compile & Code Fixing)**:
- **Compile Error Repair**: If the document fails to build (e.g., PDF generation error, broken template), the agent automatically reads the build log, identifies the missing package or syntax error, and proposes a minimal patch to the preamble or text. The user clicks "Apply Patch."
- **Bibliography Repair**: Agent detects malformed BibTeX entries and suggests corrections by looking up DOIs automatically.

**Right-Panel Conversational AI**:
- Grounded deeply in the Source Library. 
- User: "What does the literature say about XYZ?" 
- AI: "According to [Johnson 2022], XYZ is... However, [Lee 2024] argues..." 
- The citations are clickable hyperlinks that shift the Right Pane to the exact highlighted sentence in the uploaded PDF.

**Supervisor-Style Critique**:
- Instead of "writing" the paper, the user clicks "Critique Structure." The AI flags repetitive arguments, unsupported claims (cross-referencing the citations), and weak transitions, acting strictly as a coach.

---

## SECTION 9 — TRUST / ORIGINALITY / AUTHORSHIP GUIDANCE LAYER

"AI Detectors" (like GPTZero) are fundamentally flawed, often penalizing non-native English speakers or specific writing styles. Scrivix pioneers a **Provenance and Trust Layer**.

- **Authorship History**: The system records the document's evolution as a ledger. It knows precisely what percentage of the text was typed natively by the user, what was copy-pasted, and what was accepted via an AI-generated diff template.
- **Document Health Dashboard**: A supervisor looking at the document doesn't see a scary "90% AI" score. They see: "Drafting History: 85% typed over 40 sessions. AI Assistance: Used primarily for formatting and paragraph tightening." It proves the work was done.
- **Citation Verification**: The AI runs a background check on all citations. It flags "Fabricated Citation Risk" if a DOI cannot be resolved or if the cited text in the paper fundamentally misrepresents the source's abstract.
- **Ethical Safeguards**: Scrivix refuses prompts like "Write a 5-page dissertation chapter on X." It responds safely: "I can help outline this chapter based on your sources. What is your core argument?"

---

## SECTION 10 — RESEARCH, SOURCES, AND CITATION WORKFLOWS

A best-in-class research layer that eliminates the need to run Zotero separately.

- **Source Library**: Drop 50 PDFs into the workspace. Scrivix parses them securely.
- **Annotations**: Highlight text in PDFs; extracts are automatically linked to the source and available in the AI context window.
- **The "Needs Evidence" Workflow**: A specialized AI pass analyzes the text for authoritative claims that lack citations, highlighting them in yellow as warnings.
- **Citation Insertion**: Type `/cite` (or use a hotkey) to open a rapid pop-over search (author, year, keyword).
- **Zotero/Mendeley Native Bi-directional Sync**: OAuth integration keeps Scrivix perfectly in sync with the user's desktop Zotero database.
- **Duplicate Detection & Integrity**: Auto-detects duplicate DOIs and warns users if a cited source is missing from the bibliography.
- **Submission-Readiness Checklist**: A final automated pass that ensures all cited sources exist in the reference section, formatting complies with the selected template, and margins are correct.

---

## SECTION 11 — DOCUMENT MODES

- **Rich Text Mode**: Looks and feels like Notion or Google Docs. Bold, italics, standard headers, WYSIWYG tables. Behind the scenes, it saves as clean Markdown or LaTeX. Best for drafting, essays, and non-technical founders.
- **LaTeX/Code Mode**: Pure, unadulterated code editor. Syntax highlighting, autocomplete, snippet macros, and package intellisense. Best for STEM PhDs and technical formatting.
- **Hybrid Mode**: LaTeX mode, but known environments (like `\begin{equation}` or `\includegraphics`) are collapsed into visual, rendered React components that expand into code when clicked.
- **Focus Mode**: Hides the Left and Right panes, expands the center editor, and uses typewriter scrolling for deep drafting sessions.
- **Review Mode**: Disables primary structural edits. Opens the comments pane and Trust dashboard. Optimized for supervisors and external reviewers.

---

## SECTION 12 — KEY DIFFERENTIATORS

1. **Live Diff-Based AI Prose Editing**: No other writing app executes Cursor-style patch-previews well. They either act as chatbots or destructively replace text. The diff model is the ultimate wedge for writers who care about their voice.
2. **Agentic Template/Compile Repair**: This solves the #1 reason people cry while using Overleaf or formatting complex Word docs. Automating the resolution of build errors is an immediate, massive value-add that drives viral adoption.
3. **First-Party Citation Intelligence**: ChatGPT hallucinates citations. Scrivix grounds its AI generation and chat purely in the user's specific Source Library and verified DOIs.
4. **Proof-of-Work Trust Protocol**: Defeats false AI-detector accusations, making it the only safe tool for students facing strict academic integrity policies.

---

## SECTION 13 — UX DETAILS MOST PRODUCTS MISS

- **Friction**: Compile confusion (LaTeX throws 50 lines of unreadable jargon). 
  - **Scrivix Fix**: The AI digests the build log and outputs a human sentence: "You forgot a closing bracket `}` on line 12."
- **Friction**: Citation anxiety (Did I cite this right?).
  - **Scrivix Fix**: Changing the citation style (e.g., APA to IEEE) is a global dropdown that instantly updates the entire document and bibliography with deterministic accuracy.
- **Friction**: Sidebar overload.
  - **Scrivix Fix**: The right panel relies on mutually exclusive tabs. If Chat is open, Sources are visually suppressed. This prevents UI claustrophobia.
- **Friction**: Preview lag.
  - **Scrivix Fix**: Uses WASM-based local PDF compilation rendering for fast, near-instantaneous feedback, falling back to a cloud compiler only for extremely heavy packages.

---

## SECTION 14 — VISUAL DESIGN SYSTEM

- **Aesthetic Direction**: "Scientific Elegance." It must feel scholarly and premium, not like playful SaaS or a sterile 1990s web app. 
- **Typography**: Inter or Geist for the UI (dense, legible, modern). CMU Serif, Garamond, or meticulously tuned modern serifs (e.g., Charter, Merriweather) for the Editor canvas.
- **Colors**: Deep, calm colors. 
  - Background: #FAFAFA (Light), #0D0D12 (Dark).
  - Accents: Subtle indigo/blurple for AI actions, signaling intelligence without urgency.
  - UI Borders: 1px solid #E5E5E5 in light mode to define panels sharply.
- **Motion Principles**: Minimal but purposeful. The patch/diff animation should feel smooth and satisfying, like code snapping into place. Compile states show a calm, elegant loading shimmer in the top bar.

---

## SECTION 15 — END-TO-END USER FLOWS

**Flow: Resolving a Compile Error**
1. User types an invalid LaTeX macro.
2. Auto-compile runs. Top bar status indicator flashes yellow. 
3. Bottom console gently slides up 10%, displaying: "Warning: Undefined control sequence `\boldtext`."
4. User clicks ✨ "Explain & Fix."
5. Right pane opens; AI explains: "You likely meant `\textbf{}`. Apply patch?"
6. The editor shows a green/red inline diff previewing the fix.
7. User hits `Enter` to accept. Bottom console turns green and retreats.

**Flow: Using AI Help During Drafting**
1. User highlights a clunky paragraph.
2. User hits Cmd+K and types "Shorten this and make it more formal."
3. Scrivix streams the inline diff.
4. User likes the first sentence but hates the second. Because of the diff layout, they hit `Tab` to accept the first part, then manually edit the rest.

---

## SECTION 16 — IMPLEMENTATION ARCHITECTURE

- **Frontend**: Next.js (React). Highly reliant on ProseMirror or TipTap for the complex rich-text/hybrid editor state, backed by Monaco Editor for pure code/LaTeX mode. 
- **State Management**: Yjs for real-time multiplayer CRDTs, ensuring seamless collaboration.
- **Backend / API**: Node/Express or Go for high-concurrency document processing. PostgreSQL for relational data; Redis for caching.
- **Compilation Engine**: A scalable fleet of containerized TeX Live environments (Docker/Kubernetes). Implementing Tectonic (a Rust-based LaTeX engine) is highly recommended for faster, cleaner, dependency-free cloud builds.
- **File Storage**: AWS S3 for raw text assets, images, and heavy PDFs.
- **Collaboration Model**: Yjs over WebSockets ensures offline support and rapid real-time syncing.

---

## SECTION 17 — AI TECHNICAL ARCHITECTURE

- **Models**: GPT-4o or Claude 3.5 Sonnet for deep generation and coding/LaTeX repairs (highest intelligence). Claude 3 Haiku or GPT-4o-mini for fast autocomplete, UI heuristics, and basic transformations.
- **Retrieval Infrastructure (RAG)**: Uploaded PDFs undergo parsing (e.g., PyMuPDF), chunking, and embedding via OpenAI/Cohere embeddings into a Vector DB (Pinecone/Milvus).
- **Agentic Pipeline (The Diff Generator)**: 
  - When fixing a build error, the backend agent is fed: `[File State] + [Error Log] + [Project Config]`.
  - The model is prompted to output a strict JSON patch or unified diff.
  - The frontend parses the diff and applies it to the ProseMirror/Monaco state for visual preview.
- **Deterministic Bounds**: System prompts must strictly forbid hallucinating citations. The architecture must enforce that if a citation is output by the LLM, it must match a key in the user's `.bib` file; otherwise, the frontend rejects it or flags it red.

---

## SECTION 18 — SAFETY, PRIVACY, AND POLICY LAYER

- **Data Privacy**: Users can toggle "Private Workspace." If checked, data is explicitly excluded from LLM training (utilizing Zero Data Retention enterprise APIs from OpenAI/Anthropic).
- **Academic Misuse**: Scrivix does not write papers from scratch. Prompts like "Write a 5-page essay on Shakespeare" are intercepted. The AI steers the user: "I can help you outline this essay based on your sources. What is your core argument?"
- **Copyright Handling**: PDF libraries are tightly sandboxed per user/workspace. The system does not maintain a global trained knowledge base on user-uploaded copyrighted materials.
- **False Accusations**: Scrivix empowers users to defend themselves against institutional AI-detector false positives by providing exportable "Proof of Authorship" cryptographic logs demonstrating session time and keystroke evolution.

---

## SECTION 19 — PRICING AND BUSINESS MODEL

The "Prosumer to Enterprise" SaaS model, optimized for viral student loops and profitable institutional capture.

- **Free Tier**: 3 active projects. Basic LaTeX compilation. GPT-4o-mini level AI (rate limited). No Zotero sync. Watermarked exports. (Drives organic growth).
- **Pro Tier (Student/Academic)**: $12-$15/month. Unlimited projects, full Zotero sync, access to advanced Claude 3.5 Sonnet / GPT-4o agents. Priority, fast TeX compilation.
- **Team/Lab Tier**: $25/seat/month. Shared lab libraries, supervisor review dashboards, institutional IP protection, shared templates.
- **Enterprise/University**: Site licenses. SSO, LMS integrations, strict privacy compliance, centralized billing.

---

## SECTION 20 — MVP VS V2 VS LONG-TERM VISION

**MVP (Months 1-4: "The Wedge")**
- Focus entirely on the single-player, LaTeX-heavy user (CS/STEM students). 
- Deliver a robust code/WYSIWYG editor, instantaneous cloud PDF compiling, and the *Agentic Error Repair* system. 
- Inline Cmd+K diffs for prose. 
- *Why:* This group tolerates bugs, already pays for tools (Copilot, Overleaf), and desperately needs AI that understands LaTeX.

**V2 (Months 5-9: "The Humanities Expansion")**
- Multiplayer/Collaboration (CRDTs). 
- Deep Zotero/Mendeley integration. 
- Full Source Library RAG capabilities for PDF chat. 
- Focus heavily on the "Rich Text" mode to capture non-technical academics, lawyers, and founders.

**V3 (The Platform Vision: "The OS for Knowledge")**
- The standard operating system for global research. 
- AI-assisted peer-review pipelines. 
- Direct publisher submission APIs (export and submit directly to Nature, IEEE, Elsevier standard portals). 
- Institutional grants management integration.

---

## SECTION 21 — FINAL FOUNDER RECOMMENDATION

**Strongest Final Concept**: Scrivix as "Cursor for Academics." The execution wedge is bringing agentic, diff-based patching to the immense pain of document formatting, LaTeX compilation, and academic structuring. 

**Best Positioning Statement**: 
"The intelligent workspace that writes, formats, and cites with you—never for you."

**Top Priorities / Biggest Mistakes to Avoid**:
1. **Mistake**: Building a generic text editor. **Priority**: Build a structured, multi-file project environment from day one.
2. **Mistake**: Making the AI a ghostwriter. **Priority**: Perfect the "Accept/Reject Diff" UX for prose. If it feels like standard copy-pasting from ChatGPT, you lose the trust of serious writers.
3. **Mistake**: Ignoring the pain of formatting. **Priority**: Solve compile errors instantly with AI. This is the viral growth loop ("Overleaf takes hours to debug, Scrivix fixes it in 1 click").

**Recommended Launch Path**: 
Build strict, uncompromising support for one vertical first: Computer Science and Engineering graduate students. They already tolerate LaTeX, they already love AI developer tools, and they desperately need a better writing environment. Win their extreme loyalty, validate the agentic-repair model, and then expand to the massive humanities market by softening the UI into the rich-text mode.
