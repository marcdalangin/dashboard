export type Priority = "Low" | "Medium" | "High";

export type ColumnId = "backlogs" | "todo" | "in-progress" | "blocked" | "done";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
  priority: Priority;
  scout: string;
  tags: string[];
  checklist: ChecklistItem[];
  createdAt: number;
}

export interface Template {
  id: string;
  title: string;
  category: "all" | "scout-direct" | "allocation" | "status" | "custom";
  body: string;
  pinned: boolean;
}

export interface HistoryItem {
  id: string;
  text: string;
  templateTitle: string;
  timestamp: number;
}

export interface DashboardSettings {
  theme: "light" | "dark";
  useFirstNameOnly: boolean;
  activeTab: "kanban-tab" | "comment-tab" | "scratchpad-tab" | "scout-tab";
  sidebarCollapsed: boolean;
  selectedScout: string;
  userEmail?: string;
  remoteSyncEnabled?: boolean;
}

export interface DashboardState {
  tasks: Task[];
  templates: Template[];
  settings: DashboardSettings;
  scratchpad: string;
  history: HistoryItem[];
}
