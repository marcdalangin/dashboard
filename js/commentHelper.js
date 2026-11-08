// ==========================================================================
// Comment Helper Controller - Templates, Scout Search & Variable Modal
// ==========================================================================

import { appState } from './state.js';
import { searchScouts, extractFirstName, formatScoutName, getScoutCount } from './scoutService.js';

let activeCategory = "all";
let templateSearchQuery = "";
let currentActiveTemplate = null;

// Toast Notification
export function showToast(message = "✓ Copied to clipboard!") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// Copy to clipboard helper
export async function copyToClipboard(text, templateTitle = "") {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    appState.addHistory(text, templateTitle);
    showToast("✓ Copied to clipboard!");
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    showToast("Failed to copy. Please allow clipboard permissions.");
  }
}

export function initCommentHelper() {
  renderCategoryPills();
  renderTemplates();
  setupControlPanel();
  setupVariableModal();
  setupTemplateModal();

  // Listen for state changes
  appState.subscribe(() => {
    renderTemplates();
  });
}

function hasScoutVariable(text) {
  if (!text) return false;
  return /'scout'/i.test(text) || /\[scout\]/i.test(text) || /\{scout\}/i.test(text);
}

function replaceVariables(rawText, scoutName, useFirstNameOnly) {
  const resolvedName = formatScoutName(scoutName, useFirstNameOnly);
  return rawText
    .replace(/'scout'/gi, resolvedName || "[Scout]")
    .replace(/\[scout\]/gi, resolvedName || "[Scout]")
    .replace(/\{scout\}/gi, resolvedName || "[Scout]");
}

// Control Panel Setup
function setupControlPanel() {
  const scoutSearchInput = document.getElementById("scout-quick-search");
  const scoutDropdown = document.getElementById("scout-dropdown");
  const firstNameToggle = document.getElementById("first-name-toggle");
  const selectedDisplay = document.getElementById("selected-scout-display");

  // Initialize toggle
  if (firstNameToggle) {
    firstNameToggle.checked = appState.state.settings.useFirstNameOnly;
    firstNameToggle.addEventListener("change", (e) => {
      appState.setUseFirstNameOnly(e.target.checked);
      updateSelectedScoutDisplay();
      showToast(e.target.checked ? "First name only enabled" : "Full scout name enabled");
    });
  }

  // Update selected scout display
  function updateSelectedScoutDisplay() {
    if (!selectedDisplay) return;
    const current = appState.state.settings.selectedScout;
    const isFirstName = appState.state.settings.useFirstNameOnly;
    if (current) {
      const resolved = formatScoutName(current, isFirstName);
      selectedDisplay.innerHTML = `Active: <strong>${current}</strong> (${isFirstName ? 'Using: ' + resolved : 'Full Name'})`;
    } else {
      selectedDisplay.textContent = "None selected";
    }
  }
  updateSelectedScoutDisplay();

  // Autocomplete search
  if (scoutSearchInput && scoutDropdown) {
    let debounceTimer = null;

    scoutSearchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = e.target.value.trim();
        if (!query) {
          scoutDropdown.style.display = "none";
          return;
        }

        const matches = searchScouts(query, 7);
        if (matches.length === 0) {
          scoutDropdown.innerHTML = `<div style="padding: 10px; font-size: 12px; color: var(--text-muted); text-align: center;">No matching scouts found</div>`;
          scoutDropdown.style.display = "block";
          return;
        }

        scoutDropdown.innerHTML = matches.map(name => {
          const first = extractFirstName(name);
          return `
            <div class="autocomplete-item" data-name="${name.replace(/"/g, '&quot;')}">
              <span>${name}</span>
              <span style="font-size: 11px; color: var(--text-faint);">First: <strong>${first}</strong></span>
            </div>
          `;
        }).join("");

        scoutDropdown.querySelectorAll(".autocomplete-item").forEach(item => {
          item.addEventListener("click", () => {
            const chosenName = item.getAttribute("data-name");
            appState.setSelectedScout(chosenName);
            scoutSearchInput.value = chosenName;
            scoutDropdown.style.display = "none";
            updateSelectedScoutDisplay();
            showToast(`Selected scout: ${formatScoutName(chosenName, appState.state.settings.useFirstNameOnly)}`);
          });
        });

        scoutDropdown.style.display = "block";
      }, 120);
    });

    document.addEventListener("click", (e) => {
      if (!scoutSearchInput.contains(e.target) && !scoutDropdown.contains(e.target)) {
        scoutDropdown.style.display = "none";
      }
    });
  }

  // Template filter input
  const tplFilterInput = document.getElementById("template-filter-input");
  if (tplFilterInput) {
    tplFilterInput.addEventListener("input", (e) => {
      templateSearchQuery = e.target.value.toLowerCase().trim();
      renderTemplates();
    });
  }
}

