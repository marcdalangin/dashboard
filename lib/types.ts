export type Priority = "Low" | "Medium" | "High";

export type ColumnId = "backlogs" | "todo" | "in-progress" | "blocked" | "done";

export type CategoryColor = "blue" | "green" | "amber" | "rose" | "purple" | "neutral";

export interface TemplateCategory {
  id: string;
  name: string;
  color: CategoryColor;
}

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
  category: string;
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
  categories: TemplateCategory[];
  settings: DashboardSettings;
  scratchpad: string;
  history: HistoryItem[];
}
