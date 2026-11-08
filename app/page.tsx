"use client";

import React, { useState, useEffect } from "react";
import { useDashboardStore } from "@/lib/hooks/useDashboardStore";
import { useHotkeys } from "@/lib/hooks/useHotkeys";
import { initScoutService, getScoutCount } from "@/lib/scoutService";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Toast } from "@/components/layout/Toast";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CommentHelper } from "@/components/comment-helper/CommentHelper";
import { HandoverNotes } from "@/components/scratchpad/HandoverNotes";
import { ScoutsDirectory } from "@/components/scouts/ScoutsDirectory";
import { SettingsModal } from "@/components/settings/SettingsModal";

export default function DashboardPage() {
  const {
    state,
    isInitialized,
    syncStatus,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    clearColumnTasks,
    clearAllTasks,
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
  } = useDashboardStore();

  const [scoutTotal, setScoutTotal] = useState(30477);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Initialize scouts
  useEffect(() => {
    initScoutService().then((scouts) => {
      setScoutTotal(scouts.length);
    });
  }, []);

  // Sync dark mode class and colorScheme on <html>
  useEffect(() => {
    if (!isInitialized) return;
    if (state.settings.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
    }
  }, [state.settings.theme, isInitialized]);

  // Toast trigger
  const showToast = (message = "✓ Copied to clipboard!") => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2200);
  };

  // Clipboard handler
  const handleCopyText = async (text: string, title?: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      addHistory(text, title || "");
      showToast(title ? `✓ Copied: ${title}` : "✓ Copied to clipboard!");
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      showToast("Clipboard copy failed. Check permissions.");
    }
  };

  // Global hotkeys
  useHotkeys({
    onToggleSidebar: () => setSidebarCollapsed(!state.settings.sidebarCollapsed),
    onToggleTheme: () => setTheme(state.settings.theme === "dark" ? "light" : "dark"),
    onEscape: () => {
      setIsTaskDrawerOpen(false);
      setIsSettingsOpen(false);
      setIsMobileSidebarOpen(false);
    },
    onSearchFocus: () => {
      const el = document.getElementById("global-search-input");
      if (el) el.focus();
    },
  });

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-x-hidden">
      {/* Sidebar (Desktop Collapsible + Mobile Slide-out Drawer) */}
      <Sidebar
        activeTab={state.settings.activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={state.settings.sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!state.settings.sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        taskCount={state.tasks.length}
        scoutCount={scoutTotal}
        theme={state.settings.theme}
        onToggleTheme={() => setTheme(state.settings.theme === "dark" ? "light" : "dark")}
        syncStatus={syncStatus}
        userEmail={state.settings.userEmail}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header & Navigation */}
        <TopNavigation
          activeTab={state.settings.activeTab}
          onSelectTab={setActiveTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNewTask={() => setIsTaskDrawerOpen(true)}
          scoutCount={scoutTotal}
          theme={state.settings.theme}
          onToggleTheme={() => setTheme(state.settings.theme === "dark" ? "light" : "dark")}
          searchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {state.settings.activeTab === "kanban-tab" && (
            <KanbanBoard
              tasks={state.tasks}
              searchQuery={globalSearchQuery}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onMoveTask={moveTask}
              onDeleteTask={deleteTask}
              onClearColumn={clearColumnTasks}
              onClearDone={() => clearColumnTasks("done")}
              isDrawerOpen={isTaskDrawerOpen}
              onOpenDrawer={() => setIsTaskDrawerOpen(true)}
              onCloseDrawer={() => setIsTaskDrawerOpen(false)}
            />
          )}

          {state.settings.activeTab === "comment-tab" && (
            <CommentHelper
              templates={state.templates}
              selectedScout={state.settings.selectedScout}
              useFirstNameOnly={state.settings.useFirstNameOnly}
              onUpdateScout={setSelectedScout}
              onToggleFirstName={setUseFirstNameOnly}
              onAddTemplate={addTemplate}
              onUpdateTemplate={updateTemplate}
              onDeleteTemplate={deleteTemplate}
              onCopyText={handleCopyText}
            />
          )}

          {state.settings.activeTab === "scratchpad-tab" && (
            <HandoverNotes
              initialValue={state.scratchpad}
              onSave={updateScratchpad}
              syncStatus={syncStatus}
              onCopyText={handleCopyText}
            />
          )}

          {state.settings.activeTab === "scout-tab" && (
            <ScoutsDirectory onCopyText={handleCopyText} />
          )}
        </main>
      </div>

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userEmail={state.settings.userEmail || ""}
        onSaveEmail={setUserEmail}
        syncStatus={syncStatus}
        onExportJSON={exportJSON}
        onImportJSON={importJSON}
        onResetDefaults={resetTemplates}
        onClearAllTasks={clearAllTasks}
      />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </div>
  );
}
