"use client";

import React from "react";
import { DashboardSettings } from "@/lib/types";

interface SidebarProps {
  activeTab: DashboardSettings["activeTab"];
  onSelectTab: (tab: DashboardSettings["activeTab"]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
  taskCount: number;
  scoutCount: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  syncStatus: "synced" | "saving" | "offline" | "unconfigured";
  userEmail?: string;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenSettings,
  taskCount,
  scoutCount,
  theme,
  onToggleTheme,
  syncStatus,
  userEmail,
}: SidebarProps) {
  const handleNavClick = (tab: DashboardSettings["activeTab"]) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const formattedScoutCount = scoutCount >= 1000 ? (scoutCount / 1000).toFixed(1) + "k" : scoutCount.toString();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        {/* Workspace Brand / Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
              W
            </div>
            {!isCollapsed && (
              <span className="text-xs font-semibold tracking-tight truncate text-foreground">
                Personal Workspace
              </span>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1 rounded hover:bg-hover text-muted-foreground hover:text-foreground text-xs"
            title="Toggle Sidebar (Ctrl+\)"
          >
            {isCollapsed ? "›" : "‹"}
          </button>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded hover:bg-hover text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        </div>

        {/* Views Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-2">
              Views
            </span>
          )}
          <button
            onClick={() => handleNavClick("kanban-tab")}
            className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "kanban-tab"
                ? "bg-hover text-foreground font-semibold"
                : "text-muted-foreground hover:bg-hover hover:text-foreground"
            }`}
            title="Kanban Board"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">📊</span>
              {!isCollapsed && <span>Kanban Board</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                {taskCount.toString().padStart(2, "0")}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick("comment-tab")}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "comment-tab"
                ? "bg-hover text-foreground font-semibold"
                : "text-muted-foreground hover:bg-hover hover:text-foreground"
            }`}
            title="Comment Helper"
          >
            <span className="text-sm">💬</span>
            {!isCollapsed && <span>Comment Helper</span>}
          </button>

          <button
            onClick={() => handleNavClick("scratchpad-tab")}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "scratchpad-tab"
                ? "bg-hover text-foreground font-semibold"
                : "text-muted-foreground hover:bg-hover hover:text-foreground"
            }`}
            title="Handover Notes"
          >
            <span className="text-sm">📝</span>
            {!isCollapsed && <span>Handover Notes</span>}
          </button>
        </div>

        {/* Database Section */}
        <div className="space-y-1 pt-1">
          {!isCollapsed && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-2">
              Database
            </span>
          )}
          <button
            onClick={() => handleNavClick("scout-tab")}
            className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "scout-tab"
                ? "bg-hover text-foreground font-semibold"
                : "text-muted-foreground hover:bg-hover hover:text-foreground"
            }`}
            title="Scouts Directory"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">👥</span>
              {!isCollapsed && <span>Scouts Directory</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {formattedScoutCount}
              </span>
            )}
          </button>
        </div>

        {/* Workspace Tools */}
        <div className="space-y-1 pt-1">
          {!isCollapsed && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-2">
              Workspace
            </span>
          )}
          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-hover hover:text-foreground transition-colors"
            title="Settings & Backup"
          >
            <span className="text-sm">⚙️</span>
            {!isCollapsed && <span>Settings & Backup</span>}
          </button>
        </div>
      </div>

      {/* Footer: Theme & Sync Status */}
      <div className="pt-3 border-t border-line space-y-2">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-hover text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle Dark / Light Mode (Ctrl+D)"
        >
          {!isCollapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          <span className="text-sm">{theme === "dark" ? "☀️" : "🌙"}</span>
        </button>

        {!isCollapsed && (
          <div
            onClick={onOpenSettings}
            className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/60 text-[11px] font-mono text-muted-foreground cursor-pointer hover:bg-muted"
            title="Remote Cloud Status (Click to configure)"
          >
            <span className="truncate max-w-[130px]">{userEmail || "Local Mode"}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === "synced"
                  ? "bg-emerald-500"
                  : syncStatus === "saving"
                  ? "bg-amber-500 animate-pulse"
                  : syncStatus === "unconfigured"
                  ? "bg-blue-400"
                  : "bg-neutral-400"
              }`}
              title={`Status: ${syncStatus}`}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-sidebar border-r border-line md:hidden transition-transform duration-200 ease-in-out ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block h-screen bg-sidebar border-r border-line flex-shrink-0 transition-all duration-200 sticky top-0 ${
          isCollapsed ? "w-16" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
