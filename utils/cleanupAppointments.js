const cron = require("node-cron");
const { bookedAppointments } = require("../handlers/time"); // Імпортуємо масив записів

function cleanOldAppointments() {
  const now = new Date();
  const initialLength = bookedAppointments.length;

  // Фільтруємо записи, залишаючи лише ті, що в майбутньому
  const updatedAppointments = bookedAppointments.filter((appointment) => {
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(":").map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    return appointmentDateTime.getTime() > now.getTime();
  });

  // Очищаємо поточний масив та додаємо відфільтровані записи
  // Важливо: це мутує оригінальний масив, на який посилається handlers/time.js
  bookedAppointments.length = 0; // Очищаємо масив
  bookedAppointments.push(...updatedAppointments); // Додаємо оновлені записи

  const cleanedCount = initialLength - bookedAppointments.length;
  if (cleanedCount > 0) {
    console.log(
      `[Cleanup] Видалено ${cleanedCount} минулих записів. Залишилось: ${bookedAppointments.length}.`
    );
  } else {
    console.log("[Cleanup] Не знайдено минулих записів для видалення.");
  }
}

function scheduleCleanup() {
  // Запланувати виконання функції cleanOldAppointments кожні 5 хвилин.
  // Синтаксис cron: 'хвилина година день_місяця місяць день_тижня'
  // '*/5 * * * *' означає "кожні 5 хвилин"
  cron.schedule(
    "*/5 * * * *",
    () => {
      console.log("[Cleanup] Запущено завдання з очищення минулих записів...");
      cleanOldAppointments();
    },
    {
      scheduled: true,
      timezone: "Europe/Warsaw", // Важливо встановити правильну часову зону
    }
  );

  console.log(
    "[Cleanup] Завдання з періодичного очищення записів заплановано (кожні 5 хвилин)."
  );
  // Виконати очищення один раз при запуску бота
  cleanOldAppointments();
}

module.exports = {
  cleanOldAppointments,
  scheduleCleanup,
};
