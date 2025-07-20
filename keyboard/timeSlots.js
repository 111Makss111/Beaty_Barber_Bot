const { Markup } = require("telegraf");
const { getTranslation } = require("../data/translations");
const { getSchedule } = require("../data/data");

const AVAILABLE_TIMES = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
];

const getTimeSlotsInlineKeyboard = (dateString, lang) => {
  const timeSlotsKeyboard = [];
  const schedule = getSchedule();
  const daySchedule = schedule[dateString] || {};

  const now = new Date();
  const todayDateString = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const sortedAvailableTimes = [...new Set(AVAILABLE_TIMES)].sort((a, b) => {
    const [hA, mA] = a.split(":").map(Number);
    const [hB, mB] = b.split(":").map(Number);
    if (hA === hB) return mA - mB;
    return hA - hB;
  });

  let row = [];
  sortedAvailableTimes.forEach((time) => {
    const [slotHour, slotMinute] = time.split(":").map(Number);
    let buttonText = time;
    let callbackData = `time_${time}`;
    let isDisabled = false;

    if (
      daySchedule[time] &&
      (daySchedule[time].status === "booked" ||
        daySchedule[time].status === "blocked_admin")
    ) {
      isDisabled = true;
      buttonText += " 🚫";
      callbackData = "ignore_slot";
    }

    if (dateString === todayDateString) {
      // Порівняння з поточним часом для відображення минулих слотів
      if (
        slotHour < currentHour ||
        (slotHour === currentHour && slotMinute <= currentMinute)
      ) {
        isDisabled = true;
        buttonText = "✖️";
        callbackData = "ignore_slot";
      }
    }

    row.push(Markup.button.callback(buttonText, callbackData));

    if (row.length === 3) {
      timeSlotsKeyboard.push(row);
      row = [];
    }
  });

  // Додаємо останній неповний ряд, якщо він є
  if (row.length > 0) {
    timeSlotsKeyboard.push(row);
  }

  // Додаємо кнопку "Повернутись до календаря"
  timeSlotsKeyboard.push([
    Markup.button.callback(
      getTranslation("button_back_to_calendar", lang), // Використовуємо переклад для кнопки
      "back_to_calendar_from_time" // Callback-дані для повернення
    ),
  ]);

  return Markup.inlineKeyboard(timeSlotsKeyboard);
};

module.exports = { AVAILABLE_TIMES, getTimeSlotsInlineKeyboard };
