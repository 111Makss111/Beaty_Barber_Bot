// Приклад: index.js

require("dotenv").config();
const { Telegraf } = require("telegraf");
const cron = require("node-cron");

const startCommand = require("./handlers/start");
const {
  handleUserNameAndSurname,
  processLanguageSelection,
} = require("./handlers/userName");
const { handlePhoneNumber, userStates } = require("./handlers/userPhone");
const {
  showServiceMenu,
  handleServiceSelection,
} = require("./handlers/serviceSelection");
const { handleCalendarCallback } = require("./handlers/calendarHandler");
const {
  showTimeSlots,
  handleTimeSlotCallback,
} = require("./handlers/timeSlotHandler");
const {
  handleFinalBookingCallback,
} = require("./handlers/finalBookingHandler");
const {
  showCancelBookingMenu,
  handleCancelBookingCallback,
} = require("./handlers/cancelBookingHandler");
const {
  showClientProfile,
  handleProfileCallback,
} = require("./handlers/clientProfileHandler");
const { getTranslation } = require("./data/translations");
const { findUser, saveUser } = require("./data/data");
const { getAdminMenuKeyboard } = require("./admin/keyboard/adminMenu");
const {
  handleAdminMenuChoice,
  handleAdminCalendarCallback,
} = require("./admin/handlers/adminHandler");
const { cleanupBlockedDates, cleanupPastBookings } = require("./utils/cleanup");
const {
  handleAdminTimeSlotCallback,
} = require("./admin/handlers/adminTimeSlotHandler");
const {
  viewAllRecords,
  handleAdminRecordsCallback,
} = require("./admin/handlers/adminViewRecordsHandler");
const {
  // <-- ДОДАНО: Імпорт обробників для портфоліо
  showPortfolioMenu,
  handlePortfolioCallback,
  handlePortfolioPhoto,
} = require("./admin/handlers/adminPortfolioHandler");

const bot = new Telegraf(process.env.BOT_TOKEN);

startCommand(bot);

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const lang = user ? user.lang : "ua";
  const currentState = userStates[userId] ? userStates[userId].state : null;
  const text = ctx.message.text;

  // Логіка для адміністраторів (обробка кнопок головного адмін-меню)
  if (user && user.is_admin) {
    if (text === getTranslation("admin_menu_view_records", lang)) {
      await viewAllRecords(ctx);
      return;
    }
    if (text === getTranslation("admin_menu_add_portfolio", lang)) {
      // <-- ОБРОБКА КНОПКИ "ДОДАТИ ДО ПОРТФОЛІО"
      await showPortfolioMenu(ctx);
      return;
    }
    // Інші кнопки адмін-меню обробляються через handleAdminMenuChoice
    if (
      text === getTranslation("admin_menu_block_date", lang) ||
      text === getTranslation("admin_menu_block_hours", lang) ||
      text === getTranslation("admin_menu_block_client", lang)
    ) {
      await handleAdminMenuChoice(ctx);
      return;
    }
  }

  // Логіка для звичайних користувачів та загальні команди
  if (text === getTranslation("client_menu_appointment", lang)) {
    await showServiceMenu(ctx);
    return;
  }

  if (text === getTranslation("client_menu_cancel", lang)) {
    await showCancelBookingMenu(ctx);
    return;
  }

  if (text === getTranslation("client_menu_profile", lang)) {
    await showClientProfile(ctx);
    return;
  }

  // Обробка вибору послуги за текстом
  const serviceNames = [
    getTranslation("service_manicure", lang),
    getTranslation("service_pedicure", lang),
    getTranslation("service_removal", lang),
    getTranslation("service_strengthening", lang),
    getTranslation("service_haircut", lang),
    getTranslation("service_shave", lang),
    getTranslation("service_beard_trim", lang),
  ];

  if (
    serviceNames.includes(text) &&
    currentState === "waiting_for_service_selection"
  ) {
    await handleServiceSelection(ctx);
    return;
  }

  // Обробка введеного імені/телефону/фото для портфоліо
  if (currentState === "waiting_for_name") {
    await handleUserNameAndSurname(ctx);
  } else if (currentState === "waiting_for_phone") {
    await handlePhoneNumber(ctx);
  }
  // Немає потреби обробляти фото тут, бо є окремий bot.on('photo')
});

// Обробка фотографій, надісланих користувачами
bot.on("photo", async (ctx) => {
  // <-- ДОДАНО: Обробка отриманих фотографій
  const userId = ctx.from.id;
  const user = findUser(userId);
  const currentState = userStates[userId] ? userStates[userId].state : null;

  if (
    user &&
    user.is_admin &&
    currentState === "admin_waiting_for_portfolio_photo"
  ) {
    await handlePortfolioPhoto(ctx);
    return;
  }
  // Якщо фото не для портфоліо адміна, можна проігнорувати або відповісти
  // await ctx.reply(getTranslation("error_unknown_command", user ? user.lang : "ua"));
});

