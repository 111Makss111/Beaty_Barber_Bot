const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");
const { getMainMenuKeyboard } = require("../keyboards"); // Потрібно для повернення в головне меню

function getAdminMenuKeyboard(lang) {
  return Markup.keyboard([
    [
      getTranslation(lang, "view_all_records_btn"),
      getTranslation(lang, "block_date_time_btn"),
    ],
    [
      getTranslation(lang, "add_to_portfolio_btn"),
      getTranslation(lang, "block_client_btn"),
    ],
  ]).resize();
}

function setupAdminHandlers(bot, ADMIN_IDS) {
  // Обробник для входу в адмін-меню
  bot.hears(
    (text, ctx) =>
      ADMIN_IDS.includes(ctx.from.id) &&
      text === getTranslation(ctx.session.lang, "admin_menu_btn"),
    async (ctx) => {
      ctx.session.nextStep = "admin_menu";
      // Видаляємо попереднє повідомлення користувача, якщо воно є, щоб очистити чат
      if (ctx.message) {
        await ctx
          .deleteMessage(ctx.message.message_id)
          .catch((e) => console.error("Failed to delete message:", e));
      }
      await ctx.reply(
        // Використовуємо ctx.reply тут, щоб надіслати reply-клавіатуру адмін-меню
        getTranslation(ctx.session.lang, "admin_menu_welcome"),
        getAdminMenuKeyboard(ctx.session.lang)
      );
    }
  );

  // Обробка текстових повідомлень, коли nextStep = 'admin_menu'
  bot.on("text", async (ctx, next) => {
    const userId = ctx.from.id;
    const isAdmin = ADMIN_IDS.includes(userId);

    // Якщо не адмін або не в адмін-меню, передаємо далі
    if (!isAdmin || ctx.session.nextStep !== "admin_menu") {
      return next();
    }

    const messageText = ctx.message.text;
    const lang = ctx.session.lang;

    const viewAllRecordsBtnText = getTranslation(lang, "view_all_records_btn");
    const blockDateTimeBtnText = getTranslation(lang, "block_date_time_btn");
    const addToPortfolioBtnText = getTranslation(lang, "add_to_portfolio_btn");
    const blockClientBtnText = getTranslation(lang, "block_client_btn");
    const backToMainMenuBtnText = getTranslation(lang, "back_to_main_menu_btn"); // Якщо цю кнопку було введено вручну, а не з клавіатури адміна

    if (messageText === viewAllRecordsBtnText) {
      // Для цієї кнопки ми НЕ обробляємо її тут, а дозволяємо viewRecordsAdmin.js обробляти
      return next();
    } else if (messageText === blockDateTimeBtnText) {
      await ctx.reply(getTranslation(lang, "block_date_time_future_impl"));
    } else if (messageText === addToPortfolioBtnText) {
      await ctx.reply(getTranslation(lang, "add_to_portfolio_future_impl"));
    } else if (messageText === blockClientBtnText) {
      await ctx.reply(getTranslation(lang, "block_client_future_impl"));
    } else if (messageText === backToMainMenuBtnText) {
      // Це для обробки, якщо адмін спробує повернутись
      ctx.session.nextStep = null; // Виходимо з адмін-меню
      // Видаляємо повідомлення з адмін-меню, щоб очистити чат
      await ctx
        .deleteMessage(ctx.message.message_id)
        .catch((e) => console.error("Failed to delete message:", e));
      await ctx.reply(
        getTranslation(lang, "main_menu_welcome"),
        getMainMenuKeyboard(lang, false)
      );
      return; // Зупиняємо обробку
    }
    // Якщо жодна з кнопок адмін-меню не співпала, передаємо далі
    return next();
  });
}

module.exports = {
  getAdminMenuKeyboard,
  setupAdminHandlers,
};
