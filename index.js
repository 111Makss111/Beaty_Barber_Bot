require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
const { getTranslation } = require("./utils/translate");
const { getMainMenuKeyboard } = require("./keyboards/mainMenu");

const handleStart = require("./handlers/start");
const handleUserName = require("./handlers/userName");
const handleUserPhone = require("./handlers/userPhone");

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🎯 Спочатку основні команди
bot.start(handleStart);

bot.on("text", async (ctx) => {
  await handleUserName(ctx);
  await handleUserPhone(ctx);
});

bot.on("contact", async (ctx) => {
  await handleUserPhone(ctx);
});

// ✅ Після створення `bot` — підключаємо `.action(...)`
bot.action("tg_phone", async (ctx) => {
  await ctx.reply(
    "📲 Надішліть свій номер через кнопку нижче:",
    Markup.keyboard([Markup.button.contactRequest("📤 Надіслати мій номер")])
      .resize()
      .oneTime()
  );
});

bot.action("skip_phone", async (ctx) => {
  const userId = String(ctx.from.id);
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
  const user = users[userId] || {};
  user.phone = null;
  users[userId] = user;
  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));

  await ctx.editMessageText(getTranslation(user.language, "no_phone"));
  await ctx.reply(
    getTranslation(user.language, "main_menu_text"),
    getMainMenuKeyboard(user.language)
  );
});

// 🚀 Запуск
bot
  .launch()
  .then(() => console.log("🤖 Бот успішно запущено"))
  .catch((err) => console.error("🚨 Помилка запуску бота:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
