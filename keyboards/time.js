const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");

function getTimeKeyboard(selectedDate, bookedAppointments, lang) {
  const timeSlots = [
    "09:00",
    "10:30",
    "12:00",
    "13:30",
    "15:00",
    "16:30",
    "18:00",
  ];
  const keyboard = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Поточний день без часу

  let currentRow = [];
  for (const slot of timeSlots) {
    const [hours, minutes] = slot.split(":").map(Number);
    const slotDateTime = new Date(selectedDate); // Використовуємо обрану дату
    slotDateTime.setHours(hours, minutes, 0, 0);

    let buttonText = slot;
    let callbackData = `time-select-${slot}`;
    let isDisabled = false;

    // 1. Логіка блокування минулих годин (для сьогоднішньої обраної дати)
    if (
      selectedDate.toDateString() === today.toDateString() &&
      slotDateTime.getTime() < now.getTime()
    ) {
      buttonText = `🚫 ${slot}`; // Позначаємо як минулий час
      callbackData = "ignore"; // Робимо кнопку неактивною
      isDisabled = true;
    }

    // 2. Логіка блокування вже зайнятих годин
    const isBooked = bookedAppointments.some((appointment) => {
      const apptDate = new Date(appointment.date);
      const apptTime = appointment.time;
      return (
        apptDate.toDateString() === selectedDate.toDateString() &&
        apptTime === slot
      );
    });

    if (isBooked && !isDisabled) {
      // Якщо вже зайнято і не є минулим часом
      buttonText = `❌ ${slot}`; // Позначаємо як зайнятий
      callbackData = "ignore"; // Робимо кнопку неактивною
      isDisabled = true;
    }

    currentRow.push(Markup.button.callback(buttonText, callbackData));

    if (currentRow.length === 2) {
      // По 2 кнопки в рядку
      keyboard.push(currentRow);
      currentRow = [];
    }
  }

  // Додаємо останній рядок, якщо він неповний
  if (currentRow.length > 0) {
    keyboard.push(currentRow);
  }

  // Кнопка "Повернутись до календаря"
  keyboard.push([
    Markup.button.callback(
      getTranslation(lang, "back_to_calendar_btn"),
      "back_to_calendar"
    ),
  ]);

  return Markup.inlineKeyboard(keyboard);
}

module.exports = {
  getTimeKeyboard,
};
