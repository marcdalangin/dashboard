"use client";

import React from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export function Toast({ message, isVisible }: ToastProps) {
  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border border-neutral-800 dark:border-neutral-200 transition-all duration-200 transform translate-y-0 opacity-100 flex items-center gap-2"
    >
      <span>✓</span>
      <span>{message}</span>
    </div>
  );
}
