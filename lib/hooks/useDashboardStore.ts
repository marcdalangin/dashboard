"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardState, Task, Template, ColumnId, Priority, DashboardSettings } from "../types";
import { DEFAULT_TASKS, DEFAULT_TEMPLATES } from "../defaultData";

const STORAGE_KEY = "notion_dashboard_state_v2";

const INITIAL_SETTINGS: DashboardSettings = {
  theme: "light",
  useFirstNameOnly: true,
  activeTab: "kanban-tab",
  sidebarCollapsed: false,
  selectedScout: "Aaron Garcia",
  userEmail: "",
  remoteSyncEnabled: false,
};

const INITIAL_STATE: DashboardState = {
  tasks: DEFAULT_TASKS,
  templates: DEFAULT_TEMPLATES,
  settings: INITIAL_SETTINGS,
  scratchpad: "Handover notes:\n- Review coverage applications\n- Confirm court 2 device status\n",
  history: [],
};

export function useDashboardStore() {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "offline" | "unconfigured">("offline");
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load initial state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : DEFAULT_TASKS,
          templates: Array.isArray(parsed.templates) ? parsed.templates : DEFAULT_TEMPLATES,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
          scratchpad: typeof parsed.scratchpad === "string" ? parsed.scratchpad : INITIAL_STATE.scratchpad,
          history: Array.isArray(parsed.history) ? parsed.history : [],
        });
      }
    } catch (e) {
      console.warn("Failed to read localStorage:", e);
    }
    setIsInitialized(true);
  }, []);

  // 2. Persist to localStorage whenever state updates
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [state, isInitialized]);

  // 3. Debounced Cloud Sync to Neon via /api/sync
  const triggerRemoteSync = useCallback((newState: DashboardState) => {
    if (!newState.settings.userEmail) {
      setSyncStatus("offline");
      return;
    }

    setSyncStatus("saving");
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newState.settings.userEmail,
            state: {
              tasks: newState.tasks,
              templates: newState.templates,
              settings: newState.settings,
              scratchpad: newState.scratchpad,
            },
          }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.configured) {
            setSyncStatus("synced");
          } else {
            setSyncStatus("unconfigured");
          }
        } else {
          setSyncStatus("offline");
        }
      } catch (err) {
        console.warn("Background remote sync failed (offline):", err);
        setSyncStatus("offline");
      } finally {
        setIsSyncing(false);
      }
    }, 1200);
  }, []);

  // 4. Fetch delta from Neon Postgres on load or focus
  const fetchRemoteData = useCallback(async (email: string) => {
    if (!email) return;
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/sync?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.configured && data.state) {
          setState((prev) => {
            const merged: DashboardState = {
              ...prev,
              tasks: Array.isArray(data.state.tasks) && data.state.tasks.length > 0 ? data.state.tasks : prev.tasks,
              templates: Array.isArray(data.state.templates) && data.state.templates.length > 0 ? data.state.templates : prev.templates,
              scratchpad: data.state.scratchpad !== undefined ? data.state.scratchpad : prev.scratchpad,
              settings: { ...prev.settings, ...(data.state.settings || {}) },
            };
            return merged;
          });
          setSyncStatus("synced");
        } else if (!data.configured) {
          setSyncStatus("unconfigured");
        }
      }
    } catch {
      setSyncStatus("offline");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Revalidate on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (state.settings.userEmail) {
        fetchRemoteData(state.settings.userEmail);
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleFocus();
    });
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [state.settings.userEmail, fetchRemoteData]);

  // Sync state mutation helper
  const updateState = useCallback(
    (updater: (prev: DashboardState) => DashboardState) => {
      setState((prev) => {
        const next = updater(prev);
        triggerRemoteSync(next);
        return next;
      });
    },
    [triggerRemoteSync]
  );

  // --- Task Methods ---
  const addTask = useCallback(
    (taskData: {
      title: string;
      description?: string;
      columnId?: ColumnId;
      priority?: Priority;
      scout?: string;
      tags?: string[];
      checklist?: { id: string; text: string; done: boolean }[];
    }) => {
      const newTask: Task = {
        id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        title: taskData.title.trim(),
        description: taskData.description?.trim() || "",
        columnId: taskData.columnId || "backlogs",
        priority: taskData.priority || "Medium",
        scout: taskData.scout?.trim() || "",
        tags: taskData.tags || [],
        checklist: taskData.checklist || [],
        createdAt: Date.now(),
      };
      updateState((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
      }));
      return newTask;
    },
    [updateState]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      updateState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      }));
    },
    [updateState]
  );

  const moveTask = useCallback(
    (taskId: string, newColumnId: ColumnId, targetIndex = -1) => {
      updateState((prev) => {
        const index = prev.tasks.findIndex((t) => t.id === taskId);
        if (index === -1) return prev;
        const tasks = [...prev.tasks];
        const [task] = tasks.splice(index, 1);
        const updatedTask = { ...task, columnId: newColumnId };

        if (targetIndex >= 0) {
          tasks.splice(targetIndex, 0, updatedTask);
        } else {
          tasks.push(updatedTask);
        }
        return { ...prev, tasks };
      });
    },
    [updateState]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      updateState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      }));
    },
    [updateState]
  );

  // --- Template Methods ---
  const addTemplate = useCallback(
    (templateData: { title: string; category?: Template["category"]; body: string; pinned?: boolean }) => {
      const newTemplate: Template = {
        id: "tpl-" + Date.now(),
        title: templateData.title.trim(),
        category: templateData.category || "scout-direct",
        body: templateData.body.trim(),
        pinned: templateData.pinned || false,
      };
      updateState((prev) => ({
        ...prev,
        templates: [newTemplate, ...prev.templates],
      }));
      return newTemplate;
    },
    [updateState]
  );

  const updateTemplate = useCallback(
    (templateId: string, updates: Partial<Template>) => {
      updateState((prev) => ({
        ...prev,
        templates: prev.templates.map((tpl) => (tpl.id === templateId ? { ...tpl, ...updates } : tpl)),
      }));
    },
    [updateState]
  );

  const deleteTemplate = useCallback(
    (templateId: string) => {
      updateState((prev) => ({
        ...prev,
        templates: prev.templates.filter((tpl) => tpl.id !== templateId),
      }));
    },
    [updateState]
  );

  const resetTemplates = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      templates: DEFAULT_TEMPLATES,
    }));
  }, [updateState]);

  // --- Scratchpad & History ---
  const updateScratchpad = useCallback(
    (text: string) => {
      updateState((prev) => ({
        ...prev,
        scratchpad: text,
      }));
    },
    [updateState]
  );

  const addHistory = useCallback(
    (text: string, templateTitle = "") => {
      if (!text) return;
      updateState((prev) => ({
        ...prev,
        history: [
          {
            id: "hist-" + Date.now(),
            text,
            templateTitle,
            timestamp: Date.now(),
          },
          ...prev.history.slice(0, 29),
        ],
      }));
    },
    [updateState]
  );

  // --- Settings ---
  const setTheme = useCallback(
    (theme: "light" | "dark") => {
      updateState((prev) => ({
        ...prev,
        settings: { ...prev.settings, theme },
      }));
    },
    [updateState]
  );

  const setUseFirstNameOnly = useCallback(
    (val: boolean) => {
      updateState((prev) => ({
        ...prev,
        settings: { ...prev.settings, useFirstNameOnly: val },
      }));
    },
    [updateState]
  );

  const setActiveTab = useCallback(
    (activeTab: DashboardSettings["activeTab"]) => {
      updateState((prev) => ({
        ...prev,
        settings: { ...prev.settings, activeTab },
      }));
    },
    [updateState]
  );

  const setSidebarCollapsed = useCallback(
    (collapsed: boolean) => {
      updateState((prev) => ({
        ...prev,
        settings: { ...prev.settings, sidebarCollapsed: collapsed },
      }));
    },
    [updateState]
  );

  const setSelectedScout = useCallback(
    (scout: string) => {
      updateState((prev) => ({
        ...prev,
        settings: { ...prev.settings, selectedScout: scout },
      }));
    },
    [updateState]
  );

  const setUserEmail = useCallback(
    (email: string) => {
      updateState((prev) => {
        const next = {
          ...prev,
          settings: { ...prev.settings, userEmail: email.trim(), remoteSyncEnabled: !!email.trim() },
        };
        return next;
      });
      if (email.trim()) {
        fetchRemoteData(email.trim());
      }
    },
    [updateState, fetchRemoteData]
  );

  // --- Export & Import ---
  const exportJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dashboard_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [state]);

  const importJSON = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        updateState((prev) => ({
          ...prev,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : prev.tasks,
          templates: Array.isArray(parsed.templates) ? parsed.templates : prev.templates,
          settings: { ...prev.settings, ...(parsed.settings || {}) },
          scratchpad: parsed.scratchpad !== undefined ? parsed.scratchpad : prev.scratchpad,
        }));
        return true;
      } catch (err) {
        console.error("Import failed:", err);
        return false;
      }
    },
    [updateState]
  );

  return {
    state,
    isInitialized,
    isSyncing,
    syncStatus,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    resetTemplates,
    updateScratchpad,
    addHistory,
    setTheme,
    setUseFirstNameOnly,
    setActiveTab,
    setSidebarCollapsed,
    setSelectedScout,
    setUserEmail,
    exportJSON,
    importJSON,
  };
}
