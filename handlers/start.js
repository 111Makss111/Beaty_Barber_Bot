const { Markup } = require("telegraf");
const fs = require("fs");
const path = require("path");
const { processLanguageSelection } = require("./userName");
const { getTranslation } = require("../data/translations"); // Підключаємо переклади

const IMAGE_BASENAME = "photo_2025-05-10_09-58-12.jpg";
const IMAGE_DIR = path.join(__dirname, "img");
const IMAGE_PATH = path.join(IMAGE_DIR, IMAGE_BASENAME);

const startCommand = (bot) => {
  bot.start(async (ctx) => {
    // Використовуємо переклади
    const welcomeTextUA = getTranslation("welcome_message", "ua");
    const welcomeTextPL = getTranslation("welcome_message", "pl");

    const keyboard = Markup.keyboard([["🇺🇦 Українська", "🇵🇱 Polska"]])
      .resize()
      .oneTime();

    try {
      await ctx.replyWithPhoto(
        { source: fs.createReadStream(IMAGE_PATH) },
        {
          caption: `${welcomeTextUA}\n\n${welcomeTextPL}`,
          ...keyboard,
        }
      );
    } catch (error) {
      console.error("Помилка при відправці фото:", error);
      // Також використовуємо переклади для помилки
      await ctx.reply(
        `${getTranslation("image_load_error", "ua")}\n\n${getTranslation(
          "image_load_error",
          "pl"
        )}`,
        keyboard
      );
    }
  });

  bot.hears("🇺🇦 Українська", async (ctx) => {
    await processLanguageSelection(ctx, "ua");
  });

  bot.hears("🇵🇱 Polska", async (ctx) => {
    await processLanguageSelection(ctx, "pl");
  });
};

module.exports = startCommand;
