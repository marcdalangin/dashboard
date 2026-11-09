"use client";

import React, { useState } from "react";
import { Template } from "@/lib/types";
import { searchScouts, formatScoutName } from "@/lib/scoutService";
import { VariableModal } from "./VariableModal";
import { TemplateModal } from "./TemplateModal";

interface CommentHelperProps {
  templates: Template[];
  selectedScout: string;
  useFirstNameOnly: boolean;
  onUpdateScout: (name: string) => void;
  onToggleFirstName: (val: boolean) => void;
  onAddTemplate: (tpl: { title: string; category: Template["category"]; body: string; pinned: boolean }) => void;
  onUpdateTemplate: (id: string, updates: Partial<Template>) => void;
  onDeleteTemplate: (id: string) => void;
  onCopyText: (text: string, title?: string) => void;
  selectedTemplateId?: string | null;
  onSelectTemplate?: (tpl: Template | null) => void;
  onExportJSON?: () => void;
}

export function CommentHelper({
  templates,
  selectedScout,
  useFirstNameOnly,
  onUpdateScout,
  onToggleFirstName,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onCopyText,
  selectedTemplateId,
  onSelectTemplate,
  onExportJSON,
}: CommentHelperProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [scoutQuery, setScoutQuery] = useState(selectedScout);
  const [scoutSuggestions, setScoutSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);

  // Modals state
  const [activeVariableTemplate, setActiveVariableTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const activeSelectedId = selectedTemplateId !== undefined ? selectedTemplateId : localSelectedId;

  const formattedScoutName = formatScoutName(scoutQuery, useFirstNameOnly);

  const handleScoutInput = (val: string) => {
    setScoutQuery(val);
    onUpdateScout(val);
    if (val.trim()) {
      setScoutSuggestions(searchScouts(val, 8));
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectScout = (name: string) => {
    setScoutQuery(name);
    onUpdateScout(name);
    setShowDropdown(false);
  };

  // 1. Filter by category & search term
  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = activeCategory === "all" || tpl.category === activeCategory;
    if (!matchesCategory) return false;

    if (!templateSearch.trim()) return true;
    const q = templateSearch.toLowerCase();
    return tpl.title.toLowerCase().includes(q) || tpl.body.toLowerCase().includes(q);
  });

  // 2. Sort pinned templates to the very top
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const handleTemplateClick = (tpl: Template) => {
    setLocalSelectedId(tpl.id);
    onSelectTemplate?.(tpl);

    // Check for variables other than [Scout Name] and [Match ID]
    const matches = tpl.body.match(/\[(.*?)\]/g) || [];
    const nonScoutVariables = matches.filter((raw) => {
      const clean = raw.slice(1, -1).trim().toLowerCase();
      return !clean.includes("scout") && !clean.includes("match id") && !clean.includes("match_id");
    });

    if (nonScoutVariables.length > 0) {
      setActiveVariableTemplate(tpl);
    } else {
      // Auto-fill scout name directly
      let text = tpl.body;
      matches.forEach((raw) => {
        const clean = raw.slice(1, -1).trim().toLowerCase();
        if (clean.includes("scout")) {
          text = text.split(raw).join(formattedScoutName);
        }
      });
      onCopyText(text, tpl.title);
    }
  };

  return (
    <div className="space-y-5">
      {/* Notion Top Callout */}
      <div className="hidden sm:flex items-center gap-3 p-3 rounded-lg border border-line bg-sidebar text-xs text-muted-foreground">
        <span className="text-base">💬</span>
        <div className="leading-relaxed">
          <strong className="text-foreground">Comment Templating Engine:</strong> Create and pin templates to top for quick access. Click any template or press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-line">Ctrl + Space</kbd> to copy instantly with active scout auto-fill.
        </div>
      </div>

      {/* Scout Reference & First-Name Toggle Card */}
      <div className="p-4 rounded-xl border border-line bg-card shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md relative">
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
              Active Scout Reference
            </label>
            <div className="relative">
              <input
                type="text"
                value={scoutQuery}
                onChange={(e) => handleScoutInput(e.target.value)}
                placeholder="Type scout name (e.g. Morales, Ignacio)..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-line bg-transparent text-foreground focus:outline-none focus:border-neutral-500"
              />
              {showDropdown && scoutSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-line rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-line">
                  {scoutSuggestions.map((s) => (
                    <div
                      key={s}
                      onClick={() => handleSelectScout(s)}
                      className="px-3 py-2 text-xs hover:bg-hover cursor-pointer truncate"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* First Name Toggle */}
          <div className="flex items-center gap-3 pt-2 sm:pt-4">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useFirstNameOnly}
                onChange={(e) => onToggleFirstName(e.target.checked)}
                className="rounded border-line text-neutral-900 focus:ring-0"
              />
              <span className="font-medium">Use First Name Only</span>
            </label>
            {formattedScoutName && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-tag text-muted-foreground">
                → &quot;{formattedScoutName}&quot;
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Categories & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scroll-snap-x">
          {[
            { id: "all", label: "All Templates" },
            { id: "scout-direct", label: "Direct Scout" },
            { id: "allocation", label: "Allocations" },
            { id: "status", label: "Status Review" },
            { id: "custom", label: "Custom" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                  : "bg-tag text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
            placeholder="Search templates..."
            className="text-xs px-2.5 py-1.5 rounded border border-line bg-card text-foreground focus:outline-none w-36 sm:w-44"
          />
          {onExportJSON && (
            <button
              onClick={onExportJSON}
              title="Export all data to JSON"
              className="text-xs px-2.5 py-1.5 rounded border border-line bg-card text-muted-foreground hover:text-foreground hover:bg-hover flex items-center gap-1"
            >
              <span>📥</span>
              <span className="hidden md:inline">JSON</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsTemplateModalOpen(true);
            }}
            className="text-xs px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90 whitespace-nowrap flex items-center gap-1"
          >
            <span>+</span>
            <span>Template</span>
          </button>
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedTemplates.map((tpl) => {
          const isSelected = activeSelectedId === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => handleTemplateClick(tpl)}
              className={`group p-3.5 rounded-xl border bg-card transition-all cursor-pointer flex flex-col justify-between space-y-2.5 shadow-sm relative ${
                isSelected
                  ? "border-neutral-900 dark:border-white ring-2 ring-neutral-900/10 dark:ring-white/10"
                  : tpl.pinned
                  ? "border-amber-500/40 dark:border-amber-400/40 bg-amber-500/[0.02]"
                  : "border-line hover:border-neutral-400 dark:hover:border-neutral-600"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-tag text-muted-foreground uppercase tracking-wider">
                      {tpl.category}
                    </span>
                    {tpl.pinned && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-semibold">
                        <span>📌</span>
                        <span>PINNED</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                    {/* 1-Click Pin/Unpin */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTemplate(tpl.id, { pinned: !tpl.pinned });
                      }}
                      className={`p-1 px-1.5 text-xs rounded transition-colors ${
                        tpl.pinned
                          ? "text-amber-600 dark:text-amber-400 bg-amber-500/15"
                          : "text-muted-foreground hover:text-foreground hover:bg-hover"
                      }`}
                      title={tpl.pinned ? "Unpin template" : "Pin to top"}
                      aria-label={tpl.pinned ? "Unpin template" : "Pin to top"}
                    >
                      📌
                    </button>
                    {/* Edit */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTemplate(tpl);
                        setIsTemplateModalOpen(true);
                      }}
                      className="p-1 px-1.5 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-hover transition-colors"
                      title="Edit Template"
                      aria-label="Edit Template"
                    >
                      ✏️
                    </button>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete template "${tpl.title}"?`)) {
                          onDeleteTemplate(tpl.id);
                        }
                      }}
                      className="p-1 px-1.5 text-xs text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete Template"
                      aria-label="Delete Template"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{tpl.title}</span>
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-3 font-mono leading-relaxed">
                  {tpl.body}
                </p>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-mono flex items-center gap-1 text-[10px]">
                  <span>Click to copy</span>
                  <span className="hidden sm:inline text-neutral-400 dark:text-neutral-500">· Ctrl+Space</span>
                </span>
                <span className="text-xs font-semibold text-foreground">📋</span>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {sortedTemplates.length === 0 && (
          <div className="col-span-full py-12 px-4 rounded-xl border border-dashed border-line bg-card/40 text-center space-y-3">
            <span className="text-3xl block">💬</span>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">No Comment Templates Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create custom templates with variables like <code className="text-foreground">[Scout Name]</code> and pin your most-used templates to the top.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <span>+</span>
              <span>Create First Template</span>
            </button>
          </div>
        )}
      </div>

      {/* Variable Fill Modal */}
      <VariableModal
        template={activeVariableTemplate}
        isOpen={!!activeVariableTemplate}
        selectedScoutName={formattedScoutName}
        onClose={() => setActiveVariableTemplate(null)}
        onCopy={onCopyText}
      />

      {/* Custom Template Editor Modal */}
      <TemplateModal
        template={editingTemplate}
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={(data) => {
          if (data.id) {
            onUpdateTemplate(data.id, data);
          } else {
            onAddTemplate(data);
          }
        }}
        onDelete={onDeleteTemplate}
      />
    </div>
  );
}
