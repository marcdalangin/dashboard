"use client";

import React, { useState, useEffect } from "react";

interface HandoverNotesProps {
  initialValue: string;
  onSave: (text: string) => void;
  syncStatus: "synced" | "saving" | "offline" | "unconfigured";
  onCopyText: (text: string, title?: string) => void;
}

export function HandoverNotes({
  initialValue,
  onSave,
  syncStatus,
  onCopyText,
}: HandoverNotesProps) {
  const [content, setContent] = useState(initialValue);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleChange = (val: string) => {
    setContent(val);
    onSave(val);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split(/\r?\n/).length : 0;

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="p-4 rounded-xl border border-line bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>📝</span> Shift Handover Notes & Scratchpad
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-saves continuously. Synced across all your workstations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === "synced"
                  ? "bg-emerald-500"
                  : syncStatus === "saving"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-blue-400"
              }`}
            />
            <span>
              {syncStatus === "synced"
                ? "Neon Synced"
                : syncStatus === "saving"
                ? "Saving..."
                : "Saved locally"}
            </span>
          </div>

          <button
            onClick={() => onCopyText(content, "Handover Notes")}
            className="text-xs px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90 flex items-center gap-1.5"
          >
            <span>📋</span> Copy All
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="rounded-xl border border-line bg-card shadow-sm overflow-hidden flex flex-col">
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          rows={16}
          placeholder="Shift handover notes:
- Review coverage applications
- Confirm court 2 device status
- Handover to APAC shift lead at 21:00..."
          className="w-full p-4 text-xs font-mono bg-transparent text-foreground focus:outline-none resize-y leading-relaxed"
        />

        {/* Footer Metadata */}
        <div className="px-4 py-2 border-t border-line bg-sidebar flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-4 tabular-nums">
            <span>{lineCount} lines</span>
            <span>{wordCount} words</span>
            <span>{content.length} characters</span>
          </div>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear your scratchpad notes?")) {
                handleChange("");
              }
            }}
            className="text-rose-500 hover:underline"
          >
            Clear Notes
          </button>
        </div>
      </div>
    </div>
  );
}
