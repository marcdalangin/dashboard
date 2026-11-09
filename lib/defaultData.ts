import { Task, Template, ColumnId, TemplateCategory } from "./types";

export const DEFAULT_COLUMNS: { id: ColumnId; title: string; dotColor: string }[] = [
  { id: "backlogs", title: "Backlogs", dotColor: "bg-neutral-400" },
  { id: "todo", title: "To-do", dotColor: "bg-blue-500" },
  { id: "in-progress", title: "In Progress", dotColor: "bg-amber-500" },
  { id: "blocked", title: "Blocked", dotColor: "bg-rose-500" },
  { id: "done", title: "Done", dotColor: "bg-emerald-500" },
];

export const DEFAULT_TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: "scout-direct", name: "Direct Scout", color: "blue" },
  { id: "allocation", name: "Allocations", color: "green" },
  { id: "status", name: "Status Review", color: "amber" },
  { id: "custom", name: "Custom", color: "neutral" },
];

export const DEFAULT_TASKS: Task[] = [];

export const DEFAULT_TEMPLATES: Template[] = [];
