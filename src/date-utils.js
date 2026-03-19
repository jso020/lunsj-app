export function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toIsoDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekdaysFromMonday(monday) {
  const labels = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return { key: toIsoDate(d), label };
  });
}

export function getWeekStartIso(weekOffset = 0) {
  const monday = getMonday();
  const target = addDays(monday, weekOffset * 7);
  return toIsoDate(target);
}

export function getCurrentWeekStartIso() {
  return getWeekStartIso(0);
}

export function resolveWeekStart(input) {
  if (input === "next") return getWeekStartIso(1);
  return getWeekStartIso(0);
}
