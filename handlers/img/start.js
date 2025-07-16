const { Markup } = require("telegraf");

// Шлях до зображення (ти зможеш його змінити)
const IMAGE_PATH = "."; // Заміни на свій шлях або завантаж локально

const startCommand = (bot) => {
  bot.start(async (ctx) => {
    // Текст привітання українською та польською
    const welcomeTextUA =
      "Вітаємо! Я твій помічник для запису на б’юті-послуги. Обери зручну мову:";
    const welcomeTextPL =
      "Witaj! Jestem Twoim asystentem do umawiania wizyt na usługi beauty. Wybierz dogodny język:";

    // Клавіатура для вибору мови
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback("🇺🇦 Українська", "set_lang_ua"),
      Markup.button.callback("🇵🇱 Polska", "set_lang_pl"),
    ]);

    // Відправляємо фото та текст з клавіатурою
    await ctx.replyWithPhoto(IMAGE_PATH, {
      caption: `${welcomeTextUA}\n\n${welcomeTextPL}`,
      ...keyboard,
    });
  });

  // Заглушки для обробки кнопок вибору мови (поки що просто відповідь)
  bot.action("set_lang_ua", async (ctx) => {
    await ctx.answerCbQuery(); // Закриваємо сповіщення про натискання
    await ctx.reply("Ти обрав українську мову.");
    // Тут буде логіка збереження мови користувача в JSON
  });

  bot.action("set_lang_pl", async (ctx) => {
    await ctx.answerCbQuery(); // Закриваємо сповіщення про натискання
    await ctx.reply("Wybrałeś język polski.");
    // Тут буде логіка збереження мови користувача в JSON
  });
};

module.exports = startCommand;
