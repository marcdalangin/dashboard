"use client";

import React from "react";
import { DashboardSettings } from "@/lib/types";

interface TopNavigationProps {
  activeTab: DashboardSettings["activeTab"];
  onSelectTab: (tab: DashboardSettings["activeTab"]) => void;
  onOpenMobileSidebar: () => void;
  onOpenNewTask: () => void;
  scoutCount: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function TopNavigation({
  activeTab,
  onSelectTab,
  onOpenMobileSidebar,
  onOpenNewTask,
  scoutCount,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
}: TopNavigationProps) {
  const getTabTitle = (tab: DashboardSettings["activeTab"]) => {
    switch (tab) {
      case "kanban-tab":
        return "Kanban Board";
      case "comment-tab":
        return "Comment Helper";
      case "scratchpad-tab":
        return "Handover Notes";
      case "scout-tab":
        return "Scouts Database";
    }
  };

  return (
    <header className="border-b border-line bg-background/95 backdrop-blur sticky top-0 z-30 px-4 md:px-6 py-2.5 flex items-center justify-between">
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-md hover:bg-hover text-foreground text-base focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            ☰
          </button>
          <span className="text-xs font-semibold tracking-tight text-foreground">
            {getTabTitle(activeTab)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "kanban-tab" && (
            <button
              onClick={onOpenNewTask}
              className="text-xs px-2.5 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
            >
              + Task
            </button>
          )}
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-xs rounded hover:bg-hover text-foreground"
            title="Toggle Dark / Light Mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Desktop Tabs Header */}
      <div className="hidden md:flex items-center justify-between w-full">
        {/* Notion Tabs */}
        <nav className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab("kanban-tab")}
            className={`text-xs font-medium pb-2.5 -mb-2.5 transition-all flex items-center gap-1.5 ${
              activeTab === "kanban-tab"
                ? "border-b-2 border-neutral-900 dark:border-white text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>📊</span> Kanban Board
          </button>

          <button
            onClick={() => onSelectTab("comment-tab")}
            className={`text-xs font-medium pb-2.5 -mb-2.5 transition-all flex items-center gap-1.5 ${
              activeTab === "comment-tab"
                ? "border-b-2 border-neutral-900 dark:border-white text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>💬</span> Comment Helper
          </button>

          <button
            onClick={() => onSelectTab("scratchpad-tab")}
            className={`text-xs font-medium pb-2.5 -mb-2.5 transition-all flex items-center gap-1.5 ${
              activeTab === "scratchpad-tab"
                ? "border-b-2 border-neutral-900 dark:border-white text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>📝</span> Handover Notes
          </button>

          <button
            onClick={() => onSelectTab("scout-tab")}
            className={`text-xs font-medium pb-2.5 -mb-2.5 transition-all flex items-center gap-1.5 ${
              activeTab === "scout-tab"
                ? "border-b-2 border-neutral-900 dark:border-white text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>👥</span> Scouts ({scoutCount.toLocaleString()})
          </button>
        </nav>

        {/* Global Search & New Task Action */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter tasks (Ctrl+K)..."
              className="text-xs px-2.5 py-1 pl-7 rounded border border-line bg-card text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 w-48 transition-all"
            />
            <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">🔍</span>
          </div>

          {activeTab === "kanban-tab" && (
            <button
              onClick={onOpenNewTask}
              className="text-xs px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
            >
              + New Task
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
