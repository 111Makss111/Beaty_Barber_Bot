const { getTranslation } = require("../translate");
const {
  getServicesKeyboard,
  getMainMenuKeyboard,
  getCalendarKeyboard,
} = require("../keyboards"); // Додаємо getCalendarKeyboard для повноти імпортів

function setupServicesHandlers(bot) {
  // Обробник натискання кнопки "✍️ Записатись" з головного меню (залишається text)
  bot.on("text", async (ctx, next) => {
    const messageText = ctx.message.text;
    const bookAppointmentBtnText = getTranslation(
      ctx.session.lang || "ua",
      "book_appointment_btn"
    );

    if (
      (ctx.session.nextStep === null || ctx.session.nextStep === "main_menu") &&
      messageText === bookAppointmentBtnText
    ) {
      ctx.session.nextStep = "await_service_selection"; // Встановлюємо новий стан
      await ctx.reply(
        getTranslation(ctx.session.lang, "select_service"),
        getServicesKeyboard(ctx.session.lang)
      );
      return;
    }
    return next();
  });

  // Обробник вибору послуги або повернення з меню послуг (callback_query)
  bot.on("callback_query", async (ctx, next) => {
    const callbackData = ctx.callbackQuery.data;

    // Перевіряємо, чи ми очікуємо вибір послуги
    if (ctx.session.nextStep === "await_service_selection") {
      await ctx.answerCbQuery(); // Закриваємо сповіщення про натискання кнопки

      if (callbackData === "back_to_main_menu") {
        console.log(
          'User pressed "Back to Main Menu" from services. Clearing inline keyboard and sending new message with main menu.'
        ); // Дебаг
        ctx.session.nextStep = null; // Повертаємось до загального стану (або 'main_menu')

        // КРОК 1: Видаляємо інлайн-клавіатуру з поточного повідомлення
        try {
          await ctx.editMessageReplyMarkup({}); // Просто видаляємо reply_markup
        } catch (e) {
          console.error(
            "Failed to edit message reply markup to remove inline keyboard:",
            e
          );
          // Якщо не вдалося відредагувати, можливо, повідомлення вже старе або було змінене.
          // Продовжуємо надсилати нове.
        }

        // КРОК 2: Відправляємо нове повідомлення зі ЗВИЧАЙНОЮ клавіатурою головного меню
        await ctx.reply(
          getTranslation(ctx.session.lang, "main_menu_welcome"),
          getMainMenuKeyboard(ctx.session.lang)
        );
        return;
      }

      let selectedService = null;
      let serviceNameForReply = "";

      switch (callbackData) {
        case "manicure":
          selectedService = "manicure";
          serviceNameForReply = getTranslation(
            ctx.session.lang,
            "manicure_service_btn"
          );
          break;
        case "pedicure":
          selectedService = "pedicure";
          serviceNameForReply = getTranslation(
            ctx.session.lang,
            "pedicure_service_btn"
          );
          break;
        case "removal":
          selectedService = "removal";
          serviceNameForReply = getTranslation(
            ctx.session.lang,
            "removal_service_btn"
          );
          break;
        case "strengthening":
          selectedService = "strengthening";
          serviceNameForReply = getTranslation(
            ctx.session.lang,
            "strengthening_service_btn"
          );
          break;
      }

      if (selectedService) {
        ctx.session.selectedService = selectedService;

        ctx.session.nextStep = "await_date_selection";
        const today = new Date();
        ctx.session.calendarYear = today.getFullYear();
        ctx.session.calendarMonth = today.getMonth();

        // Оновлюємо попереднє повідомлення (вибір послуг) на повідомлення з календарем
        // Тут все ще editMessageText, бо ми переходимо з однієї INLINE-клавіатури на іншу INLINE-клавіатуру
        await ctx.editMessageText(
          getTranslation(
            ctx.session.lang,
            "service_selected",
            serviceNameForReply
          ) +
            "\n\n" +
            getTranslation(ctx.session.lang, "request_date"),
          {
            reply_markup: getCalendarKeyboard(
              ctx.session.calendarYear,
              ctx.session.calendarMonth,
              ctx.session.lang
            ).reply_markup,
          }
        );
        return;
      } else {
        // Якщо натиснуто щось незрозуміле в меню послуг
      }
    }
    return next();
  });
}

module.exports = {
  setupServicesHandlers,
};
