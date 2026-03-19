import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildOidcClient, handleCallback, startLogin } from "./services/auth.js";
import { getCurrentWeekStartIso, weekdaysFromMonday } from "./date-utils.js";
import { getSubmission, upsertSubmission } from "./data/store.js";
import { runReportJob, scheduleDailyReport } from "./services/scheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" }
  })
);

app.use(express.static(path.resolve(__dirname, "../public")));

let oidcClient;

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  next();
}

app.get("/auth/login", async (req, res) => {
  if (!oidcClient) {
    return res.status(500).send("OIDC client ikke initialisert.");
  }
  return startLogin(req, res, oidcClient);
});

app.get("/auth/callback", async (req, res) => {
  if (!oidcClient) {
    return res.status(500).send("OIDC client ikke initialisert.");
  }

  try {
    await handleCallback(req, res, oidcClient);
  } catch (err) {
    console.error("Auth callback error:", err.message);
    res.status(500).send("Login feilet.");
  }
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

app.get("/api/week", requireAuth, async (req, res) => {
  const weekStart = getCurrentWeekStartIso();
  const weekdays = weekdaysFromMonday(new Date(weekStart));
  const existing = await getSubmission(req.session.user.email, weekStart);

  res.json({
    weekStart,
    weekdays,
    days: existing?.days || Object.fromEntries(weekdays.map((d) => [d.key, false]))
  });
});

app.post("/api/week", requireAuth, async (req, res) => {
  const weekStart = getCurrentWeekStartIso();
  const weekdays = weekdaysFromMonday(new Date(weekStart));

  const inputDays = req.body?.days || {};
  const normalizedDays = {};

  weekdays.forEach((d) => {
    normalizedDays[d.key] = Boolean(inputDays[d.key]);
  });

  const entry = {
    email: req.session.user.email,
    name: req.session.user.name,
    weekStart,
    days: normalizedDays,
    updatedAt: new Date().toISOString()
  };

  await upsertSubmission(entry);
  res.json({ ok: true, entry });
});

app.post("/api/admin/run-report", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (!process.env.ADMIN_TRIGGER_TOKEN || token !== process.env.ADMIN_TRIGGER_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await runReportJob();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/", requireAuth, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/app.html"));
});

app.listen(port, async () => {
  scheduleDailyReport();

  try {
    oidcClient = await buildOidcClient();
    console.log(`Server kjorer pa http://localhost:${port}`);
  } catch (err) {
    console.error("Kunne ikke starte OIDC client:", err.message);
    console.error("Serveren er oppe, men auth virker ikke for env er satt riktig.");
  }
});