bot.on("callback_query", async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const currentState = userStates[userId] ? userStates[userId].state : null;
  const callbackData = ctx.callbackQuery.data;

  // Обробка вибору мови (завжди перший пріоритет)
  if (callbackData === "lang_ua" || callbackData === "lang_pl") {
    await processLanguageSelection(ctx, callbackData.split("_")[1]);
    return;
  }

  // Обробка callback-ів для АДМІНА - Повернення з перегляду записів
  if (
    user &&
    user.is_admin &&
    callbackData === "back_to_admin_menu_from_records"
  ) {
    await handleAdminRecordsCallback(ctx);
    return;
  }

  // Обробка callback-ів для АДМІНА - ПОРТФОЛІО
  if (user && user.is_admin && callbackData.startsWith("admin_portfolio_")) {
    // <-- ОБРОБКА ВСІХ CALLBACK-ІВ ПОРТФОЛІО
    await handlePortfolioCallback(ctx);
    return;
  }
  if (
    user &&
    user.is_admin &&
    callbackData === "back_to_admin_menu_from_portfolio"
  ) {
    // <-- ОБРОБКА ПОВЕРНЕННЯ З ПОРТФОЛІО
    await handlePortfolioCallback(ctx); // Викликаємо той самий обробник, він визначить дію
    return;
  }

  // Обробка callback-ів для АДМІНА - БЛОКУВАННЯ ГОДИН
  if (
    user &&
    user.is_admin &&
    currentState === "admin_waiting_for_hour_to_block"
  ) {
    await handleAdminTimeSlotCallback(ctx);
    return;
  }

  // Обробка callback-ів для АДМІНА - КАЛЕНДАР (блокування дат або вибір дати для годин)
  if (
    user &&
    user.is_admin &&
    (callbackData.startsWith("cal_admin_") ||
      callbackData.startsWith("admin_date_") ||
      callbackData === "back_to_admin_main_menu" ||
      callbackData.startsWith("admin_back_to_calendar_from_hours_") ||
      callbackData.startsWith("ignore_"))
  ) {
    if (
      !callbackData.startsWith("admin_toggle_hour_") &&
      !callbackData.startsWith("admin_finish_hour_blocking_")
    ) {
      await handleAdminCalendarCallback(ctx);
      return;
    }
  }

  // Логіка для звичайних користувачів

  // Обробка повернення до головного меню з профілю
  if (callbackData === "back_to_main_menu_from_profile") {
    await handleProfileCallback(ctx);
    return;
  }

  if (
    currentState === "waiting_for_service_selection" ||
    callbackData === "back_to_main_menu"
  ) {
    await handleServiceSelection(ctx);
    return;
  }

  if (
    currentState === "waiting_for_date_selection" ||
    callbackData.startsWith("cal_") ||
    callbackData.startsWith("date_") ||
    callbackData === "back_to_services_from_calendar"
  ) {
    await handleCalendarCallback(ctx);
    return;
  }

  if (
    currentState === "waiting_for_time_selection" ||
    callbackData.startsWith("time_") ||
    callbackData === "ignore_slot" ||
    callbackData === "back_to_calendar_from_time"
  ) {
    await handleTimeSlotCallback(ctx);
    return;
  }

  if (
    currentState === "waiting_for_confirmation" ||
    callbackData === "confirm_booking" ||
    callbackData === "cancel_booking"
  ) {
    await handleFinalBookingCallback(ctx);
    return;
  }

  if (
    currentState === "waiting_for_booking_to_cancel" ||
    currentState === "waiting_for_cancel_confirmation" ||
    callbackData.startsWith("cancel_select_") ||
    callbackData === "confirm_cancel_booking" ||
    callbackData === "abort_cancel_booking" ||
    callbackData === "back_to_cancel_list" ||
    callbackData === "back_to_main_menu_from_cancel"
  ) {
    await handleCancelBookingCallback(ctx);
    return;
  }
});

bot.on("contact", handlePhoneNumber);

bot.launch();
console.log("Бот запущено!");

// --- Налаштування cron-завдань ---

// Запуск при старті для першого очищення
cleanupBlockedDates();
cleanupPastBookings();

// Щоденне очищення заблокованих дат (наприклад, о 03:00 ночі за часовим поясом Europe/Warsaw)
cron.schedule(
  "0 3 * * *",
  () => {
    console.log("Запускаю щоденне очищення заблокованих дат...");
    cleanupBlockedDates();
  },
  {
    timezone: "Europe/Warsaw",
  }
);

// Щогодинне очищення минулих записів клієнтів (наприклад, кожної години на 00 хвилині за часовим поясом Europe/Warsaw)
cron.schedule(
  "0 * * * *",
  () => {
    console.log("Запускаю щогодинне очищення минулих записів клієнтів...");
    cleanupPastBookings();
  },
  {
    timezone: "Europe/Warsaw",
  }
);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
