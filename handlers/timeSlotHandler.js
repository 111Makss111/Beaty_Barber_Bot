const {
  findUser,
  saveUser,
  getSchedule,
  updateSchedule,
} = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getTimeSlotsInlineKeyboard } = require("../keyboard/timeSlots");
const { getCalendarInlineKeyboard } = require("../keyboard/calendar");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu");

const { userStates } = require("./userPhone");

const showTimeSlots = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);

  if (!user || !user.current_date) {
    await ctx.reply(getTranslation("error_try_again", "ua"));
    return;
  }

  const lang = user.lang;
  const selectedDateString = user.current_date;

  userStates[userId] = { state: "waiting_for_time_selection", lang: lang };
  saveUser(user);

  // Виправлено: Використовуємо choose_time_slot з плейсхолдером дати
  await ctx.reply(
    getTranslation("choose_time_slot", lang, { date: selectedDateString }),
    getTimeSlotsInlineKeyboard(selectedDateString, lang)
  );
};

const handleTimeSlotCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = findUser(userId);
  let currentState = userStates[userId];

  await ctx.answerCbQuery();

  if (
    !user ||
    !currentState ||
    currentState.state !== "waiting_for_time_selection"
  ) {
    await ctx.reply(getTranslation("error_try_again", user ? user.lang : "ua"));
    return;
  }

  const lang = user.lang;

  // Обробка повернення до календаря
  if (callbackData === "back_to_calendar_from_time") {
    user.current_date = null;
    saveUser(user);

    userStates[userId].state = "waiting_for_date_selection";
    saveUser(user);

    try {
      await ctx.editMessageReplyMarkup({}); // Прибираємо інлайн-клавіатуру
    } catch (error) {
      console.error(
        "Error editing message markup in handleTimeSlotCallback (back_to_calendar_from_time):",
        error
      );
    }

    const now = new Date();
    const displayYear = user.current_date
      ? new Date(user.current_date).getFullYear()
      : now.getFullYear();
    const displayMonth = user.current_date
      ? new Date(user.current_date).getMonth()
      : now.getMonth();
    await ctx.reply(
      getTranslation("choose_date", lang),
      getCalendarInlineKeyboard(displayYear, displayMonth, lang)
    );
    return;
  }

  // Обробка вибору часового слоту
  if (callbackData.startsWith("time_")) {
    const selectedTime = callbackData.split("_")[1];
    const selectedDateString = user.current_date;

    const schedule = getSchedule();
    const daySchedule = schedule[selectedDateString] || {};
    if (
      daySchedule[selectedTime] &&
      (daySchedule[selectedTime].status === "booked" ||
        daySchedule[selectedTime].status === "blocked_admin")
    ) {
      // Виправлено: Використовуємо переклад для повідомлення про недоступність слоту
      await ctx.reply(
        getTranslation("slot_taken_while_confirming", lang),
        getTimeSlotsInlineKeyboard(selectedDateString, lang)
      );
      return;
    }

    user.current_time = selectedTime;
    userStates[userId].state = "waiting_for_confirmation";
    saveUser(user);

    try {
      await ctx.editMessageReplyMarkup({}); // Прибираємо інлайн-клавіатуру
    } catch (error) {
      console.error(
        "Error editing message markup in handleTimeSlotCallback (time_):",
        error
      );
    }

    // user.current_service тут повинен бути ключем (service_manicure, service_pedicure тощо)
    const serviceName = getTranslation(user.current_service, lang);

    await ctx.reply(
      getTranslation("confirmation_message", lang, {
        service: serviceName, // Передаємо перекладене ім'я послуги
        date: selectedDateString,
        time: selectedTime,
      }),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: getTranslation("button_confirm", lang),
                callback_data: "confirm_booking",
              },
              {
                text: getTranslation("button_cancel_booking", lang),
                callback_data: "cancel_booking",
              },
            ],
          ],
        },
      }
    );
    return;
  }

  if (callbackData === "ignore_slot") {
    await ctx.answerCbQuery(getTranslation("slot_not_available", lang), {
      show_alert: true,
    });
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  showTimeSlots,
  handleTimeSlotCallback,
};
