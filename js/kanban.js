// ==========================================================================
// Kanban Board Controller - 5 Columns, Drag & Drop & Notion Side-Peek Drawer
// ==========================================================================

import { appState } from './state.js';
import { searchScouts, extractFirstName } from './scoutService.js';
import { showToast } from './commentHelper.js';

let draggedTaskId = null;
let activeTaskDetailId = null;
let searchQuery = "";
let priorityFilter = "all";

export function initKanban() {
  renderKanbanBoard();
  setupKanbanToolbar();
  setupSidePeekDrawer();

  // Listen to state changes
  appState.subscribe(() => {
    renderKanbanBoard();
    updateBadges();
  });
}

function setupKanbanToolbar() {
  const searchInput = document.getElementById("kanban-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderKanbanBoard();
    });
  }

  const prioritySelect = document.getElementById("kanban-priority-filter");
  if (prioritySelect) {
    prioritySelect.addEventListener("change", (e) => {
      priorityFilter = e.target.value;
      renderKanbanBoard();
    });
  }

  const addTaskTopBtn = document.getElementById("btn-add-task-top");
  if (addTaskTopBtn) {
    addTaskTopBtn.addEventListener("click", () => {
      openSidePeekDrawer(null, "backlogs");
    });
  }
}

export function renderKanbanBoard() {
  const columns = appState.state.columns;
  const tasks = appState.state.tasks;

  columns.forEach(col => {
    const colElement = document.querySelector(`.kanban-column[data-col="${col.id}"]`);
    if (!colElement) return;

    const container = colElement.querySelector(".cards-container");
    if (!container) return;

    // Filter tasks for this column
    const colTasks = tasks.filter(t => {
      if (t.columnId !== col.id) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery) {
        const titleMatch = t.title.toLowerCase().includes(searchQuery);
        const descMatch = (t.description || "").toLowerCase().includes(searchQuery);
        const scoutMatch = (t.scout || "").toLowerCase().includes(searchQuery);
        const tagMatch = (t.tags || []).some(tag => tag.toLowerCase().includes(searchQuery));
        if (!titleMatch && !descMatch && !scoutMatch && !tagMatch) return false;
      }
      return true;
    });

    // Render cards
    container.innerHTML = colTasks.map(task => renderTaskCard(task, col.id)).join("");

    // Update column count badge
    const badge = colElement.querySelector(".column-badge");
    if (badge) {
      badge.textContent = colTasks.length;
    }

    // Attach card event listeners
    attachCardEvents(container, col.id);
    attachColumnDragEvents(colElement, col.id);
  });

  updateBadges();
}

function renderTaskCard(task, colId) {
  const priorityClass = task.priority === "High" ? "tag-high" :
                        task.priority === "Medium" ? "tag-med" : "tag-low";

  const checklistTotal = (task.checklist || []).length;
  const checklistDone = (task.checklist || []).filter(c => c.done).length;

  return `
    <div class="kanban-card" draggable="true" data-id="${task.id}">
      <div class="card-tags">
        <span class="tag-pill ${priorityClass}">${task.priority}</span>
        ${task.scout ? `<span class="tag-pill tag-scout">👤 ${escapeHtml(extractFirstName(task.scout))}</span>` : ''}
        ${(task.tags || []).map(tag => `<span class="tag-pill tag-default">${escapeHtml(tag)}</span>`).join('')}
      </div>

      <div class="card-title">${escapeHtml(task.title)}</div>

      ${task.description ? `<div class="card-desc">${escapeHtml(task.description)}</div>` : ''}

      ${checklistTotal > 0 ? `
        <div class="card-checklist-badge">
          <span>☑</span> ${checklistDone}/${checklistTotal} subtasks
        </div>
      ` : ''}

      <div class="card-footer">
        <span>${formatRelativeTime(task.createdAt)}</span>
        <div class="card-quick-actions" onclick="event.stopPropagation()">
          ${colId !== "backlogs" ? `<button class="btn-quick btn-move-prev" data-id="${task.id}" title="Move Previous">←</button>` : ''}
          ${colId !== "blocked" ? `<button class="btn-quick btn-move-blocked" data-id="${task.id}" title="Mark Blocked">⛔</button>` : ''}
          ${colId !== "done" ? `<button class="btn-quick btn-move-next" data-id="${task.id}" title="Move Next">→</button>` : ''}
          ${colId !== "done" ? `<button class="btn-quick btn-move-done" data-id="${task.id}" title="Mark Done">✓</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function attachCardEvents(container, colId) {
  container.querySelectorAll(".kanban-card").forEach(card => {
    const taskId = card.getAttribute("data-id");

    // Click card to open Notion Side-Peek Drawer
    card.addEventListener("click", () => {
      const task = appState.state.tasks.find(t => t.id === taskId);
      if (task) openSidePeekDrawer(task);
    });

    // Drag start
    card.addEventListener("dragstart", (e) => {
      draggedTaskId = taskId;
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", taskId);
      e.dataTransfer.effectAllowed = "move";
    });

    // Drag end
    card.addEventListener("dragend", () => {
      draggedTaskId = null;
      card.classList.remove("dragging");
      document.querySelectorAll(".kanban-column").forEach(c => c.classList.remove("drag-over"));
    });
  });

  // Quick move button actions
  container.querySelectorAll(".btn-move-next").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      advanceTask(id, 1);
    });
  });

  container.querySelectorAll(".btn-move-prev").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      advanceTask(id, -1);
    });
  });

  container.querySelectorAll(".btn-move-blocked").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      appState.moveTask(id, "blocked");
      showToast("Task marked as Blocked ⛔");
    });
  });

  container.querySelectorAll(".btn-move-done").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      appState.moveTask(id, "done");
      showToast("Task marked as Done ✓");
    });
  });
}

