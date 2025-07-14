const { Telegraf, session, Markup } = require("telegraf");
const LocalSession = require("telegraf-session-local");
const config = require("../config");
const {
  startHandler,
  setLanguageHandler,
  handleUserInfoInput,
  handleContactInput,
} = require("./handlers/startHandler");
const { handleMainMenu } = require("./handlers/mainMenuHandler"); // Імпортуємо обробник головного меню
const { getMessage } = require("../utils/i18n");

const bot = new Telegraf(config.botToken);

const sessionDirectory = "data";
const fs = require("fs");
if (!fs.existsSync(sessionDirectory)) {
  fs.mkdirSync(sessionDirectory);
}
bot.use(new LocalSession({ database: "data/sessions.json" }).middleware());

bot.start(startHandler);
bot.action(/set_lang_(uk|pl)/, setLanguageHandler);

// Обробка текстових повідомлень
bot.on("text", async (ctx, next) => {
  if (
    ctx.session?.userState === "waiting_for_name" ||
    ctx.session?.userState === "waiting_for_phone"
  ) {
    return handleUserInfoInput(ctx);
  }
  // Передаємо контекст для визначення мови у getMessage
  const bookAppointmentText = getMessage(ctx, "bookAppointment");
  const viewMyAppointmentsText = getMessage(ctx, "viewMyAppointments");
  const portfolioText = getMessage(ctx, "portfolio");

  if (
    [bookAppointmentText, viewMyAppointmentsText, portfolioText].includes(
      ctx.message.text
    )
  ) {
    return handleMainMenu(ctx);
  }
  return next(); // Передаємо далі, якщо це не команди меню
});

// Обробка надсилання контакту
bot.on("contact", handleContactInput);

// Обробка кнопки "Повернутись до головного меню" (inline)
bot.action("back_to_main_menu", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage(); // Можна видалити попереднє повідомлення з inline-клавіатурою
  await ctx.reply(
    getMessage(ctx, "mainMenu"),
    Markup.keyboard([
      [
        getMessage(ctx, "bookAppointment"),
        getMessage(ctx, "viewMyAppointments"),
      ],
      [getMessage(ctx, "portfolio"), getMessage(ctx, "changeLanguage")],
    ]).resize()
  );
  ctx.session.userState = "idle"; // Повертаємо стан на idle
});

bot
  .launch()
  .then(() => console.log("Bot started"))
  .catch((err) => console.error("Bot launch error:", err));

module.exports = bot;
