const DISH_BANK = [
  "Kremet tomatsuppe med focaccia",
  "Kylling tikka med ris",
  "Fiskekaker med rotmos",
  "Pasta pesto med parmesan",
  "Vegetarlasagne med salat",
  "Chili sin carne med nachos",
  "Laks med ovnsbakte poteter",
  "Burger med coleslaw",
  "Ramen med egg og sopp",
  "Tacobowl med limecreme"
];

function weekSeed(weekStart) {
  return weekStart
    .split("-")
    .map((n) => Number(n) || 0)
    .reduce((sum, n) => sum + n, 0);
}

export function buildSampleMenu(weekStart, weekdays) {
  const seed = weekSeed(weekStart);
  const menu = {};

  weekdays.forEach((d, i) => {
    const idx = (seed + i * 3) % DISH_BANK.length;
    menu[d.key] = DISH_BANK[idx];
  });

  return menu;
}
