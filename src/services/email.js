import nodemailer from "nodemailer";

export async function sendWeeklyEmail({ weekStart, excelPath }) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    REPORT_TO_EMAIL,
    REPORT_FROM_EMAIL
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !REPORT_TO_EMAIL || !REPORT_FROM_EMAIL) {
    throw new Error("Missing SMTP or report email configuration in environment.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });

  await transporter.sendMail({
    from: REPORT_FROM_EMAIL,
    to: REPORT_TO_EMAIL,
    subject: `Lunsjrapport uke som starter ${weekStart}`,
    text: `Se vedlagt rapport for uke ${weekStart}.`,
    attachments: [
      {
        filename: `lunsjrapport-${weekStart}.xlsx`,
        path: excelPath
      }
    ]
  });
}
