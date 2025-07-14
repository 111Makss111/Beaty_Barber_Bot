const { getTranslation } = require("../translate");
const {
  getCalendarKeyboard,
  getServicesKeyboard,
  getTimeKeyboard,
} = require("../keyboards"); // <-- ДОДАНО: Імпортуємо getTimeKeyboard
const { bookedAppointments } = require("./time"); // <-- ДОДАНО: Імпортуємо bookedAppointments з handlers/time.js

function setupCalendarHandlers(bot) {
  // Обробник натискань на кнопки календаря (інлайн-кнопки)
  bot.on("callback_query", async (ctx, next) => {
    const callbackData = ctx.callbackQuery.data;

    // Перевіряємо, чи ми в стані очікування дати
    if (ctx.session.nextStep === "await_date_selection") {
      await ctx.answerCbQuery(); // Закриваємо сповіщення про натискання кнопки

      // Обробка кнопки "Повернутись до послуг"
      if (callbackData === "back_to_services") {
        console.log(
          'User pressed "Back to Services" from calendar. Returning to service selection.'
        );
        ctx.session.nextStep = "await_service_selection"; // Повертаємось до вибору послуг
        await ctx.editMessageText(
          getTranslation(ctx.session.lang, "select_service"),
          {
            reply_markup: getServicesKeyboard(ctx.session.lang).reply_markup,
          }
        );
        return;
      }

      // Обробка навігації по місяцях або вибору дати
      if (callbackData.startsWith("calendar-")) {
        // Перевірка на префікс 'calendar-' для всіх кнопок календаря
        // Навігація по місяцях
        if (
          callbackData.startsWith("calendar-prev-") ||
          callbackData.startsWith("calendar-next-")
        ) {
          const parts = callbackData.split("-");
          let year = parseInt(parts[2]);
          let month = parseInt(parts[3]);

          if (callbackData.startsWith("calendar-prev-")) {
            month--;
            if (month < 0) {
              month = 11;
              year--;
            }
          } else if (callbackData.startsWith("calendar-next-")) {
            month++;
            if (month > 11) {
              month = 0;
              year++;
            }
          }
          ctx.session.calendarYear = year;
          ctx.session.calendarMonth = month;
          await ctx.editMessageReplyMarkup(
            getCalendarKeyboard(year, month, ctx.session.lang).reply_markup
          );
          return;
        }

        // Вибір конкретної дати
        if (callbackData.startsWith("calendar-date-")) {
          const parts = callbackData.split("-");
          const year = parseInt(parts[2]);
          const month = parseInt(parts[3]);
          const day = parseInt(parts[4]);

          const selectedDate = new Date(year, month, day);
          selectedDate.setHours(0, 0, 0, 0); // Обнуляємо час для коректного порівняння
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate.getTime() < today.getTime()) {
            await ctx.reply(
              getTranslation(ctx.session.lang, "invalid_past_date")
            );
            await ctx.editMessageReplyMarkup(
              getCalendarKeyboard(
                ctx.session.calendarYear,
                ctx.session.calendarMonth,
                ctx.session.lang
              ).reply_markup
            );
            return;
          }

          ctx.session.selectedDate = selectedDate.toISOString(); // Зберігаємо дату у форматі ISO
          ctx.session.nextStep = "await_time_selection"; // Переходимо до вибору часу

          // <-- КЛЮЧОВА ЗМІНА ТУТ: ОДРАЗУ ВІДПРАВЛЯЄМО КЛАВІАТУРУ ЧАСУ
          await ctx.editMessageText(
            getTranslation(
              ctx.session.lang,
              "date_selected",
              selectedDate.toLocaleDateString(
                ctx.session.lang === "ua" ? "uk-UA" : "pl-PL"
              )
            ) +
              "\n\n" +
              getTranslation(ctx.session.lang, "request_time"), // Запитуємо час
            {
              reply_markup: getTimeKeyboard(
                selectedDate,
                bookedAppointments,
                ctx.session.lang
              ).reply_markup, // Відправляємо клавіатуру годин
            }
          );
          return;
        }
      }
    }
    return next(); // Передаємо далі
  });
}

module.exports = {
  setupCalendarHandlers,
};
