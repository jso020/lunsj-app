export function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toIsoDate(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export function weekdaysFromMonday(monday) {
  const labels = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return { key: toIsoDate(d), label };
  });
}

export function getCurrentWeekStartIso() {
  return toIsoDate(getMonday());
}
