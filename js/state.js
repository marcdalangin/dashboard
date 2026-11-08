// ==========================================================================
// Central State Management & Persistence (Local Storage)
// ==========================================================================

const STORAGE_KEY = "notion_dashboard_state_v1";

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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          tasks: parsed.tasks || DEFAULT_TASKS,
          columns: DEFAULT_COLUMNS,
          templates: parsed.templates || DEFAULT_TEMPLATES,
          settings: {
            theme: parsed.settings?.theme || "light",
            useFirstNameOnly: parsed.settings?.useFirstNameOnly !== undefined ? parsed.settings.useFirstNameOnly : true,
            activeTab: parsed.settings?.activeTab || "kanban-tab",
            sidebarCollapsed: parsed.settings?.sidebarCollapsed || false,
            selectedScout: parsed.settings?.selectedScout || "Aaron Garcia"
          },
          scratchpad: parsed.scratchpad !== undefined ? parsed.scratchpad : "Shift notes:\n- Review coverage applications\n- Confirm court 2 device status\n",
          history: parsed.history || []
        };
      }
    } catch (e) {
      console.warn("Failed to parse saved state:", e);
    }

    return {
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
      scratchpad: "Shift notes:\n- Review coverage applications\n- Confirm court 2 device status\n",
      history: []
    };
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

  // --- Task Methods ---
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

  // --- Template Methods ---
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

  // --- Clipboard History ---
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

  // --- Scratchpad ---
  updateScratchpad(text) {
    this.state.scratchpad = text;
    this.save();
  }

  // --- Settings ---
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

  // --- Export & Import ---
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

export const appState = new StateManager();
