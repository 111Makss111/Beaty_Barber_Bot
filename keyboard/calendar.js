// keyboard/calendar.js

const { Markup } = require("telegraf");
const { getTranslation } = require("../data/translations");
const { getSchedule } = require("../data/data");

const getCalendarInlineKeyboard = (year, month, lang, isAdminMode = false) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const monthNames = getTranslation("month_names", lang);
  const weekdayShortNames = getTranslation("weekday_short", lang);
  const schedule = getSchedule();

  const calendar = [];

  calendar.push(
    weekdayShortNames.map((day) =>
      Markup.button.callback(day, "ignore_weekday")
    )
  );

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const numDaysInMonth = lastDayOfMonth.getDate();
  let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  let day = 1;
  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startDayOfWeek) {
        week.push(Markup.button.callback(" ", "ignore_empty"));
      } else if (day <= numDaysInMonth) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        const dateString = `${year}-${(month + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        let buttonText = day.toString();
        let callbackData = isAdminMode
          ? `admin_date_${dateString}`
          : `date_${dateString}`;

        if (date < today) {
          buttonText = "✖️";
          callbackData = "ignore_past_date";
        } else if (!isAdminMode) {
          // Логіка для клієнтського режиму: позначаємо повністю зайняті дати
          const daySchedule = schedule[dateString];
          if (daySchedule) {
            const allPossibleSlots = [];
            for (let h = 9; h <= 18; h++) {
              for (let m = 0; m < 60; m += 30) {
                if (h === 18 && m > 0) continue;
                allPossibleSlots.push(
                  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
                );
              }
            }

            let allSlotsUnavailable = true;
            if (allPossibleSlots.length > 0) {
              for (const slot of allPossibleSlots) {
                const slotInfo = daySchedule[slot];
                if (
                  !slotInfo ||
                  (slotInfo.status !== "booked" &&
                    slotInfo.status !== "blocked_admin")
                ) {
                  allSlotsUnavailable = false;
                  break;
                }
              }
            } else {
              allSlotsUnavailable = false;
            }

            if (allSlotsUnavailable && allPossibleSlots.length > 0) {
              buttonText = "✖️";
              callbackData = "ignore_fully_booked";
            }
          }
        } else {
          // Логіка для адмінського режиму:
          // Якщо дата повністю заблокована адміном, також показуємо хрестик
          const daySchedule = schedule[dateString];
          if (daySchedule) {
            const allPossibleSlots = [];
            for (let h = 9; h <= 18; h++) {
              for (let m = 0; m < 60; m += 30) {
                if (h === 18 && m > 0) continue;
                allPossibleSlots.push(
                  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
                );
              }
            }

            let isFullDayBlockedByAdmin = true;
            if (allPossibleSlots.length > 0) {
              for (const slot of allPossibleSlots) {
                const slotInfo = daySchedule[slot];
                if (!slotInfo || slotInfo.status !== "blocked_admin") {
                  // Перевіряємо, чи всі слоти заблоковані саме адміном
                  isFullDayBlockedByAdmin = false;
                  break;
                }
              }
            } else {
              isFullDayBlockedByAdmin = false; // Якщо немає можливих слотів, день не може бути "повністю заблокований"
            }

            if (isFullDayBlockedByAdmin && allPossibleSlots.length > 0) {
              buttonText = "✖️"; // Позначаємо дату як повністю заблоковану адміном
            }
          }
        }

        week.push(Markup.button.callback(buttonText, callbackData));
        day++;
      } else {
        week.push(Markup.button.callback(" ", "ignore_empty"));
      }
    }
    calendar.push(week);
    if (day > numDaysInMonth) break;
  }

  const navRow = [
    Markup.button.callback(
      getTranslation("button_prev_month", lang),
      isAdminMode
        ? `cal_admin_prev_${year}_${month}`
        : `cal_prev_${year}_${month}`
    ),
    Markup.button.callback(
      `${monthNames[month]} ${year}`,
      "ignore_month_display"
    ),
    Markup.button.callback(
      getTranslation("button_next_month", lang),
      isAdminMode
        ? `cal_admin_next_${year}_${month}`
        : `cal_next_${year}_${month}`
    ),
  ];
  calendar.unshift(navRow);

  if (isAdminMode) {
    calendar.push([
      Markup.button.callback(
        getTranslation("button_back_to_admin_menu", lang),
        "back_to_admin_main_menu"
      ),
    ]);
  } else {
    calendar.push([
      Markup.button.callback(
        getTranslation("button_back_to_services", lang),
        "back_to_services_from_calendar"
      ),
    ]);
  }

  return Markup.inlineKeyboard(calendar);
};

module.exports = {
  getCalendarInlineKeyboard,
};
