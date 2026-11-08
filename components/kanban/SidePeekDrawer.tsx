"use client";

import React, { useState, useEffect } from "react";
import { Task, ColumnId, Priority, ChecklistItem } from "@/lib/types";
import { searchScouts } from "@/lib/scoutService";

interface SidePeekDrawerProps {
  task: Task | null;
  isOpen: boolean;
  defaultColumnId?: ColumnId;
  onClose: () => void;
  onSave: (taskData: {
    id?: string;
    title: string;
    description: string;
    columnId: ColumnId;
    priority: Priority;
    scout: string;
    tags: string[];
    checklist: ChecklistItem[];
  }) => void;
  onDelete?: (taskId: string) => void;
}

export function SidePeekDrawer({
  task,
  isOpen,
  defaultColumnId = "backlogs",
  onClose,
  onSave,
  onDelete,
}: SidePeekDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState<ColumnId>(defaultColumnId);
  const [priority, setPriority] = useState<Priority>("Medium");
  const [scout, setScout] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");

  // Scout autocomplete state
  const [scoutSuggestions, setScoutSuggestions] = useState<string[]>([]);
  const [showScoutDropdown, setShowScoutDropdown] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setColumnId(task.columnId);
      setPriority(task.priority);
      setScout(task.scout);
      setTagsInput(task.tags.join(", "));
      setChecklist(task.checklist || []);
    } else {
      setTitle("");
      setDescription("");
      setColumnId(defaultColumnId);
      setPriority("Medium");
      setScout("");
      setTagsInput("");
      setChecklist([]);
    }
  }, [task, defaultColumnId]);

  if (!isOpen) return null;

  const handleScoutChange = (val: string) => {
    setScout(val);
    if (val.trim().length > 0) {
      const results = searchScouts(val, 8);
      setScoutSuggestions(results);
      setShowScoutDropdown(true);
    } else {
      setShowScoutDropdown(false);
    }
  };

  const handleSelectScout = (name: string) => {
    setScout(name);
    setShowScoutDropdown(false);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: "c-" + Date.now(), text: newChecklistText.trim(), done: false },
    ]);
    setNewChecklistText("");
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      columnId,
      priority,
      scout: scout.trim(),
      tags: parsedTags,
      checklist,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
      />

      {/* Drawer: Full-screen on mobile, 384px slide-in on desktop */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-card border-l border-line shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 border-b border-line bg-sidebar flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              {task ? "Edit Task" : "New Task"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {task && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="text-xs px-2.5 py-1.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Task"
              >
                🗑️ Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="text-xs px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-black font-medium hover:opacity-90"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-xs text-muted-foreground hover:text-foreground rounded"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Task..."
              className="w-full text-base font-semibold bg-transparent border-b border-line pb-2 focus:outline-none focus:border-neutral-500 text-foreground"
              autoFocus
            />
          </div>

          {/* Properties Table */}
          <div className="border border-line rounded-lg divide-y divide-line text-xs">
            {/* Status */}
            <div className="grid grid-cols-3 p-2.5 items-center">
              <span className="text-muted-foreground">Status</span>
              <div className="col-span-2">
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value as ColumnId)}
                  className="w-full bg-transparent border border-line rounded px-2 py-1 text-foreground focus:outline-none"
                >
                  <option value="backlogs">Backlogs</option>
                  <option value="todo">To-do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div className="grid grid-cols-3 p-2.5 items-center">
              <span className="text-muted-foreground">Priority</span>
              <div className="col-span-2">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-transparent border border-line rounded px-2 py-1 text-foreground focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Scout Assignment with Autocomplete */}
            <div className="grid grid-cols-3 p-2.5 items-center relative">
              <span className="text-muted-foreground">Scout</span>
              <div className="col-span-2 relative">
                <input
                  type="text"
                  value={scout}
                  onChange={(e) => handleScoutChange(e.target.value)}
                  placeholder="Assign scout name..."
                  className="w-full bg-transparent border border-line rounded px-2 py-1 text-foreground focus:outline-none"
                />
                {showScoutDropdown && scoutSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-line rounded-md shadow-lg z-50 max-h-44 overflow-y-auto divide-y divide-line">
                    {scoutSuggestions.map((s) => (
                      <div
                        key={s}
                        onClick={() => handleSelectScout(s)}
                        className="px-2.5 py-1.5 text-xs hover:bg-hover cursor-pointer truncate"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="grid grid-cols-3 p-2.5 items-center">
              <span className="text-muted-foreground">Tags</span>
              <div className="col-span-2">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Monitoring, Allocation (comma separated)"
                  className="w-full bg-transparent border border-line rounded px-2 py-1 text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground block">
              Subtasks / Checklist ({checklist.filter((c) => c.done).length}/{checklist.length})
            </span>

            <div className="space-y-1.5">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 px-1 group">
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="rounded border-line text-neutral-900 focus:ring-0"
                    />
                    <span className={`truncate ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="text-xs text-muted-foreground hover:text-rose-500 opacity-60 group-hover:opacity-100 px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChecklistItem()}
                placeholder="Add new subtask..."
                className="flex-1 text-xs px-2.5 py-1.5 rounded border border-line bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="text-xs px-2.5 py-1.5 rounded bg-muted hover:bg-hover text-foreground font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground block">Notes & Description:</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Add detailed match logs, incident notes, referee reports, or instructions here..."
              className="w-full text-xs p-3 rounded-lg border border-line bg-transparent text-foreground focus:outline-none focus:border-neutral-500 font-mono leading-relaxed"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
