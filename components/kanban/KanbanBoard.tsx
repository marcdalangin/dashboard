"use client";

import React, { useState } from "react";
import { Task, ColumnId, Priority, ChecklistItem } from "@/lib/types";
import { DEFAULT_COLUMNS } from "@/lib/defaultData";
import { KanbanColumn } from "./KanbanColumn";
import { SidePeekDrawer } from "./SidePeekDrawer";

interface KanbanBoardProps {
  tasks: Task[];
  searchQuery: string;
  onAddTask: (task: {
    title: string;
    description?: string;
    columnId?: ColumnId;
    priority?: Priority;
    scout?: string;
    tags?: string[];
    checklist?: ChecklistItem[];
  }) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onMoveTask: (id: string, targetCol: ColumnId) => void;
  onDeleteTask: (id: string) => void;
  onClearColumn?: (colId: ColumnId) => void;
  onClearDone?: () => void;
  isDrawerOpen: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
}

export function KanbanBoard({
  tasks,
  searchQuery,
  onAddTask,
  onUpdateTask,
  onMoveTask,
  onDeleteTask,
  onClearColumn,
  onClearDone,
  isDrawerOpen,
  onOpenDrawer,
  onCloseDrawer,
}: KanbanBoardProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [selectedColumnForNew, setSelectedColumnForNew] = useState<ColumnId>("backlogs");

  // Mobile column switcher state
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState<ColumnId>("in-progress");

  // Filter tasks by search query & priority
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    if (!matchesPriority) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.scout.toLowerCase().includes(q) ||
      task.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleOpenTask = (task: Task) => {
    setActiveTaskDetail(task);
    onOpenDrawer();
  };

  const handleAddNewTaskInCol = (colId: ColumnId) => {
    setActiveTaskDetail(null);
    setSelectedColumnForNew(colId);
    onOpenDrawer();
  };

  const handleSaveDrawer = (taskData: {
    id?: string;
    title: string;
    description: string;
    columnId: ColumnId;
    priority: Priority;
    scout: string;
    tags: string[];
    checklist: ChecklistItem[];
  }) => {
    if (taskData.id) {
      onUpdateTask(taskData.id, taskData);
    } else {
      onAddTask(taskData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Notion Info Callout (Desktop only) */}
      <div className="hidden sm:flex items-center gap-3 p-3 rounded-lg border border-line bg-sidebar text-xs text-muted-foreground">
        <span className="text-base">💡</span>
        <div className="leading-relaxed">
          <strong className="text-foreground">Notion Kanban View:</strong> Categorize shift tasks across 5 stages:{" "}
          <strong>Backlogs</strong>, <strong>To-do</strong>, <strong>In Progress</strong>,{" "}
          <strong>Blocked</strong>, and <strong>Done</strong>. Drag & drop or click cards to inspect full details.
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Mobile Column Segmented Tabs */}
        <div className="flex md:hidden items-center overflow-x-auto gap-1 border border-line p-1 rounded-lg bg-sidebar text-xs scroll-snap-x">
          {DEFAULT_COLUMNS.map((col) => {
            const count = filteredTasks.filter((t) => t.columnId === col.id).length;
            const isSelected = mobileSelectedColumn === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setMobileSelectedColumn(col.id)}
                className={`px-2.5 py-1.5 rounded-md font-medium text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? "bg-card text-foreground shadow-sm font-semibold border border-line"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <span>{col.title}</span>
                <span className="text-[10px] font-mono text-muted-foreground">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Priority Filter & Batch Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {filteredTasks.some((t) => t.columnId === "done") && onClearDone && (
            <button
              type="button"
              onClick={() => {
                const count = filteredTasks.filter((t) => t.columnId === "done").length;
                if (confirm(`Clear all ${count} completed task(s) from Done?`)) {
                  onClearDone();
                }
              }}
              className="text-xs px-2.5 py-1.5 rounded border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-medium transition-colors flex items-center gap-1"
              title="Clear all tasks in the Done column"
            >
              <span>🗑️</span>
              <span>Clear Done ({filteredTasks.filter((t) => t.columnId === "done").length})</span>
            </button>
          )}

          <label className="text-xs text-muted-foreground hidden sm:inline">Priority:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded border border-line bg-card text-foreground focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Mobile View: Single Column Focused view based on Segmented Switcher */}
      <div className="block md:hidden">
        {DEFAULT_COLUMNS.filter((col) => col.id === mobileSelectedColumn).map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            dotColor={col.dotColor}
            tasks={filteredTasks.filter((t) => t.columnId === col.id)}
            onOpenTask={handleOpenTask}
            onAddTask={handleAddNewTaskInCol}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onClearColumn={onClearColumn}
          />
        ))}
      </div>

      {/* Desktop 5-Column Grid */}
      <div className="hidden md:grid grid-cols-5 gap-3 items-start">
        {DEFAULT_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            dotColor={col.dotColor}
            tasks={filteredTasks.filter((t) => t.columnId === col.id)}
            onOpenTask={handleOpenTask}
            onAddTask={handleAddNewTaskInCol}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onClearColumn={onClearColumn}
          />
        ))}
      </div>

      {/* Side-Peek Property Drawer */}
      <SidePeekDrawer
        task={activeTaskDetail}
        isOpen={isDrawerOpen}
        defaultColumnId={selectedColumnForNew}
        onClose={onCloseDrawer}
        onSave={handleSaveDrawer}
        onDelete={onDeleteTask}
      />
    </div>
  );
}
