"use client";

import React, { useState, useMemo } from "react";
import { getAllScouts, extractFirstName } from "@/lib/scoutService";

interface ScoutsDirectoryProps {
  onCopyText: (text: string, title?: string) => void;
}

const PAGE_SIZE = 50;

export function ScoutsDirectory({ onCopyText }: ScoutsDirectoryProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const allScouts = getAllScouts();

  const filteredScouts = useMemo(() => {
    if (!query.trim()) return allScouts;
    const q = query.trim().toLowerCase();
    const prefix: string[] = [];
    const substring: string[] = [];

    for (let i = 0; i < allScouts.length; i++) {
      const name = allScouts[i];
      const lower = name.toLowerCase();
      if (lower.startsWith(q)) {
        prefix.push(name);
      } else if (lower.includes(q)) {
        substring.push(name);
      }
    }
    return prefix.concat(substring);
  }, [allScouts, query]);

  const totalPages = Math.ceil(filteredScouts.length / PAGE_SIZE) || 1;
  const currentPageScouts = filteredScouts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="p-4 rounded-xl border border-line bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>👥</span> Master Scouts Directory
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Indexed database of {allScouts.length.toLocaleString()} active operators and coverage scouts.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, last name, ID..."
            className="w-full text-xs px-3 py-2 rounded-lg border border-line bg-transparent text-foreground focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Scouts Table */}
      <div className="rounded-xl border border-line bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-line bg-sidebar font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">Full Name</th>
                <th className="py-2.5 px-4">Extracted First Name</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {currentPageScouts.map((scout, idx) => {
                const firstName = extractFirstName(scout);
                const globalIndex = (page - 1) * PAGE_SIZE + idx + 1;
                return (
                  <tr key={scout + idx} className="hover:bg-hover transition-colors">
                    <td className="py-2 px-4 text-center font-mono text-muted-foreground text-[11px] tabular-nums">
                      {globalIndex}
                    </td>
                    <td className="py-2 px-4 font-medium text-foreground">
                      {scout}
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-0.5 rounded bg-tag font-mono text-[11px] text-muted-foreground">
                        {firstName}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onCopyText(firstName, `Scout: ${firstName}`)}
                          className="px-2 py-1 rounded border border-line text-[11px] font-mono hover:bg-hover text-foreground transition-colors"
                          title="Copy first name"
                        >
                          First Name
                        </button>
                        <button
                          onClick={() => onCopyText(scout, `Scout: ${scout}`)}
                          className="px-2 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-mono hover:opacity-90 transition-opacity"
                          title="Copy full name"
                        >
                          Full Name
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {currentPageScouts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    No scouts found matching &quot;{query}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-line bg-sidebar flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono text-[11px] tabular-nums">
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredScouts.length)} of{" "}
            {filteredScouts.length.toLocaleString()} entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded border border-line text-foreground disabled:opacity-40 hover:bg-hover text-xs font-mono"
            >
              Prev
            </button>
            <span className="font-mono text-[11px] tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded border border-line text-foreground disabled:opacity-40 hover:bg-hover text-xs font-mono"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
