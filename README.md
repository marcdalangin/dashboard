# Personal Work Dashboard

A Notion-styled personal dashboard website designed for sports data operations, shift task execution, and rapid comment templating with built-in scout referencing, rebuilt with **Next.js (App Router) + React** and **Neon Serverless Postgres** for free remote workstation synchronization.

![Dashboard Preview](https://img.shields.io/badge/UI-Notion%20Monochrome-black?style=flat-square)
![Framework](https://img.shields.io/badge/Framework-Next.js%2014%20%2B%20React%2018-black?style=flat-square&logo=next.js)
![Database](https://img.shields.io/badge/Remote%20Sync-Neon%20Serverless%20Postgres-green?style=flat-square&logo=postgresql)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20Ready-black?style=flat-square&logo=vercel)

---

## Features

### 1. 💬 Comment Helper
- **Scout List Reference**: Indexed over 30,477+ scouts with instant prefix & substring autocomplete.
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
- **HTML5 Drag & Drop**: Native drag-and-drop between and within columns on desktop.
- **Mobile Segmented Column Navigation**: Switch between columns via smooth touch pill tabs or horizontal swipe snap without card cramping.
- **Quick Action Move Controls**: One-click advance (`→`, `←`, `✕`).
- **Notion Side-Peek Drawer**: Slide-in task details panel (desktop) or full-screen bottom sheet (mobile) for priority levels (`High`, `Medium`, `Low`), scout assignment with autocomplete, checklist/subtasks with completion counters, and markdown notes.

### 3. 📝 Shift Scratchpad & Handover Notes
- Auto-saving temporary notepad for match IDs, shift handovers, and quick scratch calculations.
- Live word, line, and character counters.

### 4. 👥 Scouts Directory
- Full searchable database of 30,477+ scouts with pagination and one-click full name and first name copying.

### 5. 🎨 Notion-Inspired Aesthetic & Mobile Responsiveness
- Strict monochrome aesthetic (pure black `#0a0a0a` / white `#ffffff` with 9-step gray ramp).
- Dual light/dark theme tokens via `light-dark()` with `Ctrl + D` hotkey.
- Collapsible sidebar (`Ctrl + \`) on desktop, converting to a slide-in drawer on mobile (`< 768px`).
- Quick search (`Ctrl + K` or `/`).
- Escape key handling (`Esc` closes modals/drawers).
- Touch-friendly 44px minimum tap targets on mobile viewports.

### 6. ☁️ Remote Synchronization & Persistence
- **Neon Serverless Postgres**: Free remote cloud sync via Next.js `/api/sync` Route Handlers, syncing your dashboard across home and office workstations through your SMP email identity.
- **Local Fallback**: Automatically caches all tasks, templates, scratchpad notes, and preferences to browser `localStorage` for offline resilience.
- **Backup & Portability**: Full JSON export and import backup tools under **Settings & Backup** (`⚙️`).

---

## Local Development & Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

### 3. Run Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## Remote Sync Setup (Neon Serverless Postgres)

To enable free multi-workstation sync:

1. Create a free account at [Neon.tech](https://neon.tech) and create a Postgres project.
2. In your local `.env.local` (or in Vercel Project Environment Variables), add:
   ```env
   DATABASE_URL="postgres://<user>:<password>@<endpoint>.neon.tech/neondb?sslmode=require"
   ```
3. In the dashboard, click **Settings & Backup** (`⚙️`), enter your SMP work email, and click **Save Email**.
4. Your workstation is now automatically synced to Neon Postgres! Any changes made in the office will be reflected when you open the dashboard at home.

---

## Deployment on Vercel

This repository is ready for immediate 1-click deployment on [Vercel](https://vercel.com):

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `dashboard` repository.
4. Framework Preset will be automatically detected as **Next.js**.
5. Add `DATABASE_URL` under Environment Variables (if using Neon Postgres remote sync).
6. Click **Deploy** &mdash; your dashboard is live!
