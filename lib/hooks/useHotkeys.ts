"use client";

import { useEffect } from "react";

interface HotkeyHandlers {
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  onEscape?: () => void;
  onSearchFocus?: () => void;
}

export function useHotkeys({ onToggleSidebar, onToggleTheme, onEscape, onSearchFocus }: HotkeyHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar: Ctrl + \ or Cmd + \
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // Toggle Theme: Ctrl + D
      if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        onToggleTheme?.();
        return;
      }

      // Escape key to dismiss modals / drawer
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }

      // Ctrl + K or '/' to focus search (when not currently in an input)
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) ||
        (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName))
      ) {
        e.preventDefault();
        onSearchFocus?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleSidebar, onToggleTheme, onEscape, onSearchFocus]);
}
