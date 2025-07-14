const { getTranslation } = require("../translate");
const { getLanguageSelectionKeyboard } = require("../keyboards");
const { getAdminMenuKeyboard } = require("../keyboards");
const { getMainMenuKeyboard } = require("../keyboards");

function setupStartHandlers(bot, ADMIN_IDS) {
  bot.start(async (ctx) => {
    ctx.session.nextStep = "await_language_selection";
    await ctx.reply(
      getTranslation(ctx.session.lang || "ua", "choose_language"),
      getLanguageSelectionKeyboard()
    );
  });
  bot.on("text", async (ctx, next) => {
    const userId = ctx.from.id;
    const messageText = ctx.message.text;

    if (ctx.session.nextStep === "await_language_selection") {
      let selectedLang = null;
      if (messageText === "🇺🇦 Українська") {
        selectedLang = "ua";
      } else if (messageText === "🇵🇱 Polska") {
        // <-- ЗМІНА ТУТ: 'Polski' на 'Polska'
        selectedLang = "pl";
      }

      if (selectedLang) {
        ctx.session.lang = selectedLang;
        await ctx.reply(getTranslation(ctx.session.lang, "language_selected"), {
          reply_markup: { remove_keyboard: true },
        });

        console.log(
          `Handlers/start.js - Language selected: ${ctx.session.lang} by user ID: ${userId}`
        );
        console.log(`Handlers/start.js - ADMIN_IDS: ${ADMIN_IDS}`);

        if (ADMIN_IDS.includes(userId)) {
          ctx.session.nextStep = "admin_menu";
          console.log(
            `Handlers/start.js - User ${userId} is admin. Showing admin menu.`
          );
          await ctx.reply(
            getTranslation(ctx.session.lang, "admin_menu_welcome"),
            getAdminMenuKeyboard(ctx.session.lang)
          );
          return;
        } else {
          ctx.session.nextStep = "await_name";
          console.log(
            `Handlers/start.js - User ${userId} is NOT admin. Asking for name.`
          );
          await ctx.reply(getTranslation(ctx.session.lang, "enter_name"));
          return;
        }
      } else {
        await ctx.reply(
          getTranslation(
            ctx.session.lang || "ua",
            "invalid_language_selection"
          ),
          getLanguageSelectionKeyboard()
        );
        return;
      }
    }
    return next();
  });
}

module.exports = {
  setupStartHandlers,
};
