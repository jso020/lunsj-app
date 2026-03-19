import fs from "node:fs/promises";
import path from "node:path";

const DB_PATH = path.resolve("src/data/submissions.json");

function normalizeDbShape(data) {
  return {
    submissions: Array.isArray(data?.submissions) ? data.submissions : [],
    menus: Array.isArray(data?.menus) ? data.menus : []
  };
}

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify({ submissions: [], menus: [] }, null, 2), "utf8");
  }
}

export async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  const normalized = raw.replace(/^\uFEFF/, "");
  return normalizeDbShape(JSON.parse(normalized));
}

export async function writeDb(data) {
  await ensureDb();
  const normalized = normalizeDbShape(data);
  await fs.writeFile(DB_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

export async function upsertSubmission(entry) {
  const db = await readDb();
  const idx = db.submissions.findIndex(
    (item) => item.email === entry.email && item.weekStart === entry.weekStart
  );

  if (idx >= 0) {
    db.submissions[idx] = entry;
  } else {
    db.submissions.push(entry);
  }

  await writeDb(db);
  return entry;
}

export async function getSubmission(email, weekStart) {
  const db = await readDb();
  return db.submissions.find((item) => item.email === email && item.weekStart === weekStart);
}

export async function getSubmissionsByWeek(weekStart) {
  const db = await readDb();
  return db.submissions.filter((item) => item.weekStart === weekStart);
}

export async function getMenuForWeek(weekStart) {
  const db = await readDb();
  return db.menus.find((item) => item.weekStart === weekStart) || null;
}

export async function upsertMenuForWeek(weekStart, dishes, updatedBy) {
  const db = await readDb();
  const entry = {
    weekStart,
    dishes,
    updatedBy,
    updatedAt: new Date().toISOString()
  };

  const idx = db.menus.findIndex((item) => item.weekStart === weekStart);
  if (idx >= 0) {
    db.menus[idx] = entry;
  } else {
    db.menus.push(entry);
  }

  await writeDb(db);
  return entry;
}
