# Personal Work Dashboard

A Notion-styled personal dashboard website designed for sports data operations, shift task execution, and rapid comment templating with built-in scout referencing.

![Dashboard Preview](https://img.shields.io/badge/UI-Notion%20Style-black?style=flat-square)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20Ready-black?style=flat-square&logo=vercel)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20HTML%2FCSS%2FJS)-green?style=flat-square)

---

## Features

### 1. 💬 Comment Helper
- **Scout List Reference**: Indexed over 30,400+ scouts with instant prefix & substring autocomplete.
- **"Use First Name Only" Toggle**: Smart name parser that converts full names (e.g. `Aaron Garcia` &rarr; `Aaron`, `Morales, Ignacio` &rarr; `Ignacio`, `Chitgar/Carter` &rarr; `Chitgar`) with a 1-click toggle.
- **Variable Fill Modal & Live Preview**: Real-time message preview before copying.
- **One-Click Copy**: Instant clipboard copying with authentic Notion floating toast notifications.
- **Template Management**: Pre-made templates for Allocations, Direct Scout Messages, Status Reviews, and custom user-created templates.

### 2. 📊 5-Column Kanban Board
- **Workflow Columns**:
  - 📁 **Backlogs**
  - 📝 **To-do**
  - ⚡ **In Progress**
  - ⛔ **Blocked** (high-visibility blocker indicator)
  - ✅ **Done**
- **HTML5 Drag & Drop**: Native drag-and-drop between and within columns.
- **Quick Action Move Controls**: One-click advance (`→`, `←`, `⛔`, `✓`).
- **Notion Side-Peek Drawer**: Slide-in task details panel for priority levels (`High`, `Medium`, `Low`), scout assignment, checklist/subtasks with completion counters, and markdown notes.

### 3. 📝 Shift Scratchpad
- Auto-saving temporary notepad for match IDs, shift handovers, and quick scratch calculations.

### 4. 👥 Scouts Directory
- Full searchable database of 30,400+ scouts with one-click full name and first name copying.

### 5. 🎨 Notion-Inspired Aesthetic
- Authentic Notion light mode (`#ffffff`) and dark mode (`#191919`).
- Collapsible sidebar (`Ctrl + \`).
- Quick search (`Ctrl + K` or `/`).
- Theme toggle (`Ctrl + D`).
- Escape key handling (`Esc` closes modals/drawers).

### 6. 💾 Persistence & Backup
- Automatically saves all tasks, templates, scratchpad notes, and preferences to browser `localStorage`.
- Full JSON export and import backup tools under **Settings & Backup** (`⚙️`).

---

## Local Development & Usage

No build tools or Node.js required!

- Simply double-click `index.html` or `Launch Dashboard.bat` to run locally in any browser.

---

## Deployment on Vercel

This repository is ready for immediate 1-click deployment on [Vercel](https://vercel.com):

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `dashboard` repository.
4. Leave all build settings at default (Static Site).
5. Click **Deploy** &mdash; your dashboard is live!
