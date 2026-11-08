// ==========================================================================
// Application Bootstrap & Global Handlers
// ==========================================================================

import { appState } from './state.js';
import { initScoutService, getAllScouts, searchScouts, extractFirstName, getScoutCount, loadCustomScoutText } from './scoutService.js';
import { initKanban } from './kanban.js';
import { initCommentHelper, showToast, copyToClipboard } from './commentHelper.js';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Scout Service
  await initScoutService();
  updateScoutDatabaseBadge();

  // 2. Initialize Controllers
  initKanban();
  initCommentHelper();

  // 3. Setup Navigation & Layout
  setupTabNavigation();
  setupSidebar();
  setupTheme();
  setupScratchpad();
  setupScoutsDirectory();
  setupBackupAndSettings();
  setupGlobalHotkeys();
});

// Update scout badges across the dashboard
function updateScoutDatabaseBadge() {
  const count = getScoutCount();
  const badge = document.getElementById("scout-count-badge");
  const tabBadge = document.getElementById("scout-tab-badge");
  const formatted = count >= 1000 ? (count / 1000).toFixed(1) + "k" : count;

  if (badge) badge.textContent = formatted;
  if (tabBadge) tabBadge.textContent = count.toLocaleString();
}

// Tab Switching
function setupTabNavigation() {
  const savedTab = appState.state.settings.activeTab || "kanban-tab";
  switchTab(savedTab);

  document.querySelectorAll(".nav-item[data-tab], .notion-tab[data-tab]").forEach(el => {
    el.addEventListener("click", () => {
      const tabId = el.getAttribute("data-tab");
      if (tabId) switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  // Update nav items
  document.querySelectorAll(".nav-item[data-tab]").forEach(nav => {
    nav.classList.toggle("active", nav.getAttribute("data-tab") === tabId);
  });

  // Update top tabs
  document.querySelectorAll(".notion-tab[data-tab]").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-tab") === tabId);
  });

  // Update view containers
  document.querySelectorAll(".view-container").forEach(view => {
    view.classList.toggle("active", view.id === tabId);
  });

  appState.setActiveTab(tabId);

  // If opening scouts tab, render list
  if (tabId === "scout-tab") {
    renderScoutsDirectoryList();
  }
}

// Sidebar Collapse / Expand
function setupSidebar() {
  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("collapse-sidebar-btn");

  if (appState.state.settings.sidebarCollapsed && sidebar) {
    sidebar.classList.add("collapsed");
    if (collapseBtn) collapseBtn.textContent = "›";
  }

  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      const isCollapsed = sidebar.classList.contains("collapsed");
      collapseBtn.textContent = isCollapsed ? "›" : "‹";
      appState.setSidebarCollapsed(isCollapsed);
    });
  }
}

// Dark / Light Theme
function setupTheme() {
  const themeBtn = document.getElementById("theme-btn");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-toggle-text");

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      if (themeIcon) themeIcon.textContent = "☀️";
      if (themeText) themeText.textContent = "Light Mode";
    } else {
      document.body.classList.remove("dark-mode");
      if (themeIcon) themeIcon.textContent = "🌙";
      if (themeText) themeText.textContent = "Dark Mode";
    }
  }

  applyTheme(appState.state.settings.theme);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      const newTheme = isDark ? "light" : "dark";
      applyTheme(newTheme);
      appState.setTheme(newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }
}

// Scratchpad auto-save
function setupScratchpad() {
  const textarea = document.getElementById("scratchpad-input");
  const countDisplay = document.getElementById("scratchpad-stats");
  const lastSavedDisplay = document.getElementById("scratchpad-saved-time");

  if (!textarea) return;

  textarea.value = appState.state.scratchpad || "";
  updateScratchpadStats();

  let saveTimer = null;
  textarea.addEventListener("input", (e) => {
    updateScratchpadStats();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      appState.updateScratchpad(e.target.value);
      if (lastSavedDisplay) {
        lastSavedDisplay.textContent = "Saved just now";
      }
    }, 400);
  });

  function updateScratchpadStats() {
    if (!countDisplay) return;
    const text = textarea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    countDisplay.textContent = `${text.length} characters • ${words} words`;
  }
}

// Scouts Directory Tab
function setupScoutsDirectory() {
  const searchInput = document.getElementById("scout-dir-search");
  if (!searchInput) return;

  let timer = null;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderScoutsDirectoryList(e.target.value.trim());
    }, 150);
  });
}

