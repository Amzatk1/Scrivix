#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function compileTimestamp() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function finalizeResult(buildMessages, engineLabel, engineDetail) {
  const hasError = buildMessages.some((message) => message.severity === "error");
  const hasWarn = buildMessages.some((message) => message.severity === "warn");
  const tone = hasError || hasWarn ? "warn" : "good";

  return {
    compileStatus: hasError ? "Build failed" : hasWarn ? "Build warnings" : "Build healthy",
    compileTone: tone,
    status: hasError ? "Build failed" : hasWarn ? "Build warnings" : "Build healthy",
    statusTone: tone,
    buildMessages,
    engineLabel,
    engineDetail,
  };
}

function analyzeProjectBuild(input, engineDetail) {
  const documents = Object.entries(input.documents || {});
  const combinedText = documents.map(([, content]) => content).join("\n");
  const nextMessages = [];

  if (input.mode === "latex") {
    const beginTableCount = (combinedText.match(/\\begin\{table\}/g) || []).length;
    const endTableCount = (combinedText.match(/\\end\{table\}/g) || []).length;

    if (beginTableCount !== endTableCount) {
      nextMessages.push({
        severity: "error",
        location: input.currentFile,
        text: "Unbalanced table environment detected. Check matching \\begin{table} and \\end{table}.",
      });
    }

    if (combinedText.includes("\\undefined") || combinedText.includes("\\badmacro")) {
      nextMessages.push({
        severity: "error",
        location: input.currentFile,
        text: "Undefined LaTeX command detected in the current build graph.",
      });
    }
  }

  if (combinedText.toLowerCase().includes("todo_cite") || combinedText.toLowerCase().includes("needs citation")) {
    nextMessages.push({
      severity: "warn",
      location: input.currentFile,
      text: "Citation placeholder still present in the draft. Resolve evidence coverage before final export.",
    });
  }

  documents
    .filter(([fileName]) => fileName.endsWith(".bib"))
    .forEach(([fileName, content]) => {
      if (!content.includes("year")) {
        nextMessages.push({
          severity: "warn",
          location: fileName,
          text: "Bibliography entry missing a year field.",
        });
      }
    });

  if ((input.evidenceIssues || []).length > 0) {
    nextMessages.push({
      severity: "warn",
      location: input.evidenceIssues[0]?.location || input.currentFile,
      text: `${input.evidenceIssues.length} evidence ${input.evidenceIssues.length === 1 ? "gap remains" : "gaps remain"} before final export.`,
    });
  }

  if (nextMessages.length === 0) {
    nextMessages.push({
      severity: "info",
      location: input.currentFile,
      text: `Worker analysis completed successfully at ${compileTimestamp()}.`,
    });
  } else {
    nextMessages.unshift({
      severity: "info",
      location: input.currentFile,
      text: engineDetail,
    });
  }

  return finalizeResult(nextMessages, "worker analysis", engineDetail);
}

function parseLatexmkOutput(log, fallbackFile) {
  const messages = [];
  const lines = log.split(/\r?\n/);
  let currentLineNumber = null;

  for (const line of lines) {
    const lineNumberMatch = line.match(/^l\.(\d+)/);

    if (lineNumberMatch) {
      currentLineNumber = lineNumberMatch[1];
      continue;
    }

    const errorMatch = line.match(/^!\s+(.*)$/);

    if (errorMatch) {
      messages.push({
        severity: "error",
        location: currentLineNumber ? `${fallbackFile}:${currentLineNumber}` : fallbackFile,
        text: errorMatch[1].trim(),
      });
      continue;
    }

    if (/warning/i.test(line) && /latex|package|citation|reference|overfull|underfull/i.test(line)) {
      messages.push({
        severity: "warn",
        location: fallbackFile,
        text: line.trim(),
      });
    }
  }

  if (messages.length === 0 && log.trim()) {
    const tail = lines.slice(-5).filter(Boolean).join(" ").trim();

    if (tail) {
      messages.push({
        severity: "error",
        location: fallbackFile,
        text: tail,
      });
    }
  }

  return messages;
}

function writeProjectTree(buildDirectory, documents) {
  for (const [fileName, content] of Object.entries(documents || {})) {
    const targetPath = path.join(buildDirectory, fileName);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content, "utf8");
  }
}

function runLatexmkCompile(input) {
  if (input.mode !== "latex") {
    return null;
  }

  const toolCheck = spawnSync("latexmk", ["-v"], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (toolCheck.error || toolCheck.status !== 0) {
    return null;
  }

  const mainFile =
    Object.prototype.hasOwnProperty.call(input.documents || {}, "main.tex")
      ? "main.tex"
      : Object.keys(input.documents || {}).find((fileName) => fileName.endsWith(".tex")) || input.currentFile;
  const buildDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "scrivix-latex-"));

  try {
    writeProjectTree(buildDirectory, input.documents);
    const result = spawnSync(
      "latexmk",
      ["-pdf", "-interaction=nonstopmode", "-halt-on-error", mainFile],
      {
        cwd: buildDirectory,
        encoding: "utf8",
        stdio: "pipe",
        timeout: 15_000,
      },
    );
    const log = `${result.stdout || ""}\n${result.stderr || ""}`.trim();

    if (result.error && result.error.code === "ETIMEDOUT") {
      return finalizeResult(
        [
          {
            severity: "error",
            location: mainFile,
            text: "latexmk timed out before the build completed.",
          },
        ],
        "latexmk worker",
        "Local latexmk timed out.",
      );
    }

    if (result.status === 0) {
      return finalizeResult(
        [
          {
            severity: "info",
            location: mainFile,
            text: `latexmk worker build completed successfully at ${compileTimestamp()}.`,
          },
        ],
        "latexmk worker",
        "Local latexmk completed the build.",
      );
    }

    const parsedMessages = parseLatexmkOutput(log, mainFile);

    return finalizeResult(
      parsedMessages.length > 0
        ? parsedMessages
        : [
            {
              severity: "error",
              location: mainFile,
              text: "latexmk returned a non-zero exit status without a parseable error message.",
            },
          ],
      "latexmk worker",
      "Local latexmk returned compile errors.",
    );
  } finally {
    fs.rmSync(buildDirectory, { recursive: true, force: true });
  }
}

function main() {
  const [, , inputPath, outputPath] = process.argv;

  if (!inputPath || !outputPath) {
    process.exit(1);
  }

  const rawInput = fs.readFileSync(inputPath, "utf8");
  const input = JSON.parse(rawInput);
  const compileResult =
    runLatexmkCompile(input) ??
    analyzeProjectBuild(input, "latexmk unavailable locally, so Scrivix used worker analysis instead.");

  fs.writeFileSync(outputPath, JSON.stringify(compileResult, null, 2), "utf8");
}

main();
