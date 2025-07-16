require("dotenv").config();
const { Telegraf } = require("telegraf");
const startCommand = require("./handlers/start");
const {
  handleUserNameAndSurname,
  processLanguageSelection,
} = require("./handlers/userName"); // Додано processLanguageSelection
const { handlePhoneNumber, userStates } = require("./handlers/userPhone");
const {
  showServiceMenu,
  handleServiceSelection,
} = require("./handlers/serviceSelection");
const {
  showCalendar,
  handleCalendarCallback,
} = require("./handlers/calendarHandler");
const {
  showTimeSlots,
  handleTimeSlotCallback,
} = require("./handlers/timeSlotHandler"); // Підключаємо обробники часу
const { getTranslation } = require("./data/translations");
const { findUser } = require("./data/data");

const bot = new Telegraf(process.env.BOT_TOKEN);

startCommand(bot);

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const lang = user ? user.lang : "ua";
  const currentState = userStates[userId] ? userStates[userId].state : null;
  const text = ctx.message.text;

  if (text === getTranslation("client_menu_appointment", lang)) {
    await showServiceMenu(ctx);
    return;
  }

  if (currentState === "waiting_for_name") {
    await handleUserNameAndSurname(ctx);
  } else if (currentState === "waiting_for_phone") {
    await handlePhoneNumber(ctx);
  }
});

bot.on("callback_query", async (ctx) => {
  const userId = ctx.from.id;
  const currentState = userStates[userId] ? userStates[userId].state : null;
  const callbackData = ctx.callbackQuery.data;

  if (callbackData === "lang_ua" || callbackData === "lang_pl") {
    await processLanguageSelection(ctx, callbackData.split("_")[1]);
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

  // НОВИЙ ОБРОБНИК ДЛЯ ВИБОРУ ЧАСУ
  if (
    currentState === "waiting_for_time_selection" ||
    callbackData.startsWith("time_") ||
    callbackData === "back_to_calendar_from_time" ||
    callbackData === "ignore_slot"
  ) {
    await handleTimeSlotCallback(ctx);
    return;
  }
});

bot.on("contact", handlePhoneNumber);

bot.launch();
console.log("Бот запущено!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
