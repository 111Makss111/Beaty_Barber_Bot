const { getTranslation } = require("../translate");
const { getPhoneKeyboard, getMainMenuKeyboard } = require("../keyboards");

function setupPhoneHandlers(bot) {
  bot.on("contact", async (ctx, next) => {
    // <-- Додаємо 'next'
    console.log(
      "Handlers/phone.js - contact handler - current nextStep:",
      ctx.session.nextStep
    );
    if (ctx.session.nextStep === "await_phone") {
      const phoneNumber = ctx.message.contact.phone_number;
      ctx.session.userPhone = phoneNumber;
      ctx.session.nextStep = null;
      console.log("Handlers/phone.js - contact saved, nextStep set to null");
      await ctx.reply(
        getTranslation(ctx.session.lang, "phone_saved", phoneNumber),
        { reply_markup: { remove_keyboard: true } }
      );
      await ctx.reply(
        getTranslation(ctx.session.lang, "main_menu_welcome"),
        getMainMenuKeyboard(ctx.session.lang)
      );
      return; // <-- Важливо завершити обробку
    }
    return next(); // <-- Передаємо далі, якщо не обробили
  });

  bot.on("text", async (ctx, next) => {
    // <-- Додаємо 'next'
    console.log(
      "Handlers/phone.js - text handler - current nextStep:",
      ctx.session.nextStep
    );
    if (ctx.session.nextStep === "await_phone") {
      const messageText = ctx.message.text;
      const skipButtonText = getTranslation(ctx.session.lang, "skip_phone_btn");

      if (messageText === skipButtonText) {
        ctx.session.userPhone = null;
        ctx.session.nextStep = null;
        console.log("Handlers/phone.js - phone skipped, nextStep set to null");
        await ctx.reply(getTranslation(ctx.session.lang, "phone_skipped"), {
          reply_markup: { remove_keyboard: true },
        });
        await ctx.reply(
          getTranslation(ctx.session.lang, "main_menu_welcome"),
          getMainMenuKeyboard(ctx.session.lang)
        );
        return; // <-- Важливо завершити обробку
      }

      const phoneRegex = /^\d{9}$/;
      if (phoneRegex.test(messageText)) {
        ctx.session.userPhone = messageText;
        ctx.session.nextStep = null;
        console.log("Handlers/phone.js - phone saved, nextStep set to null");
        await ctx.reply(
          getTranslation(ctx.session.lang, "phone_saved", messageText),
          { reply_markup: { remove_keyboard: true } }
        );
        await ctx.reply(
          getTranslation(ctx.session.lang, "main_menu_welcome"),
          getMainMenuKeyboard(ctx.session.lang)
        );
        return; // <-- Важливо завершити обробку
      } else {
        console.log("Handlers/phone.js - invalid phone format");
        await ctx.reply(
          getTranslation(ctx.session.lang, "invalid_phone"),
          getPhoneKeyboard(ctx.session.lang, getTranslation)
        );
        return; // <-- Важливо завершити обробку
      }
    }
    return next(); // <-- ВАЖЛИВО! Передаємо управління наступному обробнику, якщо не обробили
  });
}

module.exports = {
  setupPhoneHandlers,
};
