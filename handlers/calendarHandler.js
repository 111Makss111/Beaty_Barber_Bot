const { findUser, saveUser } = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getCalendarInlineKeyboard } = require("../keyboard/calendar");
const { getServiceMenuInlineKeyboard } = require("../keyboard/serviceMenu");
const { showTimeSlots } = require("./timeSlotHandler"); // Підключаємо showTimeSlots

const { userStates } = require("./userPhone");

const showCalendar = async (ctx, year, month) => {
  const userId = ctx.from.id;
  const user = findUser(userId);

  if (!user) {
    await ctx.reply(getTranslation("error_try_again", "ua"));
    return;
  }

  const lang = user.lang;
  const now = new Date();
  const displayYear = year !== undefined ? year : now.getFullYear();
  const displayMonth = month !== undefined ? month : now.getMonth();

  userStates[userId] = { state: "waiting_for_date_selection", lang: lang };
  saveUser(user);

  await ctx.reply(
    getTranslation("choose_date", lang),
    getCalendarInlineKeyboard(displayYear, displayMonth, lang)
  );
};

const handleCalendarCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = findUser(userId);
  let currentState = userStates[userId];

  await ctx.answerCbQuery();

  if (
    !user ||
    !currentState ||
    currentState.state !== "waiting_for_date_selection"
  ) {
    await ctx.reply(getTranslation("error_try_again", user ? user.lang : "ua"));
    return;
  }

  const lang = user.lang;

  if (
    callbackData.startsWith("cal_prev_") ||
    callbackData.startsWith("cal_next_")
  ) {
    const parts = callbackData.split("_");
    const action = parts[1];
    let year = parseInt(parts[2], 10);
    let month = parseInt(parts[3], 10);

    if (action === "prev") {
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
    } else if (action === "next") {
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    await ctx.editMessageReplyMarkup(
      getCalendarInlineKeyboard(year, month, lang).reply_markup
    );
    return;
  }

  if (callbackData === "back_to_services_from_calendar") {
    user.current_date = null; // Очищаємо обрану дату
    userStates[userId].state = "waiting_for_service_selection";
    saveUser(user);

    try {
      await ctx.editMessageText(getTranslation("choose_action", lang), {
        reply_markup: { inline_keyboard: [] },
      });
    } catch (error) {}

    await ctx.reply(
      getTranslation("choose_action", lang),
      getServiceMenuInlineKeyboard(lang)
    );
    return;
  }

  if (callbackData.startsWith("date_")) {
    const selectedDateString = callbackData.split("_")[1];

    const selectedDate = new Date(selectedDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      await ctx.reply(
        getTranslation("error_try_again", lang) +
          "\n\n" +
          (lang === "ua"
            ? "Ви не можете обрати минулу дату."
            : "Nie możesz wybrać przeszłej daty."),
        {
          reply_markup: { inline_keyboard: [] },
        }
      );
      await showCalendar(
        ctx,
        selectedDate.getFullYear(),
        selectedDate.getMonth()
      );
      return;
    }

    user.current_date = selectedDateString;
    // userStates[userId].state = 'waiting_for_time_selection'; // Цей стан буде встановлено в showTimeSlots
    saveUser(user);

    // Редагуємо попереднє повідомлення, щоб прибрати календар
    try {
      await ctx.editMessageText(
        `${getTranslation("data_saved", lang, {
          first_name: user.first_name || "клієнт",
        })}. ` +
          `Ви обрали дату: **${selectedDateString}**. Тепер оберіть час.`, // Текст без "ЦЕ ТИМЧАСОВИЙ ТЕКСТ"
        { parse_mode: "Markdown", reply_markup: { inline_keyboard: [] } }
      );
    } catch (error) {}

    // ВИКЛИКАЄМО ФУНКЦІЮ ДЛЯ ВІДОБРАЖЕННЯ ВИБОРУ ГОДИН
    await showTimeSlots(ctx);
    return;
  }

  if (callbackData === "ignore") {
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  showCalendar,
  handleCalendarCallback,
};
