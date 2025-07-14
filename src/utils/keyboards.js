const { Markup } = require("telegraf");
const { getMessage } = require("./i18n");
const { AVAILABLE_TIMES } = require("./constants");

// Нова клавіатура для вибору мови (ReplyKeyboard)
const languageSelectionReplyKeyboard = () => {
  return Markup.keyboard([["🇺🇦 Українська"], ["🇵🇱 Polski"]]).resize();
};

// Клавіатура головного меню
const mainMenuKeyboard = (ctx) => {
  return Markup.keyboard([
    [
      getMessage(ctx, "bookAppointmentButton"),
      getMessage(ctx, "cancelAppointmentButton"),
    ],
    [getMessage(ctx, "myCabinetButton"), getMessage(ctx, "portfolioButton")],
  ]).resize();
};

const adminPanelKeyboard = (ctx) => {
  return Markup.keyboard([
    [getMessage(ctx, "viewAllAppointments"), getMessage(ctx, "blockDateTime")],
    [getMessage(ctx, "addPortfolioPhoto"), getMessage(ctx, "backToMainMenu")],
  ]).resize();
};

const confirmationKeyboard = (ctx) => {
  return Markup.inlineKeyboard([
    Markup.button.callback(getMessage(ctx, "confirm"), "confirm_booking"),
    Markup.button.callback(getMessage(ctx, "cancel"), "cancel_booking"),
  ]);
};

/**
 * Генерує інлайн-клавіатуру з доступними часами.
 * @param {object} ctx - Об'єкт контексту Telegraf для отримання мови.
 * @param {string[]} bookedTimes - Масив заброньованих годин для обраної дати.
 * @param {string} selectedDate - Обрана дата у форматі YYYY-MM-DD.
 * @returns {object} Inline-клавіатура Telegraf.
 */
const generateTimeKeyboard = (ctx, bookedTimes = [], selectedDate) => {
  const now = new Date();
  const todayDate = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const buttons = AVAILABLE_TIMES.map((time) => {
    const isBooked = bookedTimes.includes(time);

    // Додаткова перевірка: якщо дата сьогоднішня, і час вже минув
    const [hour, minute] = time.split(":").map(Number);
    const isPastTimeToday =
      selectedDate === todayDate &&
      (hour < currentHour || (hour === currentHour && minute <= currentMinute));

    if (isBooked || isPastTimeToday) {
      return Markup.button.callback(`[${time}]`, "time_booked_or_past"); // Неактивна кнопка
    } else {
      return Markup.button.callback(time, `time_selected_${time}`);
    }
  });

  // Додаємо кнопку "Повернутись назад"
  buttons.push(
    Markup.button.callback(
      getMessage(ctx, "backToMainMenu"),
      "back_to_calendar_from_time"
    )
  ); // Нова кнопка повернення

  return Markup.inlineKeyboard(buttons, { columns: 3 });
};

const generateServiceKeyboard = (ctx) => {
  // Оновлений список послуг
  const services = [
    { id: "manicure", nameKey: "manicureService" },
    { id: "pedicure", nameKey: "pedicureService" },
    { id: "removal", nameKey: "removalService" },
    { id: "strengthening", nameKey: "strengtheningService" },
  ];

  const buttons = services.map((service) =>
    Markup.button.callback(
      getMessage(ctx, service.nameKey),
      `service_${service.id}`
    )
  );

  // Додаємо кнопку "Повернутись назад"
  buttons.push(
    Markup.button.callback(
      getMessage(ctx, "backToMainMenu"),
      "back_to_main_menu_from_services"
    )
  );

  return Markup.inlineKeyboard(buttons, { columns: 2 }); // Можна налаштувати кількість стовпців
};
/**
 * Генерує інлайн-клавіатуру з майбутніми записами користувача.
 * @param {object} ctx - Об'єкт контексту Telegraf для отримання мови.
 * @param {Array<object>} appointments - Масив об'єктів записів користувача.
 * @returns {object} Inline-клавіатура Telegraf.
 */
const generateUserAppointmentsKeyboard = (ctx, appointments) => {
  const buttons = [];

  // Якщо є записи, створюємо кнопки для кожного
  if (appointments && appointments.length > 0) {
    appointments.forEach((app) => {
      const serviceName = getMessage(ctx, `${app.service}Service`); // Отримуємо локалізовану назву послуги
      buttons.push([
        Markup.button.callback(
          `❌ ${serviceName} ${app.date} о ${app.time}`,
          `cancel_appointment_id_${app.id}`
        ),
      ]);
    });
  }

  // Додаємо кнопку "Назад"
  buttons.push([
    Markup.button.callback(getMessage(ctx, "back"), "back_from_cancel_list"),
  ]);

  return Markup.inlineKeyboard(buttons);
};
module.exports = {
  mainMenuKeyboard,
  adminPanelKeyboard,
  confirmationKeyboard,
  generateTimeKeyboard,
  generateServiceKeyboard,
  languageSelectionReplyKeyboard, // Експортуємо нову клавіатуру
  generateUserAppointmentsKeyboard,
};
