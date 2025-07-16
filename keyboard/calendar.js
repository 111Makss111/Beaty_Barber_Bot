const { Markup } = require("telegraf");
const { getTranslation } = require("../data/translations");
const { getSchedule } = require("../data/data"); // Для отримання заблокованих/зайнятих слотів

/**
 * Генерує інлайн-клавіатуру календаря для заданого місяця.
 * @param {number} year - Рік для відображення.
 * @param {number} month - Місяць для відображення (0-11).
 * @param {string} lang - Мовний код ('ua' або 'pl').
 * @returns {Object} Telegraf InlineKeyboardMarkup.
 */
const getCalendarInlineKeyboard = (year, month, lang) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const monthNames = getTranslation("month_names", lang);
  const weekdayShortNames = getTranslation("weekday_short", lang);
  const schedule = getSchedule(); // Отримуємо весь розклад

  const calendar = [];

  // Рядок з назвами днів тижня
  calendar.push(
    weekdayShortNames.map((day) => Markup.button.callback(day, "ignore"))
  ); // 'ignore' для неактивних кнопок

  // Перший день місяця
  const firstDayOfMonth = new Date(year, month, 1);
  // Останній день місяця
  const lastDayOfMonth = new Date(year, month + 1, 0);
  // Кількість днів у місяці
  const numDaysInMonth = lastDayOfMonth.getDate();
  // День тижня першого дня місяця (0 - Нд, 1 - Пн, ..., 6 - Сб). Переводимо до 0 - Сб, 1 - Нд...
  let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Понеділок = 0, Неділя = 6

  let day = 1;
  for (let i = 0; i < 6; i++) {
    // Максимум 6 тижнів в місяці
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startDayOfWeek) {
        // Пусті клітинки до першого дня місяця
        week.push(Markup.button.callback(" ", "ignore"));
      } else if (day <= numDaysInMonth) {
        const date = new Date(year, month, day);
        const dateString = `${year}-${(month + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        let buttonText = day.toString();
        let callbackData = `date_${dateString}`;
        let isDisabled = false;

        // Перевірка на минулу дату
        if (
          year < currentYear ||
          (year === currentYear && month < currentMonth) ||
          (year === currentYear && month === currentMonth && day < currentDay)
        ) {
          isDisabled = true;
          buttonText = "✖️"; // Або інший маркер для неактивних минулих дат
          callbackData = "ignore";
        } else {
          // Перевірка на зайнятість/блокування (з _schedule)
          if (
            schedule[dateString] &&
            Object.keys(schedule[dateString]).length > 0
          ) {
            const hasBookedSlots = Object.values(schedule[dateString]).some(
              (slot) => slot.status === "booked"
            );
            const hasBlockedSlots = Object.values(schedule[dateString]).some(
              (slot) => slot.status === "blocked_admin"
            );

            if (hasBookedSlots || hasBlockedSlots) {
              // Якщо є хоча б один занятий або заблокований слот, то дата позначається
              buttonText += " 🚫"; // Наприклад, емоджі для заблокованих/зайнятих дат
              // Callback залишається, але обробник має враховувати, що може бути часткова доступність
              // Або, якщо всі слоти зайняті/заблоковані, зробити кнопку неактивною
              // Наразі просто маркуємо, логіка перевірки годин буде пізніше
            }
          }
        }

        week.push(Markup.button.callback(buttonText, callbackData));
        day++;
      } else {
        // Пусті клітинки після останнього дня місяця
        week.push(Markup.button.callback(" ", "ignore"));
      }
    }
    calendar.push(week);
    if (day > numDaysInMonth) break; // Виходимо, якщо всі дні місяця додані
  }

  // Рядок навігації місяцями
  const navRow = [
    Markup.button.callback(
      getTranslation("button_prev_month", lang),
      `cal_prev_${year}_${month}`
    ),
    Markup.button.callback(`${monthNames[month]} ${year}`, "ignore"), // Поточний місяць і рік (неклікабельний)
    Markup.button.callback(
      getTranslation("button_next_month", lang),
      `cal_next_${year}_${month}`
    ),
  ];
  calendar.unshift(navRow); // Додаємо на початок

  // Кнопка "Повернутись до послуг"
  calendar.push([
    Markup.button.callback(
      getTranslation("button_back_to_services", lang),
      "back_to_services_from_calendar"
    ),
  ]);

  return Markup.inlineKeyboard(calendar);
};

module.exports = {
  getCalendarInlineKeyboard,
};
