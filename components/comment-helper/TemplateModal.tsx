"use client";

import React, { useState, useEffect } from "react";
import { Template } from "@/lib/types";

interface TemplateModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: {
    id?: string;
    title: string;
    category: Template["category"];
    body: string;
    pinned: boolean;
  }) => void;
  onDelete?: (id: string) => void;
}

export function TemplateModal({ template, isOpen, onClose, onSave, onDelete }: TemplateModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Template["category"]>("scout-direct");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setCategory(template.category);
      setBody(template.body);
      setPinned(template.pinned || false);
    } else {
      setTitle("");
      setCategory("scout-direct");
      setBody("");
      setPinned(false);
    }
  }, [template]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    onSave({
      id: template?.id,
      title: title.trim(),
      category,
      body: body.trim(),
      pinned,
    });
    onClose();
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />

      <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] z-50 bg-card border border-line rounded-xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-xs font-semibold text-foreground">
            {template ? "Edit Template" : "New Comment Template"}
          </span>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-mono text-muted-foreground block mb-1">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Allocation Notification..."
              className="w-full text-xs px-2.5 py-2 rounded border border-line bg-transparent text-foreground focus:outline-none focus:border-neutral-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Template["category"])}
                className="w-full text-xs px-2.5 py-2 rounded border border-line bg-card text-foreground focus:outline-none"
              >
                <option value="scout-direct">Direct Scout</option>
                <option value="allocation">Allocation</option>
                <option value="status">Status Review</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded border-line text-neutral-900 focus:ring-0"
                />
                <span className="flex items-center gap-1 font-medium">
                  <span>📌</span>
                  <span>Pin to top</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-muted-foreground block mb-1">
              Message Body (use <code className="text-foreground">[Scout Name]</code> for variables):
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Hi [Scout Name], please review the upcoming shift schedule..."
              className="w-full text-xs p-3 rounded border border-line bg-transparent text-foreground focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-line">
          {template && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete template "${template.title}"?`)) {
                  onDelete(template.id);
                  onClose();
                }
              }}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1"
            >
              <span>🗑️</span>
              <span>Delete Template</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded hover:bg-hover text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-xs px-3.5 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