function advanceTask(taskId, delta) {
  const colOrder = ["backlogs", "todo", "in-progress", "done"];
  const task = appState.state.tasks.find(t => t.id === taskId);
  if (!task) return;

  let currentIdx = colOrder.indexOf(task.columnId);
  if (currentIdx === -1) {
    // If was blocked, moving forward goes to in-progress
    currentIdx = 1;
  }

  const nextIdx = Math.max(0, Math.min(colOrder.length - 1, currentIdx + delta));
  const newCol = colOrder[nextIdx];
  appState.moveTask(taskId, newCol);
  showToast(`Task moved to ${newCol.replace("-", " ")}`);
}

function attachColumnDragEvents(columnEl, columnId) {
  const container = columnEl.querySelector(".cards-container");
  if (!container) return;

  columnEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    columnEl.classList.add("drag-over");
  });

  columnEl.addEventListener("dragleave", (e) => {
    if (!columnEl.contains(e.relatedTarget)) {
      columnEl.classList.remove("drag-over");
    }
  });

  columnEl.addEventListener("drop", (e) => {
    e.preventDefault();
    columnEl.classList.remove("drag-over");
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      appState.moveTask(taskId, columnId);
      showToast(`Moved to ${columnId.replace("-", " ")}`);
    }
  });

  // "+ New" button at bottom of each column
  const addBtn = columnEl.querySelector(".add-card-btn");
  if (addBtn && !addBtn._hasHandler) {
    addBtn._hasHandler = true;
    addBtn.addEventListener("click", () => {
      openSidePeekDrawer(null, columnId);
    });
  }
}

