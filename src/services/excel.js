import ExcelJS from "exceljs";
import path from "node:path";
import fs from "node:fs/promises";
import { weekdaysFromMonday } from "../date-utils.js";

export async function buildWeeklyExcel(weekStart, submissions, menu = {}) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Lunsjstatus");

  const weekdays = weekdaysFromMonday(new Date(weekStart));

  sheet.columns = [
    { header: "E-post", key: "email", width: 35 },
    ...weekdays.map((d) => ({ header: d.label, key: d.key, width: 22 }))
  ];

  const menuRow = { email: "Meny" };
  weekdays.forEach((d) => {
    menuRow[d.key] = menu[d.key] || "";
  });
  sheet.addRow(menuRow);

  submissions.forEach((submission) => {
    const row = { email: submission.email };
    weekdays.forEach((d) => {
      // Tom celle betyr ikke pa jobb.
      row[d.key] = submission.days[d.key] ? "Pa jobb" : "";
    });
    sheet.addRow(row);
  });

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(2).font = { italic: true, color: { argb: "FF4F4F4F" } };

  await fs.mkdir(path.resolve("temp"), { recursive: true });
  const filename = `lunsjrapport-${weekStart}.xlsx`;
  const filePath = path.resolve("temp", filename);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}
