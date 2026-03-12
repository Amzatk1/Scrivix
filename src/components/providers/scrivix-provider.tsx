"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  projects as seedProjects,
  templates,
  type ProjectRecord,
  type TemplateRecord,
} from "@/lib/product-data";
import {
  applyWorkspaceIntelligence,
  buildSourceRecord,
  type SourceDraftInput,
} from "@/lib/document-intelligence";
import {
  fallbackDocumentForFile,
  type CreateProjectInput,
  type ImportProjectInput,
} from "@/lib/project-utils";
import { createFileRecord } from "@/lib/editor-utils";

type ScrivixContextValue = {
  hydrated: boolean;
  syncError: string | null;
  compilingProjectSlugs: string[];
  repairingProjectSlugs: string[];
  versioningProjectSlugs: string[];
  projects: ProjectRecord[];
  templates: TemplateRecord[];
  createProject: (input: CreateProjectInput) => Promise<ProjectRecord>;
  createImportedProject: (input: ImportProjectInput) => Promise<ProjectRecord>;
  applyProjectRepair: (projectSlug: string) => Promise<void>;
  compileProject: (projectSlug: string) => Promise<void>;
  createProjectSnapshot: (projectSlug: string, snapshotLabel?: string) => Promise<void>;
  createProjectFile: (projectSlug: string, fileName: string) => Promise<void>;
  createProjectSource: (projectSlug: string, input: SourceDraftInput) => Promise<void>;
  rollbackProjectRepair: (projectSlug: string) => Promise<void>;
  restoreProjectSnapshot: (projectSlug: string, snapshotId: string) => Promise<void>;
  updateProjectDocument: (projectSlug: string, fileName: string, content: string) => void;
  selectProjectFile: (projectSlug: string, fileName: string) => Promise<void>;
};

type ApiListProjectsResponse = {
  projects: ProjectRecord[];
};

type ApiProjectResponse = {
  project: ProjectRecord;
};

const ScrivixContext = createContext<ScrivixContextValue | null>(null);

