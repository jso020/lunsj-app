import { getCurrentWeekStartIso, weekdaysFromMonday } from "../date-utils.js";
import { getSubmissionsByWeek } from "../data/store.js";
import { buildWeeklyExcel } from "./excel.js";
import { sendWeeklyEmail } from "./email.js";

function msUntilNextEight() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(8, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

async function runReportJob() {
  const weekStart = getCurrentWeekStartIso();
  const submissions = await getSubmissionsByWeek(weekStart);

  if (submissions.length === 0) {
    console.log(`[scheduler] Ingen registreringer for uke ${weekStart}. Hopper over utsending.`);
    return;
  }

  const excelPath = await buildWeeklyExcel(weekStart, submissions);
  await sendWeeklyEmail({ weekStart, excelPath });
  console.log(`[scheduler] Sendte rapport for uke ${weekStart} til mottaker.`);
}

export function scheduleDailyReport() {
  const firstWait = msUntilNextEight();

  setTimeout(async function start() {
    try {
      await runReportJob();
    } catch (err) {
      console.error("[scheduler] Feil ved rapportjobb:", err.message);
    }

    setInterval(async () => {
      try {
        await runReportJob();
      } catch (err) {
        console.error("[scheduler] Feil ved rapportjobb:", err.message);
      }
    }, 24 * 60 * 60 * 1000);
  }, firstWait);
}

export { runReportJob };
