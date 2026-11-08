// ==========================================================================
// Personal Work Dashboard - Unified Standalone Bundle
// Runs natively over file:/// (double-click) or http:// with zero build tools
// ==========================================================================

(function () {
  "use strict";

  // Common HTML escaping helper
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ==========================================================================
  // 1. STATE & PERSISTENCE
  // ==========================================================================
  const STORAGE_KEY = "notion_dashboard_state_v2";
  const LEGACY_STORAGE_KEY = "notion_dashboard_state_v1";

  const DEFAULT_COLUMNS = [
    { id: "backlogs", title: "Backlogs", dotClass: "dot-backlog" },
    { id: "todo", title: "To-do", dotClass: "dot-todo" },
    { id: "in-progress", title: "In Progress", dotClass: "dot-progress" },
    { id: "blocked", title: "Blocked", dotClass: "dot-blocked" },
    { id: "done", title: "Done", dotClass: "dot-done" }
  ];

  const DEFAULT_TASKS = [
    {
      id: "task-1",
      title: "Review TT Cup Hall schedules",
      description: "Verify court availability and hall assignments for evening matches.",
      columnId: "backlogs",
      priority: "Low",
      scout: "",
      tags: ["Scheduling"],
      checklist: [
        { text: "Check Hall 1 & 2 list", done: false },
        { text: "Confirm referee roster", done: false }
      ],
      createdAt: Date.now() - 86400000
    },
    {
      id: "task-2",
      title: "Sync scout roster updates",
      description: "Check incoming replacement scouts from regional list and update master directory.",
      columnId: "backlogs",
      priority: "Medium",
      scout: "",
      tags: ["Roster"],
      checklist: [],
      createdAt: Date.now() - 54000000
    },
    {
      id: "task-3",
      title: "Confirm Beach Volley line-up",
      description: "Awaiting final referee sign-off before allocating scout coverage.",
      columnId: "todo",
      priority: "High",
      scout: "",
      tags: ["Allocation"],
      checklist: [
        { text: "Check tournament bracket", done: true },
        { text: "Send allocation message", done: false }
      ],
      createdAt: Date.now() - 36000000
    },
    {
      id: "task-4",
      title: "Audit post-match ratings",
      description: "Check missing ratings for completed afternoon games before shift handover.",
      columnId: "todo",
      priority: "Low",
      scout: "",
      tags: ["Ratings"],
      checklist: [],
      createdAt: Date.now() - 28000000
    },
    {
      id: "task-5",
      title: "Live Score Tracking: Liga Pro",
      description: "Monitoring point sequences and live court coverage for Hall 3.",
      columnId: "in-progress",
      priority: "High",
      scout: "Aaron Garcia",
      tags: ["Monitoring"],
      checklist: [
        { text: "Confirm kick-off / first serve", done: true },
        { text: "Track point sequence review", done: false }
      ],
      createdAt: Date.now() - 14000000
    },
    {
      id: "task-6",
      title: "Check scout application for coverage",
      description: "Scout submitted application for upcoming tournament coverage.",
      columnId: "in-progress",
      priority: "Medium",
      scout: "Morales, Ignacio",
      tags: ["Coverage"],
      checklist: [],
      createdAt: Date.now() - 7200000
    },
    {
      id: "task-7",
      title: "Court 2 Connection Timeout",
      description: "Waiting for on-site scout device reconnection. Operator notified.",
      columnId: "blocked",
      priority: "High",
      scout: "",
      tags: ["Connection"],
      checklist: [
        { text: "Ping scout via chat", done: true },
        { text: "Escalate to tech lead", done: false }
      ],
      createdAt: Date.now() - 18000000
    },
    {
      id: "task-8",
      title: "Morning shift handover notes",
      description: "All matches cleared and logged in daily tracking spreadsheet.",
      columnId: "done",
      priority: "Low",
      scout: "",
      tags: ["Handover"],
      checklist: [
        { text: "Export shift log", done: true },
        { text: "Update operator board", done: true }
      ],
      createdAt: Date.now() - 70000000
    }
  ];

  const DEFAULT_TEMPLATES = [
    {
      id: "tpl-1",
      title: "Match Added for Coverage",
      category: "scout-direct",
      body: "Hi 'Scout',\nMatch is added for your coverage.\n\nKind regards",
      pinned: true
    },
    {
      id: "tpl-2",
      title: "Check Application",
      category: "scout-direct",
      body: "Hi 'Scout',\nWe will check your application if needed.\n\nKind regards",
      pinned: true
    },
    {
      id: "tpl-3",
      title: "Kindly Add (Team)",
      category: "allocation",
      body: "Hi team,\nKindly add.\n\nThank you",
      pinned: false
    },
    {
      id: "tpl-4",
      title: "Match End Confirmation",
      category: "scout-direct",
      body: "Hi 'Scout',\nMatch has ended. Final score confirmed by the scout.\n\nThank you!",
      pinned: false
    },
    {
      id: "tpl-5",
      title: "Connection Problems",
      category: "status",
      body: "Connection problems.",
      pinned: false
    },
    {
      id: "tpl-6",
      title: "Score Under Review",
      category: "status",
      body: "Score under review.",
      pinned: false
    },
    {
      id: "tpl-7",
      title: "Statistics Updated",
      category: "status",
      body: "Statistics updated.",
      pinned: false
    },
    {
      id: "tpl-8",
      title: "Score Sequence Under Review",
      category: "status",
      body: "Score sequence under review.",
      pinned: false
    },
    {
      id: "tpl-9",
      title: "Match Status Under Review",
      category: "status",
      body: "Match status under review.",
      pinned: false
    },
    {
      id: "tpl-10",
      title: "Last Match of the Day",
      category: "scout-direct",
      body: "Hi 'Scout',\nLast match of the day has ended.\n\nThank you for your coverage!",
      pinned: false
    },
    {
      id: "tpl-11",
      title: "End of Shift Confirmation",
      category: "general",
      body: "My shift has ended. No missing rating.\n\nHave a great day team!",
      pinned: false
    }
  ];

  class StateManager {
    constructor() {
      this.listeners = new Set();
      this.state = this.loadState();
    }

    loadState() {
      try {
        let saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          saved = localStorage.getItem(LEGACY_STORAGE_KEY);
        }

        if (saved) {
          const parsed = JSON.parse(saved);
          const loadedState = {
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : DEFAULT_TASKS,
            columns: DEFAULT_COLUMNS,
            templates: Array.isArray(parsed.templates) ? parsed.templates : DEFAULT_TEMPLATES,
            settings: {
              theme: parsed.settings?.theme || "light",
              useFirstNameOnly: parsed.settings?.useFirstNameOnly !== undefined ? parsed.settings.useFirstNameOnly : true,
              activeTab: parsed.settings?.activeTab || "kanban-tab",
              sidebarCollapsed: parsed.settings?.sidebarCollapsed || false,
              selectedScout: parsed.settings?.selectedScout || "Aaron Garcia"
            },
            scratchpad: typeof parsed.scratchpad === "string" ? parsed.scratchpad : "Handover notes:\n- Review coverage applications\n- Confirm court 2 device status\n",
            history: Array.isArray(parsed.history) ? parsed.history : []
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            tasks: loadedState.tasks,
            templates: loadedState.templates,
            settings: loadedState.settings,
            scratchpad: loadedState.scratchpad,
            history: loadedState.history.slice(0, 30)
          }));
          return loadedState;
        }
      } catch (e) {
        console.warn("Failed to parse saved state:", e);
      }

      const initialState = {
        tasks: DEFAULT_TASKS,
        columns: DEFAULT_COLUMNS,
        templates: DEFAULT_TEMPLATES,
        settings: {
          theme: "light",
          useFirstNameOnly: true,
          activeTab: "kanban-tab",
          sidebarCollapsed: false,
          selectedScout: "Aaron Garcia"
        },
        scratchpad: "Handover notes:\n- Review coverage applications\n- Confirm court 2 device status\n",
        history: []
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
      } catch (e) {
        console.error("Failed to initialize storage:", e);
      }

      return initialState;
    }

    resetToDefaults() {
      this.state.templates = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
      this.save();
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          tasks: this.state.tasks,
          templates: this.state.templates,
          settings: this.state.settings,
          scratchpad: this.state.scratchpad,
          history: this.state.history.slice(0, 30)
        }));
      } catch (e) {
        console.error("Failed to save state to localStorage:", e);
      }
      this.notify();
    }

    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    notify() {
      for (const listener of this.listeners) {
        listener(this.state);
      }
    }

    addTask({ title, description = "", columnId = "backlogs", priority = "Medium", scout = "", tags = [], checklist = [] }) {
      const newTask = {
        id: "task-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        title: title.trim(),
        description: description.trim(),
        columnId,
        priority,
        scout: scout.trim(),
        tags: Array.isArray(tags) ? tags : [],
        checklist: Array.isArray(checklist) ? checklist : [],
        createdAt: Date.now()
      };
      this.state.tasks.push(newTask);
      this.save();
      return newTask;
    }

    updateTask(taskId, updates) {
      const task = this.state.tasks.find(t => t.id === taskId);
      if (!task) return null;
      Object.assign(task, updates);
      this.save();
      return task;
    }

    moveTask(taskId, newColumnId, targetIndex = -1) {
      const index = this.state.tasks.findIndex(t => t.id === taskId);
      if (index === -1) return;
      const [task] = this.state.tasks.splice(index, 1);
      task.columnId = newColumnId;

      if (targetIndex >= 0) {
        this.state.tasks.splice(targetIndex, 0, task);
      } else {
        this.state.tasks.push(task);
      }
      this.save();
    }

    deleteTask(taskId) {
      this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
      this.save();
    }

    addTemplate({ title, category = "scout-direct", body = "", pinned = false }) {
      const newTpl = {
        id: "tpl-" + Date.now(),
        title: title.trim(),
        category,
        body: body.trim(),
        pinned
      };
      this.state.templates.unshift(newTpl);
      this.save();
      return newTpl;
    }

    updateTemplate(tplId, updates) {
      const tpl = this.state.templates.find(t => t.id === tplId);
      if (!tpl) return null;
      Object.assign(tpl, updates);
      this.save();
      return tpl;
    }

    deleteTemplate(tplId) {
      this.state.templates = this.state.templates.filter(t => t.id !== tplId);
      this.save();
    }

    addHistory(text, templateTitle = "") {
      if (!text) return;
      this.state.history.unshift({
        id: "hist-" + Date.now(),
        text,
        templateTitle,
        timestamp: Date.now()
      });
      this.state.history = this.state.history.slice(0, 30);
      this.save();
    }

    updateScratchpad(text) {
      this.state.scratchpad = text;
      this.save();
    }

    setTheme(theme) {
      this.state.settings.theme = theme;
      this.save();
    }

    setUseFirstNameOnly(val) {
      this.state.settings.useFirstNameOnly = !!val;
      this.save();
    }

    setActiveTab(tabId) {
      this.state.settings.activeTab = tabId;
      this.save();
    }

    setSidebarCollapsed(val) {
      this.state.settings.sidebarCollapsed = !!val;
      this.save();
    }

    setSelectedScout(scout) {
      this.state.settings.selectedScout = scout;
      this.save();
    }

    exportJSON() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dashboard_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.tasks) this.state.tasks = parsed.tasks;
        if (parsed.templates) this.state.templates = parsed.templates;
        if (parsed.settings) this.state.settings = Object.assign(this.state.settings, parsed.settings);
        if (parsed.scratchpad !== undefined) this.state.scratchpad = parsed.scratchpad;
        this.save();
        return true;
      } catch (e) {
        console.error("Import failed:", e);
        return false;
      }
    }
  }

  const appState = new StateManager();

  // ==========================================================================
  // 2. SCOUT SERVICE
  // ==========================================================================
  let scoutList = [];
  let isLoaded = false;

  const FALLBACK_SCOUTS = [
    "Aaron Garcia",
    "Morales, Ignacio",
    "Chitgar/Carter",
    "Beck",
    "Berti",
    "Carrucciu",
    "Feroleto Antonio",
    "KAJI",
    "Kamil",
    "Kawano",
    "Krusic/Hassani",
    "L.M Parvath Mayur",
    "Lalaune",
    "Lecce",
    "Leguevaques",
    "Nishimura",
    "Norel",
    "Ogomori",
    "Parada/Silva",
    "Pokorny",
    "Satta",
    "Sulis",
    "Tibor",
    "Toshiyasu Nakamura",
    "Vannecke Dirk",
    "Wariman/Dewi/Sony",
    "Álvaro López Esteban",
    "Aaron Andrew Ranada",
    "Aaron Beveridge",
    "Aaron Clem",
    "Aaron Norris",
    "Aayush Desai",
    "Abbas Abdalov",
    "Abbas Moosavi",
    "Abbas Surve"
  ];

  function decodeHtmlEntities(str) {
    if (!str || !str.includes("&")) return str;
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  async function initScoutService() {
    if (isLoaded && scoutList.length > 0) return scoutList;

    if (typeof window !== "undefined" && Array.isArray(window.PRELOADED_SCOUTS) && window.PRELOADED_SCOUTS.length > 0) {
      scoutList = window.PRELOADED_SCOUTS;
      isLoaded = true;
      return scoutList;
    }

    try {
      const res = await fetch("data/Scout list.txt");
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        const set = new Set();
        const list = [];

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line || line.startsWith("**") || line.startsWith("#") || line === "? ??" || line === "?? ??") continue;
          line = decodeHtmlEntities(line);
          if (!set.has(line)) {
            set.add(line);
            list.push(line);
          }
        }

        if (list.length > 0) {
          scoutList = list;
          isLoaded = true;
          return scoutList;
        }
      }
    } catch (err) {
      // Fetch restricted over file://, using preloaded or fallback
    }

    scoutList = FALLBACK_SCOUTS;
    isLoaded = true;
    return scoutList;
  }

  function loadCustomScoutText(rawText) {
    const lines = rawText.split(/\r?\n/);
    const set = new Set();
    const list = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith("**") || line.startsWith("#") || line === "? ??" || line === "?? ??") continue;
      line = decodeHtmlEntities(line);
      if (!set.has(line)) {
        set.add(line);
        list.push(line);
      }
    }

    if (list.length > 0) {
      scoutList = list;
      isLoaded = true;
      return list.length;
    }
    return 0;
  }

  function getScoutCount() {
    return scoutList.length;
  }

  function extractFirstName(fullName) {
    if (!fullName) return "";
    let name = fullName.trim();

    if (name.includes(",")) {
      const parts = name.split(",");
      if (parts[1] && parts[1].trim()) {
        const subTokens = parts[1].trim().split(/\s+/);
        return subTokens[0];
      }
    }

    if (name.includes("/")) {
      name = name.split("/")[0].trim();
    }

    name = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, "");
    const tokens = name.split(/\s+/);
    return tokens[0] || name;
  }

  function formatScoutName(fullName, useFirstNameOnly) {
    if (!fullName) return "";
    return useFirstNameOnly ? extractFirstName(fullName) : fullName;
  }

  function searchScouts(query, limit = 20) {
    if (!query || !query.trim()) {
      return scoutList.slice(0, limit);
    }

    const q = query.trim().toLowerCase();
    const prefixMatches = [];
    const containsMatches = [];

    for (let i = 0; i < scoutList.length; i++) {
      const scout = scoutList[i];
      const lower = scout.toLowerCase();

      if (lower.startsWith(q)) {
        prefixMatches.push(scout);
        if (prefixMatches.length >= limit) break;
      } else if (lower.includes(q)) {
        if (prefixMatches.length + containsMatches.length < limit * 2) {
          containsMatches.push(scout);
        }
      }
    }

    return prefixMatches.concat(containsMatches).slice(0, limit);
  }

  // ==========================================================================
  // 3. TOAST & CLIPBOARD
  // ==========================================================================
  function showToast(message = "✓ Copied to clipboard!") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  async function copyToClipboard(text, templateTitle = "") {
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

  // ==========================================================================
  // 4. COMMENT HELPER
  // ==========================================================================
  let activeCategory = "all";
  let templateSearchQuery = "";
  let currentActiveTemplate = null;

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

  function initCommentHelper() {
    renderCategoryPills();
    renderTemplates();
    setupCommentControlPanel();
    setupVariableModal();
    setupTemplateModal();

    appState.subscribe(() => {
      renderTemplates();
    });
  }

  function setupCommentControlPanel() {
    const scoutSearchInput = document.getElementById("scout-quick-search");
    const scoutDropdown = document.getElementById("scout-dropdown");
    const firstNameToggle = document.getElementById("first-name-toggle");
    const selectedDisplay = document.getElementById("selected-scout-display");

    if (firstNameToggle) {
      firstNameToggle.checked = appState.state.settings.useFirstNameOnly;
      firstNameToggle.addEventListener("change", (e) => {
        appState.setUseFirstNameOnly(e.target.checked);
        updateSelectedScoutDisplay();
        showToast(e.target.checked ? "First name only enabled" : "Full scout name enabled");
      });
    }

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

    const tplFilterInput = document.getElementById("template-filter-input");
    if (tplFilterInput) {
      tplFilterInput.addEventListener("input", (e) => {
        templateSearchQuery = e.target.value.toLowerCase().trim();
        renderTemplates();
      });
    }
  }

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

  function renderTemplates() {
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

  function openVariableModal(template) {
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

  // ==========================================================================
  // 5. KANBAN BOARD
  // ==========================================================================
  let draggedTaskId = null;
  let activeTaskDetailId = null;
  let kanbanSearchQuery = "";
  let kanbanPriorityFilter = "all";

  function initKanban() {
    renderKanbanBoard();
    setupKanbanToolbar();
    setupSidePeekDrawer();

    appState.subscribe(() => {
      renderKanbanBoard();
      updateBadges();
    });
  }

  function setupKanbanToolbar() {
    const searchInput = document.getElementById("kanban-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        kanbanSearchQuery = e.target.value.toLowerCase().trim();
        renderKanbanBoard();
      });
    }

    const prioritySelect = document.getElementById("kanban-priority-filter");
    if (prioritySelect) {
      prioritySelect.addEventListener("change", (e) => {
        kanbanPriorityFilter = e.target.value;
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

  function renderKanbanBoard() {
    const columns = appState.state.columns;
    const tasks = appState.state.tasks;

    columns.forEach(col => {
      const colElement = document.querySelector(`.kanban-column[data-col="${col.id}"]`);
      if (!colElement) return;

      const container = colElement.querySelector(".cards-container");
      if (!container) return;

      const colTasks = tasks.filter(t => {
        if (t.columnId !== col.id) return false;
        if (kanbanPriorityFilter !== "all" && t.priority !== kanbanPriorityFilter) return false;
        if (kanbanSearchQuery) {
          const titleMatch = t.title.toLowerCase().includes(kanbanSearchQuery);
          const descMatch = (t.description || "").toLowerCase().includes(kanbanSearchQuery);
          const scoutMatch = (t.scout || "").toLowerCase().includes(kanbanSearchQuery);
          const tagMatch = (t.tags || []).some(tag => tag.toLowerCase().includes(kanbanSearchQuery));
          if (!titleMatch && !descMatch && !scoutMatch && !tagMatch) return false;
        }
        return true;
      });

      container.innerHTML = colTasks.map(task => renderTaskCard(task, col.id)).join("");

      const badge = colElement.querySelector(".column-badge");
      if (badge) badge.textContent = colTasks.length;

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

      card.addEventListener("click", () => {
        const task = appState.state.tasks.find(t => t.id === taskId);
        if (task) openSidePeekDrawer(task);
      });

      card.addEventListener("dragstart", (e) => {
        draggedTaskId = taskId;
        card.classList.add("dragging");
        e.dataTransfer.setData("text/plain", taskId);
        e.dataTransfer.effectAllowed = "move";
      });

      card.addEventListener("dragend", () => {
        draggedTaskId = null;
        card.classList.remove("dragging");
        document.querySelectorAll(".kanban-column").forEach(c => c.classList.remove("drag-over"));
      });
    });

    container.querySelectorAll(".btn-move-next").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        advanceTask(btn.getAttribute("data-id"), 1);
      });
    });

    container.querySelectorAll(".btn-move-prev").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        advanceTask(btn.getAttribute("data-id"), -1);
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
    if (currentIdx === -1) currentIdx = 1;

    const nextIdx = Math.max(0, Math.min(colOrder.length - 1, currentIdx + delta));
    const newCol = colOrder[nextIdx];
    appState.moveTask(taskId, newCol);
    showToast(`Task moved to ${newCol.replace("-", " ")}`);
  }

  function attachColumnDragEvents(columnEl, columnId) {
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

    const addBtn = columnEl.querySelector(".add-card-btn");
    if (addBtn && !addBtn._hasHandler) {
      addBtn._hasHandler = true;
      addBtn.addEventListener("click", () => {
        openSidePeekDrawer(null, columnId);
      });
    }
  }

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

    const addChecklistBtn = document.getElementById("drawer-add-checklist-btn");
    if (addChecklistBtn) {
      addChecklistBtn.addEventListener("click", () => {
        addChecklistRow("", false);
      });
    }
  }

  function openSidePeekDrawer(task = null, defaultColumnId = "backlogs") {
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

  // ==========================================================================
  // 6. APPLICATION BOOTSTRAP & TABS
  // ==========================================================================
  function updateScoutDatabaseBadge() {
    const count = getScoutCount();
    const badge = document.getElementById("scout-count-badge");
    const tabBadge = document.getElementById("scout-tab-badge");
    const formatted = count >= 1000 ? (count / 1000).toFixed(1) + "k" : count;

    if (badge) badge.textContent = formatted;
    if (tabBadge) tabBadge.textContent = count.toLocaleString();
  }

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
    document.querySelectorAll(".nav-item[data-tab]").forEach(nav => {
      nav.classList.toggle("active", nav.getAttribute("data-tab") === tabId);
    });

    document.querySelectorAll(".notion-tab[data-tab]").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-tab") === tabId);
    });

    document.querySelectorAll(".view-container").forEach(view => {
      view.classList.toggle("active", view.id === tabId);
    });

    appState.setActiveTab(tabId);

    if (tabId === "scout-tab") {
      renderScoutsDirectoryList();
    }
  }

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

    const resetDefaultsBtn = document.getElementById("btn-reset-defaults");
    if (resetDefaultsBtn) {
      resetDefaultsBtn.addEventListener("click", () => {
        if (confirm("Reset all templates back to default initial templates?")) {
          appState.resetToDefaults();
          showToast("Templates reset to defaults");
          closeModal();
          location.reload();
        }
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

  function setupGlobalHotkeys() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        const collapseBtn = document.getElementById("collapse-sidebar-btn");
        if (collapseBtn) collapseBtn.click();
        return;
      }

      if (e.ctrlKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        const themeBtn = document.getElementById("theme-btn");
        if (themeBtn) themeBtn.click();
        return;
      }

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

  // ==========================================================================
  // 7. INITIALIZE
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", async () => {
    await initScoutService();
    updateScoutDatabaseBadge();

    initKanban();
    initCommentHelper();

    setupTabNavigation();
    setupSidebar();
    setupTheme();
    setupScratchpad();
    setupScoutsDirectory();
    setupBackupAndSettings();
    setupGlobalHotkeys();
  });
})();
