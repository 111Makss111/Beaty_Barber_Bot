const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");

// Допоміжна функція для отримання назв днів тижня
function getDayNames(lang) {
  return [
    getTranslation(lang, "mon_short"),
    getTranslation(lang, "tue_short"),
    getTranslation(lang, "wed_short"),
    getTranslation(lang, "thu_short"),
    getTranslation(lang, "fri_short"),
    getTranslation(lang, "sat_short"),
    getTranslation(lang, "sun_short"),
  ];
}

// Допоміжна функція для отримання назв місяців
function getMonthNames(lang) {
  return [
    getTranslation(lang, "jan"),
    getTranslation(lang, "feb"),
    getTranslation(lang, "mar"),
    getTranslation(lang, "apr"),
    getTranslation(lang, "may"),
    getTranslation(lang, "jun"),
    getTranslation(lang, "jul"),
    getTranslation(lang, "aug"),
    getTranslation(lang, "sep"),
    getTranslation(lang, "oct"),
    getTranslation(lang, "nov"),
    getTranslation(lang, "dec"),
  ];
}

function getCalendarKeyboard(year, month, lang) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Обнуляємо час для коректного порівняння дат

  const date = new Date(year, month);
  const currentMonthName = getMonthNames(lang)[date.getMonth()];
  const currentYear = date.getFullYear();

  const keyboard = [];

  // Рядок з місяцем та роком, і кнопками навігації
  keyboard.push([
    Markup.button.callback("⬅️", `calendar-prev-${year}-${month}`),
    Markup.button.callback(
      `${currentMonthName} ${currentYear}`,
      "calendar-current-month"
    ), // Неактивна кнопка
    Markup.button.callback("➡️", `calendar-next-${year}-${month}`),
  ]);

  // Рядок з днями тижня
  keyboard.push(
    getDayNames(lang).map((day) => Markup.button.callback(day, "ignore"))
  ); // "ignore" - щоб кнопки були неактивними

  // Дні місяця
  const firstDayOfMonth = new Date(year, month, 1);
  // getDay() повертає 0 для неділі, 1 для понеділка... -> ми хочемо, щоб понеділок був 0, неділя 6
  const startDay =
    firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // 0 for Monday, 6 for Sunday

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let currentRow = [];
  // Додаємо пусті клітинки для початку місяця
  for (let i = 0; i < startDay; i++) {
    currentRow.push(Markup.button.callback(" ", "ignore"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    currentDate.setHours(0, 0, 0, 0);

    const isPastDate = currentDate.getTime() < today.getTime();

    if (isPastDate) {
      currentRow.push(Markup.button.callback(day.toString(), "ignore")); // Минулі дати неактивні
    } else {
      currentRow.push(
        Markup.button.callback(
          day.toString(),
          `calendar-date-${year}-${month}-${day}`
        )
      );
    }

    if (currentRow.length === 7) {
      keyboard.push(currentRow);
      currentRow = [];
    }
  }

  // Додаємо пусті клітинки для кінця місяця
  while (currentRow.length < 7) {
    currentRow.push(Markup.button.callback(" ", "ignore"));
  }
  if (currentRow.length > 0) {
    keyboard.push(currentRow);
  }

  // Кнопка "Повернутись назад"
  keyboard.push([
    Markup.button.callback(
      getTranslation(lang, "back_to_services_btn"),
      "back_to_services"
    ),
  ]);

  return Markup.inlineKeyboard(keyboard);
}

module.exports = {
  getCalendarKeyboard,
};
