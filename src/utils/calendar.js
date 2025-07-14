const { Markup } = require("telegraf");
const { getMessage } = require("./i18n");

/**
 * Генерує інлайн-клавіатуру календаря для заданого місяця та року.
 * @param {number} year - Рік для відображення.
 * @param {number} month - Місяць для відображення (0-11).
 * @param {object} ctx - Об'єкт контексту Telegraf для отримання мови.
 * @returns {object} Inline-клавіатура Telegraf.
 */
function generateCalendar(year, month, ctx) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const monthNames = getMessage(ctx, "monthNames");
  const dayNames = getMessage(ctx, "dayNames");

  const monthName = monthNames[month];
  const header = `${monthName} ${year}`;

  const keyboard = [];

  // Рядок з днями тижня
  const dayNamesRow = dayNames.map((day) =>
    Markup.button.callback(day, "ignore_calendar_day")
  );
  keyboard.push(dayNamesRow);

  // Дні місяця
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const numDays = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  let week = Array(7).fill(
    Markup.button.callback(" ", "ignore_calendar_empty")
  );

  const offset = startDay === 0 ? 6 : startDay - 1;
  for (let i = 0; i < offset; i++) {
    week[i] = Markup.button.callback(" ", "ignore_calendar_empty");
  }

  for (let day = 1; day <= numDays; day++) {
    const dayIndex = (offset + day - 1) % 7;
    const dateString = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    const buttonText = day.toString();

    const isPastDate =
      year < currentYear ||
      (year === currentYear && month < currentMonth) ||
      (year === currentYear && month === currentMonth && day < currentDay);

    if (isPastDate) {
      // Змінюємо callback_data для минулих дат, щоб вона все одно оброблялася обробником calendar_date, але з префіксом 'past_'
      week[dayIndex] = Markup.button.callback(
        ` ${buttonText} `,
        `calendar_date_past_${dateString}`
      );
    } else {
      week[dayIndex] = Markup.button.callback(
        buttonText,
        `calendar_date_${dateString}`
      );
    }

    if (dayIndex === 6 || day === numDays) {
      keyboard.push(week);
      week = Array(7).fill(
        Markup.button.callback(" ", "ignore_calendar_empty")
      );
    }
  }

  // Навігація місяцями
  const prevMonth = new Date(year, month - 1);
  const nextMonth = new Date(year, month + 1);

  keyboard.push([
    Markup.button.callback(
      `⬅️ ${monthNames[prevMonth.getMonth()]}`,
      `calendar_nav_${prevMonth.getFullYear()}_${prevMonth.getMonth()}`
    ),
    Markup.button.callback(header, "ignore_header"),
    Markup.button.callback(
      `${monthNames[nextMonth.getMonth()]} ➡️`,
      `calendar_nav_${nextMonth.getFullYear()}_${nextMonth.getMonth()}`
    ),
  ]);

  // Кнопка "Повернутись назад"
  keyboard.push([
    Markup.button.callback(
      getMessage(ctx, "backToMainMenu"),
      "back_to_main_menu_from_calendar"
    ),
  ]);

  return Markup.inlineKeyboard(keyboard);
}

module.exports = {
  generateCalendar,
};
