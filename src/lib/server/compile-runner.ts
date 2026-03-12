import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { BuildMessage, ProjectRecord, StatusTone } from "@/lib/product-data";

const execFileAsync = promisify(execFile);

export type CompileResult = {
  compileStatus: string;
  compileTone: StatusTone;
  status: string;
  statusTone: StatusTone;
  buildMessages: BuildMessage[];
  engineLabel: string;
  engineDetail: string;
};

type CompileWorkerPayload = {
  currentFile: string;
  documents: Record<string, string>;
  evidenceIssues: ProjectRecord["workspace"]["evidenceIssues"];
  mode: ProjectRecord["mode"];
};

function isCompileResult(value: unknown): value is CompileResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.compileStatus === "string" &&
    typeof candidate.compileTone === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.statusTone === "string" &&
    typeof candidate.engineLabel === "string" &&
    typeof candidate.engineDetail === "string" &&
    Array.isArray(candidate.buildMessages)
  );
}

export async function runProjectCompileWorker(project: ProjectRecord) {
  const workerPayload: CompileWorkerPayload = {
    mode: project.mode,
    currentFile: project.workspace.currentFile,
    documents: project.workspace.documents,
    evidenceIssues: project.workspace.evidenceIssues,
  };
  const workerDirectory = path.join(os.tmpdir(), `scrivix-compile-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const inputPath = path.join(workerDirectory, "input.json");
  const outputPath = path.join(workerDirectory, "output.json");
  const workerScriptPath = path.join(process.cwd(), "scripts", "compile-worker.js");

  await mkdir(workerDirectory, { recursive: true });
  await writeFile(inputPath, JSON.stringify(workerPayload, null, 2), "utf8");

  try {
    await execFileAsync(process.execPath, [workerScriptPath, inputPath, outputPath], {
      timeout: 20_000,
    });

    const rawOutput = await readFile(outputPath, "utf8");
    const parsed = JSON.parse(rawOutput) as unknown;

    if (!isCompileResult(parsed)) {
      throw new Error("Compile worker returned an invalid payload.");
    }

    return parsed;
  } finally {
    await rm(workerDirectory, { recursive: true, force: true });
  }
}
