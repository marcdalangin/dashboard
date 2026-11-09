"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Template } from "@/lib/types";

interface VariableModalProps {
  template: Template | null;
  isOpen: boolean;
  selectedScoutName: string;
  onClose: () => void;
  onCopy: (formattedText: string, templateTitle: string) => void;
}

export function VariableModal({
  template,
  isOpen,
  selectedScoutName,
  onClose,
  onCopy,
}: VariableModalProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!template) return;
    const matches = template.body.match(/\[(.*?)\]/g) || [];
    const initial: Record<string, string> = {};

    matches.forEach((raw) => {
      const clean = raw.slice(1, -1).trim();
      if (clean.toLowerCase().includes("scout")) {
        initial[clean] = selectedScoutName;
      } else {
        initial[clean] = "";
      }
    });

    setVariableValues(initial);
  }, [template, selectedScoutName]);

  const handleInputChange = (variableName: string, val: string) => {
    setVariableValues((prev) => ({ ...prev, [variableName]: val }));
  };

  // Compute live rendered preview (hide and leave [Match ID] untouched for this scope)
  let previewText = template?.body || "";
  if (template) {
    Object.entries(variableValues).forEach(([key, val]) => {
      if (key.toLowerCase().includes("match id") || key.toLowerCase().includes("match_id")) {
        // [Match ID] is excluded from scope, leave placeholder untouched
        return;
      }
      const replacement = val.trim() ? val : `[${key}]`;
      previewText = previewText.split(`[${key}]`).join(replacement);
    });
  }

  const handleCopy = useCallback(() => {
    if (!template) return;
    onCopy(previewText, template.title);
    onClose();
  }, [template, previewText, onCopy, onClose]);

  // Keyboard shortcut: Ctrl + Spacebar to copy and close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.code === "Space" || e.key === " ")) {
        e.preventDefault();
        handleCopy();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleCopy]);

  if (!isOpen || !template) return null;

  // Filter out [Match ID] from the interactive variable inputs
  const allVariableKeys = Object.keys(variableValues);
  const visibleKeys = allVariableKeys.filter(
    (key) => !key.toLowerCase().includes("match id") && !key.toLowerCase().includes("match_id")
  );

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />

      <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[540px] z-50 bg-card border border-line rounded-xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💬</span>
            <span className="text-xs font-semibold text-foreground truncate max-w-[280px]">
              {template.title}
            </span>
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {/* Variable Inputs */}
        {visibleKeys.length > 0 ? (
          <div className="space-y-3">
            <span className="text-xs font-medium text-muted-foreground block">
              Fill in message variables:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleKeys.map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] font-mono text-muted-foreground block">
                    [{key}]
                  </label>
                  <input
                    type="text"
                    value={variableValues[key] || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={`Enter ${key}...`}
                    className="w-full text-xs px-2.5 py-2 rounded border border-line bg-transparent text-foreground focus:outline-none focus:border-neutral-500"
                    autoFocus={key.toLowerCase().includes("scout")}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">This template uses active scout auto-fill.</p>
        )}

        {/* Live Preview */}
        <div className="space-y-1.5 pt-2 border-t border-line">
          <span className="text-xs font-semibold text-foreground block">Live Message Preview:</span>
          <div className="p-3 rounded-lg border border-line bg-muted/40 text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {previewText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-2 rounded hover:bg-hover text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-4 py-2 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90 flex items-center gap-1.5"
            title="Copy to Clipboard (Ctrl + Space)"
          >
            <span>📋</span>
            <span>Copy to Clipboard</span>
            <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/20 dark:bg-black/20 font-mono ml-1">
              Ctrl+Space
            </kbd>
          </button>
        </div>
      </div>
    </>
  );
}
