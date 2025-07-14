const { getTranslation } = require("../translate");
const { getPhoneKeyboard } = require("../keyboards");

function setupNameHandlers(bot) {
  bot.on("text", async (ctx, next) => {
    // <-- Додаємо 'next' як аргумент
    console.log("Handlers/name.js - current nextStep:", ctx.session.nextStep);
    if (ctx.session.nextStep === "await_name") {
      const fullName = ctx.message.text;
      ctx.session.userName = fullName;
      ctx.session.nextStep = "await_phone";
      console.log("Handlers/name.js - nextStep set to await_phone");
      await ctx.reply(getTranslation(ctx.session.lang, "name_saved", fullName));
      await ctx.reply(
        getTranslation(ctx.session.lang, "request_phone"),
        getPhoneKeyboard(ctx.session.lang, getTranslation)
      );
      return; // <-- Важливо завершити обробку, якщо ми її обробили
    }
    // Якщо цей обробник не обробив повідомлення, передаємо його далі
    return next(); // <-- ВАЖЛИВО! Передаємо управління наступному обробнику
  });
}

module.exports = {
  setupNameHandlers,
};
