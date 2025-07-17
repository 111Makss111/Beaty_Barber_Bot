// handlers/calendarHandler.js

const { findUser, saveUser } = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getCalendarInlineKeyboard } = require("../keyboard/calendar");
const { getServiceMenuInlineKeyboard } = require("../keyboard/serviceMenu"); // Переконайтесь, що цей імпорт коректний, якщо ти використовуєш інлайн-кнопки для послуг
const { showTimeSlots } = require("./timeSlotHandler");

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

    try {
      await ctx.editMessageReplyMarkup(
        getCalendarInlineKeyboard(year, month, lang).reply_markup
      );
    } catch (error) {
      console.error("Помилка редагування календаря (навігація):", error);
      await ctx.reply(getTranslation("error_try_again", lang));
    }
    return;
  }

  if (callbackData === "back_to_services_from_calendar") {
    user.current_date = null;
    userStates[userId].state = "waiting_for_service_selection";
    saveUser(user);

    try {
      // Спробуємо відредагувати існуюче повідомлення, якщо можливо
      await ctx.editMessageText(getTranslation("choose_service", lang), {
        reply_markup: getServiceMenuInlineKeyboard(lang).reply_markup,
      });
    } catch (error) {
      // Якщо не вдалося відредагувати (наприклад, повідомлення занадто старе), відправимо нове
      console.error(
        "Error editing message back to services from calendar:",
        error
      );
      await ctx.reply(
        getTranslation("choose_service", lang),
        getServiceMenuInlineKeyboard(lang)
      );
    }
    return;
  }

  if (callbackData.startsWith("date_")) {
    const selectedDateString = callbackData.split("_")[1];

    // Ця перевірка по суті дублює логіку з getCalendarInlineKeyboard,
    // але є важливою для безпеки та уникнення запису на неактивні дати,
    // якщо користувач якось обійшов візуал.
    const selectedDate = new Date(selectedDateString);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today || callbackData === "ignore_fully_booked") {
      await ctx.reply(
        getTranslation("error_try_again", lang) +
          "\n\n" +
          (lang === "ua"
            ? "Ви не можете обрати минулу або повністю заброньовану дату."
            : "Nie możesz wybrać przeszłej lub całkowicie zarezerwowanej daty."),
        // Прибираємо інлайн-клавіатуру, щоб вона не заважала
        { reply_markup: { inline_keyboard: [] } }
      );
      // Повторно показуємо календар, щоб користувач міг обрати іншу дату
      await showCalendar(
        ctx,
        selectedDate.getFullYear(),
        selectedDate.getMonth()
      );
      return;
    }

    user.current_date = selectedDateString;
    saveUser(user);

    try {
      await ctx.editMessageText(
        `${getTranslation("data_saved", lang, {
          first_name: user.first_name || "клієнт",
        })}. ` +
          `Ви обрали дату: **${selectedDateString}**. Тепер оберіть час.`,
        { parse_mode: "Markdown", reply_markup: { inline_keyboard: [] } }
      );
    } catch (error) {
      console.error("Error editing message after date selection:", error);
      // Якщо не вдалося відредагувати, відправляємо нове повідомлення
      await ctx.reply(
        `${getTranslation("data_saved", lang, {
          first_name: user.first_name || "клієнт",
        })}. ` +
          `Ви обрали дату: **${selectedDateString}**. Тепер оберіть час.`,
        { parse_mode: "Markdown", reply_markup: { inline_keyboard: [] } }
      );
    }

    await showTimeSlots(ctx);
    return;
  }

  if (callbackData.startsWith("ignore")) {
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  showCalendar,
  handleCalendarCallback,
};
