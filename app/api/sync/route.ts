import { NextRequest, NextResponse } from "next/server";
import { getDb, isNeonConfigured } from "@/lib/db/neon";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
  }

  if (!isNeonConfigured()) {
    return NextResponse.json({
      configured: false,
      message: "Neon DATABASE_URL is not configured. Falling back to local storage.",
    });
  }

  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ configured: false, message: "Database connection unavailable." });
  }

  try {
    // 1. Fetch user profile
    const users = await sql`
      SELECT settings, scratchpad, COALESCE(categories, '[]'::jsonb) as categories
      FROM users WHERE email = ${email} LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ configured: true, state: null });
    }

    const user = users[0];

    // 2. Fetch tasks
    const tasks = await sql`
      SELECT id, title, description, column_id as "columnId", priority, scout, tags, checklist, created_at as "createdAt"
      FROM tasks WHERE user_email = ${email} ORDER BY created_at DESC
    `;

    // 3. Fetch templates
    const templates = await sql`
      SELECT id, title, category, body, pinned
      FROM templates WHERE user_email = ${email} ORDER BY pinned DESC, created_at DESC
    `;

    return NextResponse.json({
      configured: true,
      state: {
        tasks,
        templates,
        categories: user.categories,
        settings: user.settings,
        scratchpad: user.scratchpad,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database query failed";
    console.error("Neon GET /api/sync failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, state } = body;

    if (!email || !state) {
      return NextResponse.json({ error: "Missing email or state payload" }, { status: 400 });
    }

    if (!isNeonConfigured()) {
      return NextResponse.json({
        configured: false,
        message: "Neon DATABASE_URL is not configured. Saved locally.",
      });
    }

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ configured: false, message: "Database connection unavailable." });
    }

    // Ensure tables exist and alter if needed
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        settings JSONB NOT NULL DEFAULT '{}'::jsonb,
        scratchpad TEXT NOT NULL DEFAULT '',
        categories JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS categories JSONB NOT NULL DEFAULT '[]'::jsonb;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(64) PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        column_id VARCHAR(32) NOT NULL,
        priority VARCHAR(16) NOT NULL DEFAULT 'Medium',
        scout TEXT NOT NULL DEFAULT '',
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at BIGINT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(64) PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        category VARCHAR(64) NOT NULL,
        body TEXT NOT NULL,
        pinned BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 1. Upsert user
    await sql`
      INSERT INTO users (email, settings, scratchpad, categories, updated_at)
      VALUES (
        ${email},
        ${JSON.stringify(state.settings || {})},
        ${state.scratchpad || ""},
        ${JSON.stringify(state.categories || [])},
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        settings = EXCLUDED.settings,
        scratchpad = EXCLUDED.scratchpad,
        categories = EXCLUDED.categories,
        updated_at = NOW()
    `;

    // 2. Batch update tasks for user
    if (Array.isArray(state.tasks)) {
      await sql`DELETE FROM tasks WHERE user_email = ${email}`;
      for (const t of state.tasks) {
        await sql`
          INSERT INTO tasks (id, user_email, title, description, column_id, priority, scout, tags, checklist, created_at)
          VALUES (
            ${t.id},
            ${email},
            ${t.title || ""},
            ${t.description || ""},
            ${t.columnId || "backlogs"},
            ${t.priority || "Medium"},
            ${t.scout || ""},
            ${JSON.stringify(t.tags || [])},
            ${JSON.stringify(t.checklist || [])},
            ${t.createdAt || Date.now()}
          )
        `;
      }
    }

    // 3. Batch update templates for user
    if (Array.isArray(state.templates)) {
      await sql`DELETE FROM templates WHERE user_email = ${email}`;
      for (const tpl of state.templates) {
        await sql`
          INSERT INTO templates (id, user_email, title, category, body, pinned)
          VALUES (
            ${tpl.id},
            ${email},
            ${tpl.title || ""},
            ${tpl.category || "custom"},
            ${tpl.body || ""},
            ${tpl.pinned || false}
          )
        `;
      }
    }

    return NextResponse.json({ configured: true, syncedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync write failed";
    console.error("Neon POST /api/sync failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
