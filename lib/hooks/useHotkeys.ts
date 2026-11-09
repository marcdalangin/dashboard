"use client";

import { useEffect } from "react";

interface HotkeyHandlers {
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  onEscape?: () => void;
  onSearchFocus?: () => void;
  onCtrlSpace?: () => void;
}

export function useHotkeys({
  onToggleSidebar,
  onToggleTheme,
  onEscape,
  onSearchFocus,
  onCtrlSpace,
}: HotkeyHandlers) {
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

      // Ctrl + Spacebar: Quick Copy Template
      if ((e.ctrlKey || e.metaKey) && (e.code === "Space" || e.key === " ")) {
        // Don't trigger if user is typing in a textarea where they might want a space, unless Ctrl is held (which is not standard typing)
        e.preventDefault();
        onCtrlSpace?.();
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
  }, [onToggleSidebar, onToggleTheme, onEscape, onSearchFocus, onCtrlSpace]);
}
