"use client";

import React, { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSaveEmail: (email: string) => void;
  syncStatus: "synced" | "saving" | "offline" | "unconfigured";
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => boolean;
  onResetDefaults: () => void;
  onClearAllTasks?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  userEmail,
  onSaveEmail,
  syncStatus,
  onExportJSON,
  onImportJSON,
  onResetDefaults,
  onClearAllTasks,
}: SettingsModalProps) {
  const [emailInput, setEmailInput] = useState(userEmail);
  const [statusMsg, setStatusMsg] = useState("");

  if (!isOpen) return null;

  const handleSaveEmail = () => {
    onSaveEmail(emailInput.trim());
    setStatusMsg("Email saved. Syncing data...");
    setTimeout(() => setStatusMsg(""), 2500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = onImportJSON(text);
      if (success) {
        alert("Backup imported successfully!");
        onClose();
      } else {
        alert("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />

      <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] z-50 bg-card border border-line rounded-xl shadow-2xl p-5 space-y-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⚙️</span>
            <span className="text-xs font-semibold text-foreground">Settings & Cloud Synchronization</span>
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {/* Remote Sync (SMP Email) */}
        <div className="space-y-2 p-3 rounded-lg border border-line bg-sidebar">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Storage & Neon Sync</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                syncStatus === "synced"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                  : syncStatus === "saving"
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-muted text-muted-foreground font-semibold"
              }`}
            >
              {syncStatus === "synced" ? "CLOUD SYNCED" : syncStatus === "saving" ? "SAVING..." : "LOCAL WORKSTATION MODE"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {syncStatus === "synced"
              ? "All your tasks, templates, and notes are synced to your Neon serverless database."
              : "All tasks, templates, and notes are safely saved directly in your browser's persistent local storage. They will not be reset on refresh."}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. operator@sportradar.com"
              className="flex-1 text-xs px-2.5 py-1.5 rounded border border-line bg-card text-foreground focus:outline-none focus:border-neutral-500 font-mono"
            />
            <button
              onClick={handleSaveEmail}
              className="text-xs px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90"
            >
              Save Email
            </button>
          </div>
          {statusMsg && <p className="text-[11px] text-emerald-600 font-mono">{statusMsg}</p>}
          <p className="text-[10px] text-muted-foreground/80 font-mono pt-1">
            * To activate Neon Cloud sync on your workstation, configure DATABASE_URL in .env.local (see .env.local.example).
          </p>
        </div>

        {/* Backup & Portability */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-foreground block">Data Backup & Restore</span>
          <p className="text-[11px] text-muted-foreground">
            Export a complete JSON backup of all your local tasks, templates, and notes, or import a previously saved backup file.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={onExportJSON}
              className="text-xs px-3 py-1.5 rounded border border-line bg-card text-foreground hover:bg-hover flex items-center gap-1.5 font-medium"
            >
              <span>📥</span>
              <span>Export JSON Backup</span>
            </button>

            <label className="text-xs px-3 py-1.5 rounded border border-line bg-card text-foreground hover:bg-hover flex items-center gap-1.5 font-medium cursor-pointer">
              <span>📤</span>
              <span>Import JSON Backup</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Clear Templates */}
        <div className="space-y-2 pt-2 border-t border-line">
          <span className="text-xs font-semibold text-foreground block">Clear All Templates</span>
          <p className="text-[11px] text-muted-foreground">
            Remove all templates to start fresh with a clean templates list.
          </p>
          <button
            onClick={() => {
              if (confirm("Clear all comment templates?")) {
                onResetDefaults();
                alert("All templates cleared.");
              }
            }}
            className="text-xs px-3 py-1.5 rounded border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-medium flex items-center gap-1.5"
          >
            <span>🗑️</span>
            <span>Clear All Templates</span>
          </button>
        </div>

        {/* Clear All Kanban Tasks */}
        <div className="space-y-2 pt-2 border-t border-line">
          <span className="text-xs font-semibold text-foreground block">Kanban Tasks Management</span>
          <p className="text-[11px] text-muted-foreground">
            Clear all tasks across all columns to reset the board.
          </p>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear ALL tasks from the Kanban board?")) {
                onClearAllTasks?.();
                alert("All Kanban tasks cleared.");
              }
            }}
            className="text-xs px-3 py-1.5 rounded border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-medium flex items-center gap-1.5"
          >
            <span>🗑️</span>
            <span>Clear All Kanban Tasks</span>
          </button>
        </div>
      </div>
    </>
  );
}