function renderScoutsDirectoryList(query = "") {
  const container = document.getElementById("scouts-dir-list");
  if (!container) return;

  const results = searchScouts(query, 50);

  if (results.length === 0) {
    container.innerHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted);">
        No scouts found matching "${query}".
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(name => {
    const firstName = extractFirstName(name);
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card); border-radius: 6px; border: 1px solid var(--border); box-shadow: var(--shadow-card);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 16px;">👤</span>
          <div>
            <div style="font-weight: 600; color: var(--text-main); font-size: 13px;">${escapeHtml(name)}</div>
            <div style="font-size: 11px; color: var(--text-faint); margin-top: 2px;">
              First Name: <code style="background: var(--bg-subtle); padding: 1px 5px; border-radius: 3px; font-weight: 600; color: var(--accent-blue);">${escapeHtml(firstName)}</code>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 6px;">
          <button class="btn-notion btn-copy-scout-full" data-name="${name.replace(/"/g, '&quot;')}" style="font-size: 11px;">Copy Full</button>
          <button class="btn-notion btn-notion-primary btn-copy-scout-first" data-first="${firstName.replace(/"/g, '&quot;')}" style="font-size: 11px;">Copy First Name</button>
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".btn-copy-scout-full").forEach(btn => {
    btn.addEventListener("click", () => {
      copyToClipboard(btn.getAttribute("data-name"));
    });
  });

  container.querySelectorAll(".btn-copy-scout-first").forEach(btn => {
    btn.addEventListener("click", () => {
      copyToClipboard(btn.getAttribute("data-first"));
    });
  });
}

// Backup & Settings Modal
function setupBackupAndSettings() {
  const settingsBtn = document.getElementById("settings-nav-btn");
  const modal = document.getElementById("settings-modal");
  const closeBtn = document.getElementById("settings-modal-close");
  const exportBtn = document.getElementById("btn-export-data");
  const importFileInput = document.getElementById("import-file-input");
  const scoutFileInput = document.getElementById("scout-file-input");

  if (!modal) return;

  function closeModal() {
    modal.classList.remove("active");
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      modal.classList.add("active");
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      appState.exportJSON();
      showToast("Data backup exported!");
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const success = appState.importJSON(event.target.result);
        if (success) {
          showToast("Data imported successfully!");
          closeModal();
          location.reload();
        } else {
          alert("Invalid backup JSON file.");
        }
      };
      reader.readAsText(file);
    });
  }

  if (scoutFileInput) {
    scoutFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const count = loadCustomScoutText(event.target.result);
        if (count > 0) {
          updateScoutDatabaseBadge();
          showToast(`Loaded ${count.toLocaleString()} scouts from ${file.name}!`);
          closeModal();
        } else {
          alert("Could not extract scouts from this file.");
        }
      };
      reader.readAsText(file);
    });
  }
}

// Global Keyboard Shortcuts
function setupGlobalHotkeys() {
  document.addEventListener("keydown", (e) => {
    // Ctrl + \ to toggle sidebar
    if (e.ctrlKey && e.key === "\\") {
      e.preventDefault();
      const collapseBtn = document.getElementById("collapse-sidebar-btn");
      if (collapseBtn) collapseBtn.click();
      return;
    }

    // Ctrl + D to toggle dark/light theme
    if (e.ctrlKey && (e.key === "d" || e.key === "D")) {
      e.preventDefault();
      const themeBtn = document.getElementById("theme-btn");
      if (themeBtn) themeBtn.click();
      return;
    }

    // Ctrl + K or '/' to focus search
    if ((e.ctrlKey && (e.key === "k" || e.key === "K")) || (e.key === "/" && !isInputActive())) {
      e.preventDefault();
      const activeView = document.querySelector(".view-container.active");
      if (!activeView) return;

      const searchInput = activeView.querySelector("input[type='text']");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // Esc to close open modals or drawer
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
      const drawer = document.getElementById("side-peek-drawer");
      const overlay = document.getElementById("drawer-overlay");
      if (drawer && drawer.classList.contains("open")) {
        drawer.classList.remove("open");
        if (overlay) overlay.style.display = "none";
      }
    }
  });
}

function isInputActive() {
  const active = document.activeElement;
  return active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