// Side-Peek Drawer Setup
function setupSidePeekDrawer() {
  const drawer = document.getElementById("side-peek-drawer");
  const overlay = document.getElementById("drawer-overlay");
  const closeBtn = document.getElementById("drawer-close-btn");
  const deleteBtn = document.getElementById("drawer-delete-task");
  const saveBtn = document.getElementById("drawer-save-btn");

  if (!drawer || !overlay) return;

  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.style.display = "none";
    activeTaskDetailId = null;
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);

  // Scout autocomplete in drawer
  const scoutInput = document.getElementById("drawer-scout-input");
  const scoutDropdown = document.getElementById("drawer-scout-dropdown");

  if (scoutInput && scoutDropdown) {
    let timer = null;
    scoutInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const query = e.target.value.trim();
        if (!query) {
          scoutDropdown.style.display = "none";
          return;
        }

        const matches = searchScouts(query, 5);
        if (matches.length === 0) {
          scoutDropdown.style.display = "none";
        } else {
          scoutDropdown.innerHTML = matches.map(name => `
            <div class="autocomplete-item" data-name="${name.replace(/"/g, '&quot;')}">
              <span>${name}</span>
            </div>
          `).join("");

          scoutDropdown.querySelectorAll(".autocomplete-item").forEach(item => {
            item.addEventListener("click", () => {
              scoutInput.value = item.getAttribute("data-name");
              scoutDropdown.style.display = "none";
            });
          });
          scoutDropdown.style.display = "block";
        }
      }, 100);
    });

    document.addEventListener("click", (e) => {
      if (!scoutInput.contains(e.target) && !scoutDropdown.contains(e.target)) {
        scoutDropdown.style.display = "none";
      }
    });
  }

  // Save changes
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const title = document.getElementById("drawer-task-title").value.trim();
      const columnId = document.getElementById("drawer-status-select").value;
      const priority = document.getElementById("drawer-priority-select").value;
      const scout = document.getElementById("drawer-scout-input").value.trim();
      const tagsStr = document.getElementById("drawer-tags-input").value.trim();
      const description = document.getElementById("drawer-notes-area").value.trim();

      if (!title) {
        alert("Please enter a task title.");
        return;
      }

      const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];

      // Collect checklist items
      const checklistItems = [];
      document.querySelectorAll("#drawer-checklist-items .checklist-item").forEach(row => {
        const checkbox = row.querySelector("input[type='checkbox']");
        const label = row.querySelector(".checklist-label");
        if (label && label.value.trim()) {
          checklistItems.push({
            text: label.value.trim(),
            done: checkbox.checked
          });
        }
      });

      if (activeTaskDetailId) {
        appState.updateTask(activeTaskDetailId, {
          title,
          columnId,
          priority,
          scout,
          tags,
          description,
          checklist: checklistItems
        });
        showToast("Task updated");
      } else {
        appState.addTask({
          title,
          columnId,
          priority,
          scout,
          tags,
          description,
          checklist: checklistItems
        });
        showToast("Task created");
      }

      closeDrawer();
      renderKanbanBoard();
    });
  }

  // Delete task
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (activeTaskDetailId && confirm("Delete this task?")) {
        appState.deleteTask(activeTaskDetailId);
        showToast("Task deleted");
        closeDrawer();
        renderKanbanBoard();
      }
    });
  }

  // Add checklist item button
  const addChecklistBtn = document.getElementById("drawer-add-checklist-btn");
  if (addChecklistBtn) {
    addChecklistBtn.addEventListener("click", () => {
      addChecklistRow("", false);
    });
  }
}

export function openSidePeekDrawer(task = null, defaultColumnId = "backlogs") {
  const drawer = document.getElementById("side-peek-drawer");
  const overlay = document.getElementById("drawer-overlay");
  const deleteBtn = document.getElementById("drawer-delete-task");

  const titleInput = document.getElementById("drawer-task-title");
  const statusSelect = document.getElementById("drawer-status-select");
  const prioritySelect = document.getElementById("drawer-priority-select");
  const scoutInput = document.getElementById("drawer-scout-input");
  const tagsInput = document.getElementById("drawer-tags-input");
  const notesArea = document.getElementById("drawer-notes-area");
  const checklistContainer = document.getElementById("drawer-checklist-items");

  if (!drawer || !overlay) return;

  checklistContainer.innerHTML = "";

  if (task) {
    activeTaskDetailId = task.id;
    titleInput.value = task.title;
    statusSelect.value = task.columnId;
    prioritySelect.value = task.priority || "Medium";
    scoutInput.value = task.scout || "";
    tagsInput.value = (task.tags || []).join(", ");
    notesArea.value = task.description || "";

    if (deleteBtn) deleteBtn.style.display = "inline-flex";

    (task.checklist || []).forEach(item => {
      addChecklistRow(item.text, item.done);
    });
  } else {
    activeTaskDetailId = null;
    titleInput.value = "";
    statusSelect.value = defaultColumnId;
    prioritySelect.value = "Medium";
    scoutInput.value = "";
    tagsInput.value = "";
    notesArea.value = "";

    if (deleteBtn) deleteBtn.style.display = "none";
  }

  overlay.style.display = "block";
  drawer.classList.add("open");
  setTimeout(() => titleInput.focus(), 80);
}

function addChecklistRow(text = "", done = false) {
  const container = document.getElementById("drawer-checklist-items");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "checklist-item";
  row.innerHTML = `
    <input type="checkbox" ${done ? 'checked' : ''}>
    <input type="text" class="modal-input checklist-label" style="flex: 1; padding: 4px 8px; font-size: 13px;" value="${escapeHtml(text)}" placeholder="Subtask item...">
    <button type="button" class="btn-notion btn-notion-danger" style="padding: 2px 6px; font-size: 11px;" title="Remove">✕</button>
  `;

  row.querySelector("button").addEventListener("click", () => row.remove());
  container.appendChild(row);
  const input = row.querySelector(".checklist-label");
  if (!text) input.focus();
}

function updateBadges() {
  const total = appState.state.tasks.length;
  const badge = document.getElementById("kanban-count-badge");
  if (badge) badge.textContent = total;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return "Today";
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
