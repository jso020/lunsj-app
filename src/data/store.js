import fs from "node:fs/promises";
import path from "node:path";

const DB_PATH = path.resolve("src/data/submissions.json");

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify({ submissions: [] }, null, 2), "utf8");
  }
}

export async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(data) {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
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
