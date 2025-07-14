const { getTranslation } = require("../translate");
const { getAdminMenuKeyboard, getMainMenuKeyboard } = require("../keyboards");

function setupAdminHandlers(bot, ADMIN_IDS) {
  // Обробники для інших кнопок адмін-меню
  bot.on("text", async (ctx, next) => {
    const userId = ctx.from.id;
    const messageText = ctx.message.text;
    const viewRecordsBtnText = getTranslation(
      ctx.session.lang || "ua",
      "view_all_records_btn"
    );
    const blockDateTimeBtnText = getTranslation(
      ctx.session.lang || "ua",
      "block_date_time_btn"
    );
    const addToPortfolioBtnText = getTranslation(
      ctx.session.lang || "ua",
      "add_to_portfolio_btn"
    );

    // Перевіряємо, чи ми в адмін-меню І чи користувач є адміном
    if (ctx.session.nextStep === "admin_menu" && ADMIN_IDS.includes(userId)) {
      if (messageText === viewRecordsBtnText) {
        await ctx.reply(
          "Функціонал 'Переглянути всі записи' буде реалізовано."
        );
        return;
      }
      if (messageText === blockDateTimeBtnText) {
        await ctx.reply(
          "Функціонал 'Заблокувати Дату/Години' буде реалізовано."
        );
        return;
      }
      if (messageText === addToPortfolioBtnText) {
        await ctx.reply("Функціонал 'Додати до Портфоліо' буде реалізовано.");
        return;
      }
    }
    return next();
  });
}

module.exports = {
  setupAdminHandlers,
};