function mergeProject(projects: ProjectRecord[], project: ProjectRecord) {
  const existingIndex = projects.findIndex((entry) => entry.slug === project.slug);

  if (existingIndex === -1) {
    return [project, ...projects];
  }

  return projects.map((entry) => (entry.slug === project.slug ? project : entry));
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

type ScrivixProviderProps = {
  children: ReactNode;
};

export function ScrivixProvider({ children }: ScrivixProviderProps) {
  const [hydrated, setHydrated] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [compilingProjectSlugs, setCompilingProjectSlugs] = useState<string[]>([]);
  const [repairingProjectSlugs, setRepairingProjectSlugs] = useState<string[]>([]);
  const [versioningProjectSlugs, setVersioningProjectSlugs] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>(() => seedProjects.map((project) => applyWorkspaceIntelligence(project)));
  const saveTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    void requestJson<ApiListProjectsResponse>("/api/projects")
      .then((response) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setProjects(response.projects);
          setSyncError(null);
          setHydrated(true);
        });
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setSyncError("Workspace API unavailable. Showing bundled seed projects.");
          setHydrated(true);
        });
      });

    return () => {
      isMounted = false;

      Object.values(saveTimersRef.current).forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, []);

  async function createProject(input: CreateProjectInput) {
    const response = await requestJson<ApiProjectResponse>("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    startTransition(() => {
      setProjects((currentProjects) => mergeProject(currentProjects, response.project));
      setSyncError(null);
    });

    return response.project;
  }

  async function createImportedProject(input: ImportProjectInput) {
    const response = await requestJson<ApiProjectResponse>("/api/projects/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    startTransition(() => {
      setProjects((currentProjects) => mergeProject(currentProjects, response.project));
      setSyncError(null);
    });

    return response.project;
  }

  async function compileProject(projectSlug: string) {
    startTransition(() => {
      setCompilingProjectSlugs((current) => [...new Set([...current, projectSlug])]);
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.slug !== projectSlug) {
            return project;
          }

          return {
            ...project,
            meta: "Compiling…",
            status: "Compiling…",
            statusTone: "neutral",
            workspace: {
              ...project.workspace,
              compileStatus: "Compiling…",
              compileTone: "neutral",
            },
          };
        }),
      );
    });

    try {
      const response = await requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}/compile`, {
        method: "POST",
      });

      startTransition(() => {
        setProjects((currentProjects) => mergeProject(currentProjects, response.project));
        setSyncError(null);
      });
    } catch {
      startTransition(() => {
        setSyncError("Compile could not be completed. The workspace state is still available locally.");
        setProjects((currentProjects) =>
          currentProjects.map((project) => {
            if (project.slug !== projectSlug) {
              return project;
            }

            return {
              ...project,
              meta: "Compile failed to start",
              status: "Compile unavailable",
              statusTone: "warn",
              workspace: {
                ...project.workspace,
                compileStatus: "Compile unavailable",
                compileTone: "warn",
              },
            };
          }),
        );
      });
    } finally {
      startTransition(() => {
        setCompilingProjectSlugs((current) => current.filter((slug) => slug !== projectSlug));
      });
    }
  }

  async function applyProjectRepair(projectSlug: string) {
    startTransition(() => {
      setRepairingProjectSlugs((current) => [...new Set([...current, projectSlug])]);
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.slug !== projectSlug) {
            return project;
          }

          return {
            ...project,
            meta: "Applying repair…",
            workspace: {
              ...project.workspace,
              compileStatus: "Applying repair…",
              compileTone: "neutral",
            },
          };
        }),
      );
    });

    try {
      const response = await requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "applyRepair",
        }),
      });

      startTransition(() => {
        setProjects((currentProjects) => mergeProject(currentProjects, response.project));
        setSyncError(null);
      });
    } catch {
      startTransition(() => {
        setSyncError("The repair patch could not be applied.");
      });
    } finally {
      startTransition(() => {
        setRepairingProjectSlugs((current) => current.filter((slug) => slug !== projectSlug));
      });
    }
  }

  async function createProjectSnapshot(projectSlug: string, snapshotLabel?: string) {
    startTransition(() => {
      setVersioningProjectSlugs((current) => [...new Set([...current, projectSlug])]);
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.slug !== projectSlug) {
            return project;
          }

          return {
            ...project,
            meta: "Saving snapshot…",
          };
        }),
      );
    });

    try {
      const response = await requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createSnapshot",
          snapshotLabel,
        }),
      });

      startTransition(() => {
        setProjects((currentProjects) => mergeProject(currentProjects, response.project));
        setSyncError(null);
      });
    } catch {
      startTransition(() => {
        setSyncError("The snapshot could not be saved.");
      });
    } finally {
      startTransition(() => {
        setVersioningProjectSlugs((current) => current.filter((slug) => slug !== projectSlug));
      });
    }
  }

  async function rollbackProjectRepair(projectSlug: string) {
    startTransition(() => {
      setRepairingProjectSlugs((current) => [...new Set([...current, projectSlug])]);
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.slug !== projectSlug) {
            return project;
          }

          return {
            ...project,
            meta: "Rolling back repair…",
          };
        }),
      );
    });

    try {
      const response = await requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "rollbackRepair",
        }),
      });

      startTransition(() => {
        setProjects((currentProjects) => mergeProject(currentProjects, response.project));
        setSyncError(null);
      });
    } catch {
      startTransition(() => {
        setSyncError("The last repair could not be rolled back.");
      });
    } finally {
      startTransition(() => {
        setRepairingProjectSlugs((current) => current.filter((slug) => slug !== projectSlug));
      });
    }
  }

  async function restoreProjectSnapshot(projectSlug: string, snapshotId: string) {
    startTransition(() => {
      setVersioningProjectSlugs((current) => [...new Set([...current, projectSlug])]);
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.slug !== projectSlug) {
            return project;
          }

          return {
            ...project,
            meta: "Restoring snapshot…",
          };
        }),
      );
    });

    try {
      const response = await requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "restoreSnapshot",
          snapshotId,
        }),
      });

      startTransition(() => {
        setProjects((currentProjects) => mergeProject(currentProjects, response.project));
        setSyncError(null);
      });
    } catch {
      startTransition(() => {
        setSyncError("The selected snapshot could not be restored.");
      });
    } finally {
      startTransition(() => {
        setVersioningProjectSlugs((current) => current.filter((slug) => slug !== projectSlug));
      });
    }
  }

  async function createProjectFile(projectSlug: string, fileName: string) {
    const trimmedFileName = fileName.trim();

    if (!trimmedFileName) {
      return;
    }

    startTransition(() => {
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.slug !== projectSlug) {
            return project;
          }

          return {
            ...project,
            meta: "Creating file…",
            workspace: {
              ...project.workspace,
              currentFile: trimmedFileName,
              files: createFileRecord(trimmedFileName, project.workspace.files),
              documents: {
                ...project.workspace.documents,
                [trimmedFileName]: project.workspace.documents[trimmedFileName] ?? fallbackDocumentForFile(trimmedFileName),
              },
            },
          };
        }),
      );
    });

    try {
      const response = await requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createFile",
          fileName: trimmedFileName,
        }),
      });

      startTransition(() => {
        setProjects((currentProjects) => mergeProject(currentProjects, response.project));
        setSyncError(null);
      });
    } catch {
      startTransition(() => {
        setSyncError("The new file could not be added to the workspace store.");
      });
    }
  }

  async function createProjectSource(projectSlug: string, input: SourceDraftInput) {
    const trimmedTitle = input.title.trim();
    const trimmedDetail = input.detail.trim();

    if (!trimmedTitle || !trimmedDetail) {
      return;
    }

    startTransition(() => {
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.slug !== projectSlug) {
            return project;
          }

          return {
            ...project,
            meta: "Adding source…",
            workspace: {
              ...project.workspace,
              sources: [buildSourceRecord(input, project.workspace.sources), ...project.workspace.sources],
            },
          };
        }),
      );
    });

    try {
      const response = await requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createSource",
          source: input,
        }),
      });

      startTransition(() => {
        setProjects((currentProjects) => mergeProject(currentProjects, response.project));
        setSyncError(null);
      });
    } catch {
      startTransition(() => {
        setSyncError("The source could not be added to the workspace store.");
      });
    }
  }

  function updateProjectDocument(projectSlug: string, fileName: string, content: string) {
    startTransition(() => {
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.slug !== projectSlug) {
            return project;
          }

          return {
            ...project,
            meta: "Saving…",
            workspace: {
              ...project.workspace,
              documents: {
                ...project.workspace.documents,
                [fileName]: content,
              },
            },
          };
        }),
      );
    });

    const timerKey = `${projectSlug}:${fileName}`;
    const existingTimer = saveTimersRef.current[timerKey];

    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    saveTimersRef.current[timerKey] = window.setTimeout(() => {
      void requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateDocument",
          fileName,
          content,
        }),
      })
        .then((response) => {
          startTransition(() => {
            setProjects((currentProjects) => mergeProject(currentProjects, response.project));
            setSyncError(null);
          });
        })
        .catch(() => {
          startTransition(() => {
            setSyncError("Document changes could not be synced to the workspace store.");
            setProjects((currentProjects) =>
              currentProjects.map((project) => {
                if (project.slug !== projectSlug) {
                  return project;
                }

                return {
                  ...project,
                  meta: "Edited locally",
                };
              }),
            );
          });
        })
        .finally(() => {
          delete saveTimersRef.current[timerKey];
        });
    }, 450);
  }

  async function selectProjectFile(projectSlug: string, fileName: string) {
    startTransition(() => {
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
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
        }),
      );
    });

    try {
      const response = await requestJson<ApiProjectResponse>(`/api/projects/${projectSlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "selectFile",
          fileName,
        }),
      });

      startTransition(() => {
        setProjects((currentProjects) => mergeProject(currentProjects, response.project));
        setSyncError(null);
      });
    } catch {
      startTransition(() => {
        setSyncError("Active file selection could not be synced to the workspace store.");
      });
    }
  }

  return (
    <ScrivixContext.Provider
      value={{
        hydrated,
        syncError,
        compilingProjectSlugs,
        repairingProjectSlugs,
        versioningProjectSlugs,
        projects,
        templates,
        createProject,
        createImportedProject,
        applyProjectRepair,
        compileProject,
        createProjectSnapshot,
        createProjectFile,
        createProjectSource,
        rollbackProjectRepair,
        restoreProjectSnapshot,
        updateProjectDocument,
        selectProjectFile,
      }}
    >
      {children}
    </ScrivixContext.Provider>
  );
}

export function useScrivix() {
  const context = useContext(ScrivixContext);

  if (!context) {
    throw new Error("useScrivix must be used within a ScrivixProvider.");
  }

  return context;
}
