"use client";

import React, { useState, useEffect, useRef } from "react";
import { Template, TemplateCategory, CategoryColor } from "@/lib/types";
import { getCategoryColorDef } from "@/lib/categoryStyles";

interface TemplateModalProps {
  template: Template | null;
  isOpen: boolean;
  categories: TemplateCategory[];
  onClose: () => void;
  onSave: (templateData: {
    id?: string;
    title: string;
    category: string;
    body: string;
    pinned: boolean;
  }) => void;
  onDelete?: (id: string) => void;
  onAddCategory: (name: string, color?: CategoryColor) => TemplateCategory;
}

export function TemplateModal({
  template,
  isOpen,
  categories,
  onClose,
  onSave,
  onDelete,
  onAddCategory,
}: TemplateModalProps) {
  const [title, setTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("scout-direct");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  // Category combobox state
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setSelectedCategoryId(template.category || categories[0]?.id || "custom");
      setBody(template.body);
      setPinned(template.pinned || false);
    } else {
      setTitle("");
      setSelectedCategoryId(categories[0]?.id || "scout-direct");
      setBody("");
      setPinned(false);
    }
    setCategorySearchQuery("");
    setIsCategoryDropdownOpen(false);
  }, [template, categories, isOpen]);

  // Click outside listener for combobox dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCategoryDropdownOpen]);

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const currentColorDef = getCategoryColorDef(currentCategory?.color);

  // Filtered categories in combobox
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const exactMatchExists = categories.some(
    (c) => c.name.toLowerCase() === categorySearchQuery.trim().toLowerCase()
  );

  const handleCreateNewCategory = () => {
    const trimmed = categorySearchQuery.trim();
    if (!trimmed) return;
    const newCat = onAddCategory(trimmed, "purple");
    setSelectedCategoryId(newCat.id);
    setCategorySearchQuery("");
    setIsCategoryDropdownOpen(false);
  };

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return;
    onSave({
      id: template?.id,
      title: title.trim(),
      category: selectedCategoryId,
      body: body.trim(),
      pinned,
    });
    onClose();
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />

      <div className="fixed inset-x-4 top-[8%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[520px] z-50 bg-card border border-line rounded-xl shadow-2xl p-5 space-y-4 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <span className="text-xs font-semibold text-foreground">
              {template ? "Edit Template" : "New Comment Template"}
            </span>
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Title */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
              Template Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Allocation Notification..."
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-line bg-transparent text-foreground focus:outline-none focus:border-neutral-500"
              autoFocus
            />
          </div>

          {/* Category Selector & Pin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="relative" ref={comboboxRef}>
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                Category:
              </label>

              {/* Combobox Trigger */}
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-line bg-card text-foreground flex items-center justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${currentColorDef.dotClass}`} />
                  <span className="truncate font-medium">{currentCategory?.name || "Select category"}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">▼</span>
              </button>

              {/* Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-line rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-line">
                  {/* Search / On-the-fly Input */}
                  <div className="p-2 bg-muted/20">
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      placeholder="Search or type new category..."
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-line bg-background text-foreground focus:outline-none focus:border-neutral-500"
                      autoFocus
                    />
                  </div>

                  {/* List of categories */}
                  <div className="max-h-40 overflow-y-auto py-1">
                    {filteredCategories.map((cat) => {
                      const cDef = getCategoryColorDef(cat.color);
                      const isSelected = cat.id === selectedCategoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setIsCategoryDropdownOpen(false);
                            setCategorySearchQuery("");
                          }}
                          className={`w-full px-3 py-1.5 text-xs flex items-center justify-between text-left hover:bg-hover transition-colors ${
                            isSelected ? "bg-tag font-semibold" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full ${cDef.dotClass}`} />
                            <span className="truncate">{cat.name}</span>
                          </div>
                          {isSelected && <span className="text-xs text-foreground">✓</span>}
                        </button>
                      );
                    })}

                    {filteredCategories.length === 0 && !categorySearchQuery.trim() && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        No categories found.
                      </div>
                    )}
                  </div>

                  {/* On-the-fly Create Option */}
                  {categorySearchQuery.trim() && !exactMatchExists && (
                    <button
                      type="button"
                      onClick={handleCreateNewCategory}
                      className="w-full px-3 py-2 text-xs flex items-center gap-2 text-left bg-muted/40 hover:bg-hover text-foreground font-medium transition-colors"
                    >
                      <span className="text-emerald-500 font-bold">＋</span>
                      <span>
                        Create <strong className="underline">&quot;{categorySearchQuery.trim()}&quot;</strong>
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pin to top */}
            <div className="pb-1 sm:pb-2">
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

          {/* Body */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
              Message Body (use <code className="text-foreground">[Scout Name]</code> for variables):
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Hi [Scout Name], please review the upcoming shift schedule..."
              className="w-full text-xs p-3 rounded-lg border border-line bg-transparent text-foreground focus:outline-none focus:border-neutral-500 font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
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
              disabled={!title.trim() || !body.trim()}
              className="text-xs px-3.5 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90 disabled:opacity-40"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
