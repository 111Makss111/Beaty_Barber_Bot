const cron = require("node-cron");
const { getTranslation } = require("../translate");

function scheduleAppointmentReminders(
  bot,
  appointment,
  bookedAppointmentsArray,
  localSessionInstance
) {
  // Оновлено: отримуємо lang з об'єкта appointment
  const {
    userId,
    service,
    date,
    time,
    timestamp,
    lang: appointmentLang,
  } = appointment;
  const appointmentDateTime = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();

  const reminderTime1 = new Date(appointmentDateTime.getTime() - 3 * 60 * 1000);
  const reminderTime2 = new Date(appointmentDateTime.getTime() - 2 * 60 * 1000);

  console.log(`Заплановано нагадування для користувача ${userId}:`);
  console.log(`  Візит: ${appointmentDateTime.toLocaleString()}`);
  console.log(`  Нагадування 1 (за 3 хв): ${reminderTime1.toLocaleString()}`);
  console.log(`  Нагадування 2 (за 2 хв): ${reminderTime2.toLocaleString()}`);

  // Використовуємо appointmentLang для форматування дати
  const formattedDate = appointmentDateTime.toLocaleDateString(
    appointmentLang === "ua" ? "uk-UA" : "pl-PL"
  );
  const formattedTime = time;

  const getReminderMessage = (lang) => {
    // Вже service передається як string 'manicure', тому не потрібна _btn
    // Якщо service - це ключ перекладу, то використовуємо його:
    const serviceName = getTranslation(lang, `${service}_service_btn`);
    // Якщо service - це вже назва, то просто використовуємо її:
    // const serviceName = service; // <<<<< Якщо 'service' вже є перекладеною назвою, використовуйте цей рядок

    return (
      `${getTranslation(lang, "reminder_message_header")}\n\n` +
      `${getTranslation(lang, "reminder_service", serviceName)}\n` +
      `${getTranslation(lang, "reminder_date", formattedDate)}\n` +
      `${getTranslation(lang, "reminder_time", formattedTime)}\n\n` +
      `${getTranslation(lang, "reminder_footer")}`
    );
  };

  const isAppointmentStillActive = (appointmentToCheck) => {
    return bookedAppointmentsArray.some(
      (app) =>
        app.userId === appointmentToCheck.userId &&
        app.service === appointmentToCheck.service &&
        new Date(app.date).toDateString() ===
          new Date(appointmentToCheck.date).toDateString() &&
        app.time === appointmentToCheck.time &&
        app.timestamp === appointmentToCheck.timestamp
    );
  };

  // Запланувати перше нагадування (за 3 хвилини до)
  if (reminderTime1.getTime() > now.getTime()) {
    cron.schedule(
      `${reminderTime1.getMinutes()} ${reminderTime1.getHours()} ${reminderTime1.getDate()} ${
        reminderTime1.getMonth() + 1
      } *`,
      async () => {
        if (isAppointmentStillActive(appointment)) {
          console.log(
            `Відправляю нагадування 1 (за 3 хв) для користувача ${userId}`
          );
          try {
            // Використовуємо appointmentLang напряму
            console.log(
              `Використана мова для нагадування 1 для користувача ${userId}: ${appointmentLang}`
            );
            await bot.telegram.sendMessage(
              userId,
              getReminderMessage(appointmentLang)
            );
          } catch (e) {
            console.error(
              `Помилка при відправці нагадування 1 для ${userId}:`,
              e
            );
          }
        } else {
          console.log(
            `Запис для ${userId} скасовано, нагадування 1 не відправлено.`
          );
        }
      },
      {
        scheduled: true,
        timezone: "Europe/Warsaw",
      }
    );
  } else {
    console.log(
      `Нагадування 1 для користувача ${userId} вже в минулому, не планується.`
    );
  }

  // Запланувати друге нагадування (за 2 хвилини до)
  if (reminderTime2.getTime() > now.getTime()) {
    cron.schedule(
      `${reminderTime2.getMinutes()} ${reminderTime2.getHours()} ${reminderTime2.getDate()} ${
        reminderTime2.getMonth() + 1
      } *`,
      async () => {
        if (isAppointmentStillActive(appointment)) {
          console.log(
            `Відправляю нагадування 2 (за 2 хв) для користувача ${userId}`
          );
          try {
            // Використовуємо appointmentLang напряму
            console.log(
              `Використана мова для нагадування 2 для користувача ${userId}: ${appointmentLang}`
            );
            await bot.telegram.sendMessage(
              userId,
              getReminderMessage(appointmentLang)
            );
          } catch (e) {
            console.error(
              `Помилка при відправці нагадування 2 для ${userId}:`,
              e
            );
          }
        } else {
          console.log(
            `Запис для ${userId} скасовано, нагадування 2 не відправлено.`
          );
        }
      },
      {
        scheduled: true,
        timezone: "Europe/Warsaw",
      }
    );
  } else {
    console.log(
      `Нагадування 2 для користувача ${userId} вже в минулому, не планується.`
    );
  }
}

module.exports = {
  scheduleAppointmentReminders,
};
