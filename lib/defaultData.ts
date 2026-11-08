import { Task, Template, ColumnId } from "./types";

export const DEFAULT_COLUMNS: { id: ColumnId; title: string; dotColor: string }[] = [
  { id: "backlogs", title: "Backlogs", dotColor: "bg-neutral-400" },
  { id: "todo", title: "To-do", dotColor: "bg-blue-500" },
  { id: "in-progress", title: "In Progress", dotColor: "bg-amber-500" },
  { id: "blocked", title: "Blocked", dotColor: "bg-rose-500" },
  { id: "done", title: "Done", dotColor: "bg-emerald-500" },
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Review TT Cup Hall schedules",
    description: "Verify court availability and hall assignments for evening matches.",
    columnId: "backlogs",
    priority: "Low",
    scout: "",
    tags: ["Scheduling"],
    checklist: [
      { id: "c1", text: "Check Hall 1 & 2 list", done: false },
      { id: "c2", text: "Confirm referee roster", done: false }
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
      { id: "c3", text: "Check tournament bracket", done: true },
      { id: "c4", text: "Send allocation message", done: false }
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
      { id: "c5", text: "Confirm kick-off / first serve", done: true },
      { id: "c6", text: "Track point sequence review", done: false }
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
      { id: "c7", text: "Ping scout via Direct Message", done: true },
      { id: "c8", text: "Check operator failover feed", done: false }
    ],
    createdAt: Date.now() - 3600000
  },
  {
    id: "task-8",
    title: "Shift Handover checklist setup",
    description: "All pending issues and unresolved matches recorded in shift notes.",
    columnId: "done",
    priority: "Low",
    scout: "",
    tags: ["Setup"],
    checklist: [
      { id: "c9", text: "Export daily log", done: true }
    ],
    createdAt: Date.now() - 1800000
  }
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "tpl-1",
    title: "Coverage Allocation Confirmation",
    category: "allocation",
    body: "Hi [Scout Name],\n\nYou have been allocated to cover the upcoming match [Match ID] scheduled at [Match Time]. Please ensure you connect your scout terminal at least 15 minutes before kick-off.\n\nThank you!",
    pinned: true
  },
  {
    id: "tpl-2",
    title: "Direct Scout Urgent Ping",
    category: "scout-direct",
    body: "Hi [Scout Name],\n\nWe detected a latency delay / connection drop on your feed for match [Match ID]. Could you please confirm device battery and cellular signal status as soon as possible?",
    pinned: true
  },
  {
    id: "tpl-3",
    title: "Match Incident Follow-Up",
    category: "status",
    body: "Hello [Scout Name],\n\nRegarding the incident at minute [Minute] in match [Match ID]: Please provide a short summary of referee stoppage or on-court event for shift audit logging.\n\nBest regards,\nMatch Operations",
    pinned: false
  },
  {
    id: "tpl-4",
    title: "Post-Match Verification Sign-off",
    category: "status",
    body: "Hi [Scout Name],\n\nMatch [Match ID] has concluded. All point sequences and final scores have been verified against official referee sheets. Excellent work today!",
    pinned: false
  },
  {
    id: "tpl-5",
    title: "Replacement Scout Query",
    category: "allocation",
    body: "Dear [Scout Name],\n\nAre you available on short notice to cover [Tournament] today starting at [Time]? Please respond promptly so we can assign credentials.",
    pinned: false
  }
];
