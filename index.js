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
} = require("./handlers/cancelAppointment"); // <-- ДОДАНО: Імпорт нового обробника

const { getTranslation } = require("./translate");
const { getMainMenuKeyboard } = require("./keyboards");

const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(",").map((id) => parseInt(id.trim()))
  : [];

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(new LocalSession({ database: "data/users.json" }).middleware());

setupStartHandlers(bot, ADMIN_IDS);
setupNameHandlers(bot);
setupPhoneHandlers(bot);
setupAdminHandlers(bot, ADMIN_IDS);
setupServicesHandlers(bot);
setupCalendarHandlers(bot);
setupTimeHandlers(bot, ADMIN_IDS);
setupProfileHandlers(bot);
setupCancelAppointmentHandlers(bot, ADMIN_IDS); // <-- ДОДАНО: Виклик нового обробника

bot.on("text", async (ctx) => {
  console.log(
    `Index.js - fallback text handler - current nextStep: ${ctx.session.nextStep}, text: "${ctx.message.text}"`
  );
  await ctx.reply(
    getTranslation(ctx.session.lang || "ua", "help_message"),
    getMainMenuKeyboard(ctx.session.lang || "ua", ctx.session.isAdmin)
  );
});

bot.launch();

console.log("Бот запущено");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
