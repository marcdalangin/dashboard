"use client";

import React, { useState } from "react";
import { TemplateCategory, CategoryColor, Template } from "@/lib/types";
import { CATEGORY_COLORS, AVAILABLE_COLORS, getCategoryColorDef } from "@/lib/categoryStyles";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: TemplateCategory[];
  templates: Template[];
  onAddCategory: (name: string, color?: CategoryColor) => TemplateCategory;
  onUpdateCategory: (id: string, updates: Partial<TemplateCategory>) => void;
  onDeleteCategory: (id: string) => void;
  onResetCategories: () => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  templates,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetCategories,
}: CategoryManagerModalProps) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState<CategoryColor>("blue");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), newCatColor);
    setNewCatName("");
    setNewCatColor("blue");
  };

  const handleStartEdit = (cat: TemplateCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = (catId: string) => {
    if (editingName.trim()) {
      onUpdateCategory(catId, { name: editingName.trim() });
    }
    setEditingId(null);
  };

  const handleDelete = (cat: TemplateCategory) => {
    if (categories.length <= 1) {
      alert("You must keep at least one category.");
      return;
    }
    const templateCount = templates.filter((t) => t.category === cat.id).length;
    const warning =
      templateCount > 0
        ? `Delete category "${cat.name}"?\n${templateCount} template(s) currently in this category will be safely reassigned to "Custom".`
        : `Delete category "${cat.name}"?`;

    if (confirm(warning)) {
      onDeleteCategory(cat.id);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />

      <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[540px] z-50 bg-card border border-line rounded-xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🏷️</span>
            <div>
              <h3 className="text-xs font-semibold text-foreground">Manage Template Categories</h3>
              <p className="text-[11px] text-muted-foreground">
                Add, rename, color-code, or delete custom categories.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
            Existing Categories ({categories.length})
          </span>

          <div className="divide-y divide-line border border-line rounded-lg overflow-hidden bg-muted/20">
            {categories.map((cat) => {
              const colorDef = getCategoryColorDef(cat.color);
              const templateCount = templates.filter((t) => t.category === cat.id).length;
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-hover/50 transition-colors"
                >
                  {/* Left: Color dot & Name */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {/* Color Picker Dropdown / Selector */}
                    <div className="relative group shrink-0">
                      <button
                        type="button"
                        className="w-6 h-6 rounded-full border border-line flex items-center justify-center hover:scale-110 transition-transform"
                        title={`Color: ${colorDef.label}. Click to change.`}
                      >
                        <span className={`w-3 h-3 rounded-full ${colorDef.dotClass}`} />
                      </button>

                      {/* Hover Color Palette Menu */}
                      <div className="absolute left-0 top-full mt-1 hidden group-hover:flex items-center gap-1 p-1 bg-card border border-line rounded-md shadow-lg z-20">
                        {AVAILABLE_COLORS.map((col) => {
                          const cDef = CATEGORY_COLORS[col];
                          return (
                            <button
                              key={col}
                              type="button"
                              onClick={() => onUpdateCategory(cat.id, { color: col })}
                              className={`w-5 h-5 rounded-full flex items-center justify-center hover:scale-125 transition-transform ${
                                cat.color === col ? "ring-2 ring-neutral-400" : ""
                              }`}
                              title={cDef.label}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${cDef.dotClass}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inline Name or Edit Input */}
                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="text-xs px-2 py-1 rounded border border-neutral-400 bg-background text-foreground flex-1 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.id)}
                          className="text-[11px] px-2 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-[11px] px-1.5 py-1 text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold text-foreground truncate">{cat.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-tag text-muted-foreground shrink-0">
                          {templateCount} {templateCount === 1 ? "template" : "templates"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="text-xs px-2 py-1 rounded hover:bg-hover text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        title="Rename Category"
                      >
                        <span>✏️</span>
                        <span className="hidden sm:inline">Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="text-xs px-2 py-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
                        title="Delete Category"
                      >
                        <span>🗑️</span>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Category Card */}
        <form onSubmit={handleAdd} className="p-3 rounded-lg border border-line bg-sidebar space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
            Add New Category
          </span>

          <div className="space-y-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Incident Escalations, Shift Alerts..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-line bg-card text-foreground focus:outline-none focus:border-neutral-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {/* Color Swatch Radio */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground mr-1">Color:</span>
                {AVAILABLE_COLORS.map((col) => {
                  const cDef = CATEGORY_COLORS[col];
                  const isSelected = newCatColor === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewCatColor(col)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "ring-2 ring-neutral-900 dark:ring-white scale-110"
                          : "opacity-70 hover:opacity-100 hover:scale-105"
                      }`}
                      title={cDef.label}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${cDef.dotClass}`} />
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="text-xs px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1"
              >
                <span>+</span>
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </form>

        {/* Bottom Options & Done */}
        <div className="flex items-center justify-between pt-2 border-t border-line">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset categories back to default presets (Direct Scout, Allocations, Status Review, Custom)?")) {
                onResetCategories();
              }
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground hover:underline"
          >
            Reset to defaults
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
