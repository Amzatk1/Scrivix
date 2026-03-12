import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { projects as seedProjects, type ProjectRecord } from "@/lib/product-data";
import {
  buildProjectFromTemplate,
  cloneRecord,
  fallbackDocumentForFile,
  type CreateProjectInput,
} from "@/lib/project-utils";

const dataDirectory = path.join(process.cwd(), "data");
const storePath = path.join(dataDirectory, "projects.json");

async function ensureStoreFile() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(cloneRecord(seedProjects), null, 2), "utf8");
  }
}

async function readProjectsFromDisk() {
  await ensureStoreFile();
  const fileContents = await readFile(storePath, "utf8");

  try {
    const parsed = JSON.parse(fileContents) as ProjectRecord[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through to reseed.
  }

  const reseededProjects = cloneRecord(seedProjects);
  await writeProjectsToDisk(reseededProjects);
  return reseededProjects;
}

async function writeProjectsToDisk(projects: ProjectRecord[]) {
  await ensureStoreFile();
  await writeFile(storePath, JSON.stringify(projects, null, 2), "utf8");
}

export async function listProjects() {
  return readProjectsFromDisk();
}

export async function getProject(projectSlug: string) {
  const projects = await readProjectsFromDisk();
  return projects.find((project) => project.slug === projectSlug);
}

export async function createProject(input: CreateProjectInput) {
  const projects = await readProjectsFromDisk();
  const project = buildProjectFromTemplate(input, projects);
  const nextProjects = [project, ...projects];
  await writeProjectsToDisk(nextProjects);
  return project;
}

export async function selectProjectFile(projectSlug: string, fileName: string) {
  const projects = await readProjectsFromDisk();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    return {
      ...project,
      workspace: {
        ...project.workspace,
        currentFile: fileName,
        files: project.workspace.files.map((file) => ({
          ...file,
          active: file.name === fileName,
        })),
        documents: {
          ...project.workspace.documents,
          [fileName]: project.workspace.documents[fileName] ?? fallbackDocumentForFile(fileName),
        },
      },
    };
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

export async function updateProjectDocument(projectSlug: string, fileName: string, content: string) {
  const projects = await readProjectsFromDisk();
  const nextProjects = projects.map((project) => {
    if (project.slug !== projectSlug) {
      return project;
    }

    return {
      ...project,
      meta: "Saved to workspace",
      workspace: {
        ...project.workspace,
        documents: {
          ...project.workspace.documents,
          [fileName]: content,
        },
      },
    };
  });

  await writeProjectsToDisk(nextProjects);
  return nextProjects.find((project) => project.slug === projectSlug);
}

