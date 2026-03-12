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
  fallbackDocumentForFile,
  type CreateProjectInput,
} from "@/lib/project-utils";

type ScrivixContextValue = {
  hydrated: boolean;
  syncError: string | null;
  projects: ProjectRecord[];
  templates: TemplateRecord[];
  createProject: (input: CreateProjectInput) => Promise<ProjectRecord>;
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
  const [projects, setProjects] = useState<ProjectRecord[]>(seedProjects);
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
        projects,
        templates,
        createProject,
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
