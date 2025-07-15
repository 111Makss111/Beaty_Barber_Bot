const { Telegraf } = require("telegraf");
const LocalSession = require("telegraf-session-local");
require("dotenv").config();

const { setupStartHandlers } = require("./handlers/start");
const { setupNameHandlers } = require("./handlers/name");
const { setupPhoneHandlers } = require("./handlers/phone");
const { setupAdminHandlers } = require("./handlers/adminMenu");
const { setupServicesHandlers } = require("./handlers/services");
const { setupCalendarHandlers } = require("./handlers/calendar");
const { setupTimeHandlers, bookedAppointments } = require("./handlers/time");
const { setupProfileHandlers } = require("./handlers/profile");
const {
  setupCancelAppointmentHandlers,
} = require("./handlers/cancelAppointment");
const { scheduleCleanup } = require("./utils/cleanupAppointments");
const { setupViewRecordsHandlers } = require("./handlers/viewRecordsAdmin");

const { getTranslation } = require("./translate");
const { getMainMenuKeyboard } = require("./keyboards");

const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(",").map((id) => parseInt(id.trim()))
  : [];

const bot = new Telegraf(process.env.BOT_TOKEN);

// Зберігаємо екземпляр LocalSession у змінній
const localSessionInstance = new LocalSession({ database: "data/users.json" });
bot.use(localSessionInstance.middleware()); // Використовуємо його middleware

setupStartHandlers(bot, ADMIN_IDS);
setupNameHandlers(bot);
setupPhoneHandlers(bot);
setupAdminHandlers(bot, ADMIN_IDS); // Цей обробник має бути перед viewRecordsAdmin, оскільки він обробляє вхід в адмін-меню
setupServicesHandlers(bot);
setupCalendarHandlers(bot);
setupTimeHandlers(bot, ADMIN_IDS, localSessionInstance);
setupProfileHandlers(bot, localSessionInstance);
setupCancelAppointmentHandlers(bot, ADMIN_IDS);
setupViewRecordsHandlers(bot, ADMIN_IDS); // Цей обробник має бути після adminMenu, оскільки він обробляє кнопку "Переглянути всі записи" з адмін-меню

bot.on("text", async (ctx) => {
  // Цей обробник спрацьовує лише якщо попередні обробники не відловили повідомлення
  // і якщо бот не знаходиться в якомусь специфічному стані (nextStep === null/undefined)
  if (ctx.session.nextStep === null || ctx.session.nextStep === undefined) {
    console.log(
      `Index.js - fallback text handler - current nextStep: ${ctx.session.nextStep}, text: "${ctx.message.text}"`
    );
    await ctx.reply(
      getTranslation(ctx.session.lang || "ua", "help_message"),
      getMainMenuKeyboard(ctx.session.lang || "ua", ctx.session.isAdmin)
    );
  }
  // Якщо nextStep не null/undefined, то очікується, що інший обробник має його відловити.
  // Якщо ні, повідомлення просто ігнорується, що краще, ніж надсилати неправильну клавіатуру.
});

// Запускаємо планувальник очищення
scheduleCleanup();

bot.launch();

console.log("Бот запущено");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
