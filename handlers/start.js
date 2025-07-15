const { Markup } = require("telegraf");

module.exports = async (ctx) => {
  try {
    await ctx.replyWithPhoto(
      { source: "./img/photo_2025-05-10_09-58-14.jpg" },
      { caption: "👋 Вітаю в нашому Telegram-боті!" }
    );

    await ctx.reply(
      "Будь ласка, обери мову спілкування:",
      Markup.keyboard([["🇺🇦 Українська", "🇵🇱 Польська"]])
        .resize()
        .oneTime()
    );
  } catch (err) {
    console.error("Помилка в start.js:", err);
  }
};
