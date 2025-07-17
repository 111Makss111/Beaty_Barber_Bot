const { Markup } = require("telegraf");
const { getTranslation } = require("../data/translations");
const { getSchedule } = require("../data/data");

// Фіксований графік роботи (години початку послуги)
// У форматі "ГГ:ХХ"
const AVAILABLE_TIMES = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
];

/**
 * Генерує інлайн-клавіатуру з доступними часовими слотами для обраної дати.
 * @param {string} dateString - Обрана дата у форматі "РРРР-ММ-ДД".
 * @param {string} lang - Мовний код ('ua' або 'pl').
 * @returns {Object} Telegraf InlineKeyboardMarkup.
 */
const getTimeSlotsInlineKeyboard = (dateString, lang) => {
  const timeSlotsKeyboard = [];
  const schedule = getSchedule();
  const daySchedule = schedule[dateString] || {}; // Розклад на конкретний день

  const now = new Date();
  const todayDateString = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let row = [];
  AVAILABLE_TIMES.forEach((time) => {
    const [hourStr, minuteStr] = time.split(":");
    const slotHour = parseInt(hourStr, 10);
    const slotMinute = parseInt(minuteStr, 10);

    let buttonText = time;
    let callbackData = `time_${time}`;
    let isDisabled = false;

    // Перевірка, чи слот вже зайнятий або заблокований
    if (
      daySchedule[time] &&
      (daySchedule[time].status === "booked" ||
        daySchedule[time].status === "blocked_admin")
    ) {
      isDisabled = true;
      buttonText += " 🚫"; // Маркуємо зайняті/заблоковані слоти
      callbackData = "ignore_slot"; // Неактивна кнопка
    }

    // Перевірка на минулий час, якщо це сьогоднішня дата
    if (dateString === todayDateString) {
      if (
        slotHour < currentHour ||
        (slotHour === currentHour && slotMinute <= currentMinute)
      ) {
        isDisabled = true;
        buttonText = "✖️"; // Маркуємо минулий час
        callbackData = "ignore_slot";
      }
    }

    row.push(Markup.button.callback(buttonText, callbackData));

    // Розбиваємо на ряди по 3 кнопки
    if (row.length === 3) {
      timeSlotsKeyboard.push(row);
      row = [];
    }
  });

  // Додаємо останній неповний ряд, якщо він є
  if (row.length > 0) {
    timeSlotsKeyboard.push(row);
  }

  // Кнопка "Повернутись до календаря"
  timeSlotsKeyboard.push([
    Markup.button.callback(
      getTranslation("button_back_to_calendar", lang),
      "back_to_calendar_from_time"
    ),
  ]);

  return Markup.inlineKeyboard(timeSlotsKeyboard);
};

module.exports = {
  getTimeSlotsInlineKeyboard,
  AVAILABLE_TIMES, // Можливо, знадобиться для інших файлів
};
