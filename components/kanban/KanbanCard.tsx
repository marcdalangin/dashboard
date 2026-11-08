"use client";

import React from "react";
import { Task, ColumnId } from "@/lib/types";

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  onMoveColumn: (newCol: ColumnId) => void;
  onDelete: () => void;
}

const COLUMN_ORDER: ColumnId[] = ["backlogs", "todo", "in-progress", "blocked", "done"];

export function KanbanCard({ task, onClick, onMoveColumn, onDelete }: KanbanCardProps) {
  const currentColIndex = COLUMN_ORDER.indexOf(task.columnId);
  const prevCol = currentColIndex > 0 ? COLUMN_ORDER[currentColIndex - 1] : null;
  const nextCol = currentColIndex < COLUMN_ORDER.length - 1 ? COLUMN_ORDER[currentColIndex + 1] : null;

  const completedChecklistCount = task.checklist.filter((item) => item.done).length;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`group bg-card border rounded p-3 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer space-y-2 select-none ${
        task.columnId === "blocked" ? "border-rose-500/40 bg-rose-500/5" : "border-line"
      }`}
    >
      {/* Priority & Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {task.priority === "High" && (
            <span className="text-[10px] font-mono px-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
              HIGH
            </span>
          )}
          {task.priority === "Medium" && (
            <span className="text-[10px] font-mono px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
              MED
            </span>
          )}
          {task.priority === "Low" && (
            <span className="text-[10px] font-mono px-1 rounded bg-muted text-muted-foreground">
              LOW
            </span>
          )}
        </div>

        {/* Micro-actions */}
        <div
          className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {prevCol && (
            <button
              onClick={() => onMoveColumn(prevCol)}
              className="p-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-hover"
              title="Move backward"
            >
              ←
            </button>
          )}
          {nextCol && (
            <button
              onClick={() => onMoveColumn(nextCol)}
              className="p-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-hover"
              title="Move forward"
            >
              →
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-xs text-muted-foreground hover:text-rose-500 rounded hover:bg-hover ml-1"
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Title */}
      <h4
        className={`text-xs font-medium leading-snug ${
          task.columnId === "done" ? "line-through text-muted-foreground" : "text-foreground"
        }`}
      >
        {task.title}
      </h4>

      {/* Scout Assignment */}
      {task.scout && (
        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
          <span>@</span>
          <span className="truncate">{task.scout}</span>
        </div>
      )}

      {/* Tags & Checklist Status */}
      <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-line">
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded bg-tag text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {task.checklist.length > 0 && (
          <span className="text-muted-foreground">
            {completedChecklistCount}/{task.checklist.length} sub
          </span>
        )}
      </div>
    </div>
  );
}