// Category Pills Setup
function renderCategoryPills() {
  const container = document.getElementById("category-pills-container");
  if (!container) return;

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "scout-direct", label: "Direct Scout Messages" },
    { id: "allocation", label: "Match Allocation" },
    { id: "status", label: "Status & Reviews" },
    { id: "general", label: "General" }
  ];

  container.innerHTML = categories.map(cat => `
    <div class="category-pill ${cat.id === activeCategory ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.label}
    </div>
  `).join("");

  container.querySelectorAll(".category-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      container.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.getAttribute("data-cat");
      renderTemplates();
    });
  });
}

// Render Templates Grid
export function renderTemplates() {
  const container = document.getElementById("templates-container");
  if (!container) return;

  const templates = appState.state.templates.filter(tpl => {
    const matchesCat = activeCategory === "all" || tpl.category === activeCategory;
    const matchesQuery = !templateSearchQuery ||
      tpl.title.toLowerCase().includes(templateSearchQuery) ||
      tpl.body.toLowerCase().includes(templateSearchQuery);
    return matchesCat && matchesQuery;
  });

  if (templates.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-card); border: 1px dashed var(--border); border-radius: 8px;">
        <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
        <strong>No templates match your search</strong>
        <p style="font-size: 12px; margin-top: 4px;">Try another keyword or category, or click "+ New Template" to add one.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = templates.map(tpl => {
    const isVariable = hasScoutVariable(tpl.body);
    const catLabel = tpl.category === "scout-direct" ? "Scout Message" :
                     tpl.category === "allocation" ? "Allocation" :
                     tpl.category === "status" ? "Status Update" : "General";

    return `
      <div class="template-card" data-id="${tpl.id}">
        <div class="template-header">
          <span class="template-title">${escapeHtml(tpl.title)}</span>
          ${isVariable ? `<span class="variable-indicator">'Scout'</span>` : `<span style="font-size: 11px; color: var(--text-faint);">${catLabel}</span>`}
        </div>

        <div class="template-body">${escapeHtml(tpl.body)}</div>

        <div class="template-actions">
          <div style="display: flex; gap: 6px;">
            <button class="btn-notion btn-edit-tpl" data-id="${tpl.id}" title="Edit Template" style="padding: 4px 8px; font-size: 11px;">✏️</button>
            <button class="btn-notion btn-notion-danger btn-del-tpl" data-id="${tpl.id}" title="Delete Template" style="padding: 4px 8px; font-size: 11px;">🗑️</button>
          </div>
          <button class="btn-notion ${isVariable ? 'btn-notion-primary' : ''} btn-use-tpl" data-id="${tpl.id}">
            ${isVariable ? 'Use & Copy' : 'Copy Now'}
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Attach card event listeners
  container.querySelectorAll(".btn-use-tpl").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const tpl = appState.state.templates.find(t => t.id === id);
      if (!tpl) return;

      if (hasScoutVariable(tpl.body)) {
        openVariableModal(tpl);
      } else {
        copyToClipboard(tpl.body, tpl.title);
      }
    });
  });

  container.querySelectorAll(".btn-edit-tpl").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const tpl = appState.state.templates.find(t => t.id === id);
      if (tpl) openEditTemplateModal(tpl);
    });
  });

  container.querySelectorAll(".btn-del-tpl").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const tpl = appState.state.templates.find(t => t.id === id);
      if (tpl && confirm(`Delete template "${tpl.title}"?`)) {
        appState.deleteTemplate(id);
        showToast("Template deleted");
      }
    });
  });
}

// Variable Modal Setup
function setupVariableModal() {
  const modal = document.getElementById("variable-modal");
  const closeBtn = document.getElementById("variable-modal-close");
  const cancelBtn = document.getElementById("variable-modal-cancel");
  const copyBtn = document.getElementById("btn-copy-modal");
  const scoutInput = document.getElementById("modal-scout-input");
  const scoutDropdown = document.getElementById("modal-scout-dropdown");
  const firstNameToggle = document.getElementById("modal-first-name-toggle");

  if (!modal) return;

  function closeModal() {
    modal.classList.remove("active");
    if (scoutDropdown) scoutDropdown.style.display = "none";
    currentActiveTemplate = null;
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  if (firstNameToggle) {
    firstNameToggle.addEventListener("change", (e) => {
      appState.setUseFirstNameOnly(e.target.checked);
      const globalToggle = document.getElementById("first-name-toggle");
      if (globalToggle) globalToggle.checked = e.target.checked;
      updateModalPreview();
    });
  }

  if (scoutInput && scoutDropdown) {
    let timer = null;
    scoutInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const query = e.target.value.trim();
        if (!query) {
          scoutDropdown.style.display = "none";
          updateModalPreview();
          return;
        }

        const matches = searchScouts(query, 6);
        if (matches.length === 0) {
          scoutDropdown.style.display = "none";
        } else {
          scoutDropdown.innerHTML = matches.map(name => {
            const first = extractFirstName(name);
            return `
              <div class="autocomplete-item" data-name="${name.replace(/"/g, '&quot;')}">
                <span>${name}</span>
                <span style="font-size: 11px; color: var(--text-faint);">First: <strong>${first}</strong></span>
              </div>
            `;
          }).join("");

          scoutDropdown.querySelectorAll(".autocomplete-item").forEach(item => {
            item.addEventListener("click", () => {
              const chosen = item.getAttribute("data-name");
              scoutInput.value = chosen;
              appState.setSelectedScout(chosen);
              scoutDropdown.style.display = "none";
              updateModalPreview();
            });
          });

          scoutDropdown.style.display = "block";
        }
        updateModalPreview();
      }, 100);
    });

    // Enter key shortcuts
    scoutInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && scoutDropdown.style.display !== "block") {
        e.preventDefault();
        copyModalResult();
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyModalResult);
  }

  function copyModalResult() {
    const previewBox = document.getElementById("modal-preview-content");
    if (!previewBox) return;
    const text = previewBox.textContent;
    copyToClipboard(text, currentActiveTemplate ? currentActiveTemplate.title : "");
    closeModal();
  }
}

export function openVariableModal(template) {
  currentActiveTemplate = template;
  const modal = document.getElementById("variable-modal");
  const titleEl = document.getElementById("modal-tpl-title");
  const scoutInput = document.getElementById("modal-scout-input");
  const firstNameToggle = document.getElementById("modal-first-name-toggle");

  if (!modal) return;

  if (titleEl) titleEl.textContent = template.title;
  if (scoutInput) {
    scoutInput.value = appState.state.settings.selectedScout || "Aaron Garcia";
  }
  if (firstNameToggle) {
    firstNameToggle.checked = appState.state.settings.useFirstNameOnly;
  }

  updateModalPreview();
  modal.classList.add("active");

  setTimeout(() => {
    if (scoutInput) scoutInput.select();
  }, 50);
}

function updateModalPreview() {
  if (!currentActiveTemplate) return;
  const scoutInput = document.getElementById("modal-scout-input");
  const previewBox = document.getElementById("modal-preview-content");
  const hintEl = document.getElementById("name-format-hint");
  const useFirstName = appState.state.settings.useFirstNameOnly;

  const rawName = scoutInput ? scoutInput.value.trim() : "";
  const resolvedName = formatScoutName(rawName, useFirstName);

  if (previewBox) {
    previewBox.textContent = replaceVariables(currentActiveTemplate.body, rawName, useFirstName);
  }

  if (hintEl) {
    hintEl.textContent = useFirstName
      ? `Output: "${resolvedName}" (First Name Only)`
      : `Output: "${rawName}" (Full Name)`;
  }
}

// Template Create / Edit Modal Setup
function setupTemplateModal() {
  const modal = document.getElementById("template-modal");
  const closeBtn = document.getElementById("tpl-modal-close");
  const cancelBtn = document.getElementById("tpl-modal-cancel");
  const saveBtn = document.getElementById("tpl-modal-save");
  const newTplBtn = document.getElementById("btn-new-template");

  if (!modal) return;

  function closeModal() {
    modal.classList.remove("active");
  }

  if (newTplBtn) {
    newTplBtn.addEventListener("click", () => {
      openEditTemplateModal(null);
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const idInput = document.getElementById("tpl-edit-id");
      const titleInput = document.getElementById("tpl-edit-title");
      const catSelect = document.getElementById("tpl-edit-category");
      const bodyInput = document.getElementById("tpl-edit-body");

      const title = titleInput.value.trim();
      const body = bodyInput.value.trim();
      const category = catSelect.value;
      const id = idInput.value;

      if (!title) {
        alert("Please enter a template title.");
        return;
      }
      if (!body) {
        alert("Please enter template text.");
        return;
      }

      if (id) {
        appState.updateTemplate(id, { title, category, body });
        showToast("Template updated");
      } else {
        appState.addTemplate({ title, category, body });
        showToast("Template created");
      }

      closeModal();
      renderTemplates();
    });
  }
}

function openEditTemplateModal(tpl = null) {
  const modal = document.getElementById("template-modal");
  const header = document.getElementById("tpl-modal-header");
  const idInput = document.getElementById("tpl-edit-id");
  const titleInput = document.getElementById("tpl-edit-title");
  const catSelect = document.getElementById("tpl-edit-category");
  const bodyInput = document.getElementById("tpl-edit-body");

  if (!modal) return;

  if (tpl) {
    header.textContent = "Edit Template";
    idInput.value = tpl.id;
    titleInput.value = tpl.title;
    catSelect.value = tpl.category || "scout-direct";
    bodyInput.value = tpl.body;
  } else {
    header.textContent = "New Template";
    idInput.value = "";
    titleInput.value = "";
    catSelect.value = activeCategory !== "all" ? activeCategory : "scout-direct";
    bodyInput.value = "Hi 'Scout',\n\nKind regards";
  }

  modal.classList.add("active");
  setTimeout(() => titleInput.focus(), 50);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
