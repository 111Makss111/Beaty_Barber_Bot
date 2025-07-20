// index.js
require("dotenv").config();
const express = require("express");
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
const { getClientMainMenuKeyboard } = require("./keyboard/mainMenu");
const {
  handleAdminMenuChoice,
  handleAdminCalendarCallback,
} = require("./admin/handlers/adminHandler");
const {
  handleAdminTimeSlotCallback,
} = require("./admin/handlers/adminTimeSlotHandler");
const {
  showRecordsPeriodSelection,
  handleAdminRecordsCallback,
} = require("./admin/handlers/adminViewRecordsHandler");
const {
  showPortfolioMenu,
  handlePortfolioCallback,
  handlePortfolioPhoto,
} = require("./admin/handlers/adminPortfolioHandler");
const {
  showClientPortfolio,
  handleClientPortfolioCallback,
} = require("./handlers/clientPortfolioHandler");
const { initCleanupScheduler } = require("./utils/cleanupScheduler");
const { initNotifications } = require("./utils/notifications");

const bot = new Telegraf(process.env.BOT_TOKEN);

startCommand(bot);

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const lang = user ? user.lang : "ua";
  const currentState = userStates[userId] ? userStates[userId].state : null;
  const text = ctx.message.text;

  if (user && user.is_admin) {
    if (text === getTranslation("admin_menu_view_records", lang)) {
      await showRecordsPeriodSelection(ctx);
      return;
    }
    if (text === getTranslation("admin_menu_add_portfolio", lang)) {
      await showPortfolioMenu(ctx);
      return;
    }
    if (
      text === getTranslation("admin_menu_block_date", lang) ||
      text === getTranslation("admin_menu_block_hours", lang) ||
      text === getTranslation("admin_menu_block_client", lang)
    ) {
      await handleAdminMenuChoice(ctx);
      return;
    }
  }

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

  if (text === getTranslation("client_menu_portfolio", lang)) {
    await showClientPortfolio(ctx);
    return;
  }

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

  if (currentState === "waiting_for_name") {
    await handleUserNameAndSurname(ctx);
  } else if (currentState === "waiting_for_phone") {
    await handlePhoneNumber(ctx);
  }
});

bot.on("photo", async (ctx) => {
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
});

bot.on("contact", handlePhoneNumber);

bot.on("callback_query", async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const currentState = userStates[userId] ? userStates[userId].state : null;
  const callbackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();
  if (!user) {
    await ctx.reply(getTranslation("error_try_again", "ua"));
    return;
  }
  const lang = user.lang;
  if (callbackData === "lang_ua" || callbackData === "lang_pl") {
    await processLanguageSelection(ctx, callbackData.split("_")[1]);
    return;
  }
  if (
    user.is_admin &&
    (callbackData.startsWith("admin_records_period_") ||
      callbackData === "admin_back_to_records_selection" ||
      callbackData === "back_to_admin_menu_from_records" ||
      callbackData === "back_to_admin_menu_from_records_selection")
  ) {
    await handleAdminRecordsCallback(ctx);
    return;
  }
  if (
    user.is_admin &&
    (callbackData.startsWith("admin_portfolio_") ||
      callbackData === "back_to_admin_menu_from_portfolio")
  ) {
    await handlePortfolioCallback(ctx);
    return;
  }
  if (
    callbackData.startsWith("client_portfolio_") ||
    callbackData === "back_to_main_menu_from_client_portfolio"
  ) {
    await handleClientPortfolioCallback(ctx);
    return;
  }
  if (user.is_admin && currentState === "admin_waiting_for_hour_to_block") {
    await handleAdminTimeSlotCallback(ctx);
    return;
  }
  if (
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
    await handleFinalBookingCallback(ctx, bot);
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

const PORT = process.env.PORT || 3000;
const DOMAIN =
  process.env.RENDER_EXTERNAL_URL || process.env.WEBHOOK_DOMAIN || "";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Бот працює");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use(bot.webhookCallback("/webhook"));

async function start() {
  if (DOMAIN) {
    const url = `${DOMAIN.replace(/\/$/, "")}/webhook`;
    try {
      await bot.telegram.setWebhook(url);
      console.log(`Webhook встановлено: ${url}`);
    } catch (err) {
      console.error("Помилка встановлення webhook:", err);
    }
    app.listen(PORT, () => {
      console.log(`HTTP сервер запущено на порті ${PORT}`);
    });
  } else {
    console.log("WEBHOOK_DOMAIN не задано. Запуск у режимі long polling.");
    await bot.launch();
  }
}

console.log("Спроба запуску бота...");
start().then(() => {
  console.log("Бот запущено");
  console.log("------------------------------------------");
});

cron.schedule(
  "* * * * *",
  () => {
    const currentTime = new Date().toLocaleTimeString("uk-UA", {
      timeZone: "Europe/Warsaw",
    });
    console.log(`[${currentTime}] БОТ ЗАПУЩЕНО. Працює коректно.`);
  },
  { timezone: "Europe/Warsaw" }
);
console.log(
  "Періодичне логування активності бота заплановано (кожну хвилину)."
);

initCleanupScheduler();
initNotifications(bot);

const isLongPolling = !DOMAIN; // Якщо немає домену, працюємо через polling

process.once("SIGINT", () => {
  console.log("Отримано SIGINT. Зупинка...");
  if (isLongPolling) bot.stop("SIGINT");
  process.exit(0);
});

process.once("SIGTERM", () => {
  console.log("Отримано SIGTERM. Зупинка...");
  if (isLongPolling) bot.stop("SIGTERM");
  process.exit(0);
});
