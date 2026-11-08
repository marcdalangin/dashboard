"use client";

import React, { useState } from "react";
import { Task, ColumnId } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  id: ColumnId;
  title: string;
  dotColor: string;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onAddTask: (columnId: ColumnId) => void;
  onMoveTask: (taskId: string, targetCol: ColumnId) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({
  id,
  title,
  dotColor,
  tasks,
  onOpenTask,
  onAddTask,
  onMoveTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-sidebar border rounded-lg p-2.5 transition-all flex-shrink-0 w-72 md:w-auto ${
        isDragOver ? "border-neutral-500 bg-hover" : "border-line"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 px-1 border-b border-line mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            {title}
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {tasks.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-1 space-y-2 min-h-[140px] overflow-y-auto max-h-[calc(100vh-230px)] pr-0.5">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onClick={() => onOpenTask(task)}
            onMoveColumn={(newCol) => onMoveTask(task.id, newCol)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border border-dashed border-line rounded text-[11px] text-muted-foreground">
            Drop cards here
          </div>
        )}
      </div>

      {/* Add Card Button */}
      <button
        onClick={() => onAddTask(id)}
        className="w-full mt-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-hover rounded transition-colors text-left px-2 flex items-center gap-1.5"
      >
        <span>+</span>
        <span>New</span>
      </button>
    </div>
  );
}
