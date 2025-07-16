const {
  findUser,
  saveUser,
  getSchedule,
  updateSchedule,
} = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getTimeSlotsInlineKeyboard } = require("../keyboard/timeSlots");
const { getCalendarInlineKeyboard } = require("../keyboard/calendar"); // Для повернення до календаря

const { userStates } = require("./userPhone");

/**
 * Показує користувачеві доступні часові слоти для обраної дати.
 * @param {Object} ctx - Об'єкт контексту Telegraf.
 */
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

  await ctx.reply(
    getTranslation("choose_time", lang),
    getTimeSlotsInlineKeyboard(selectedDateString, lang)
  );
};

/**
 * Обробляє callback-запити, пов'язані з вибором часу.
 * Включає вибір слоту та повернення до календаря.
 * @param {Object} ctx - Об'єкт контексту Telegraf (містить callbackQuery).
 */
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
    // Очищаємо current_date, так як повертаємося на крок назад
    user.current_date = null;
    saveUser(user);

    // Встановлюємо стан користувача на очікування вибору дати
    userStates[userId].state = "waiting_for_date_selection";
    saveUser(user);

    // Редагуємо попереднє повідомлення, щоб прибрати кнопки часу
    try {
      await ctx.editMessageText(
        getTranslation("choose_date", lang), // Змінюємо текст на "Оберіть дату:"
        { reply_markup: { inline_keyboard: [] } }
      );
    } catch (error) {
      // Може виникнути, якщо повідомлення вже було видалено/змінено
    }

    // Повертаємося до календаря, відображаючи обраний раніше місяць/рік, якщо можливо
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
    const selectedTime = callbackData.split("_")[1]; // Наприклад, "09:00"
    const selectedDateString = user.current_date; // Отримуємо дату з user

    // Перевірка, чи не був слот зайнятий/заблокований кимось іншим, поки користувач обирав
    const schedule = getSchedule();
    const daySchedule = schedule[selectedDateString] || {};
    if (
      daySchedule[selectedTime] &&
      (daySchedule[selectedTime].status === "booked" ||
        daySchedule[selectedTime].status === "blocked_admin")
    ) {
      await ctx.reply(
        lang === "ua"
          ? "Цей час щойно став недоступним. Будь ласка, оберіть інший."
          : "Ten czas właśnie stał się niedostępny. Proszę wybrać inny.",
        getTimeSlotsInlineKeyboard(selectedDateString, lang) // Знову показуємо доступні слоти
      );
      return;
    }

    // Зберігаємо обраний час
    user.current_time = selectedTime;
    saveUser(user);

    // Оновлюємо глобальний розклад (_schedule)
    if (!schedule[selectedDateString]) {
      schedule[selectedDateString] = {};
    }
    schedule[selectedDateString][selectedTime] = {
      status: "booked", // Позначаємо як "заброньовано"
      userId: userId,
      service: user.current_service,
      userName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      userPhone: user.phone,
    };
    updateSchedule(schedule); // Зберігаємо оновлений розклад

    // Очищаємо тимчасові дані вибору
    delete user.current_service;
    delete user.current_date;
    delete user.current_time;
    delete userStates[userId];
    user.state = null; // Обнуляємо state у об'єкті користувача
    saveUser(user);

    // Редагуємо попереднє повідомлення та підтверджуємо запис
    await ctx.editMessageText(
      lang === "ua"
        ? `✅ Чудово! Ви успішно записалися на **${
            user.current_service || "послугу"
          }** ` +
            `на **${selectedDateString}** о **${selectedTime}**. \n\n` +
            `Ваш запис: **${selectedDateString}**, **${selectedTime}**, **${
              user.current_service || "послуга"
            }**. \n\n` +
            `Ми зв'яжемося з вами найближчим часом для підтвердження. Дякуємо!`
        : `✅ Świetnie! Pomyślnie zarezerwowałeś/aś się na **${
            user.current_service || "usługę"
          }** ` +
            `na dzień **${selectedDateString}** o godzinie **${selectedTime}**. \n\n` +
            `Twoja rezerwacja: **${selectedDateString}**, **${selectedTime}**, **${
              user.current_service || "usługa"
            }**. \n\n` +
            `Skontaktujemy się z Tobą wkrótce, aby potwierdzić. Dziękujemy!`,
      { parse_mode: "Markdown", reply_markup: { inline_keyboard: [] } } // Прибираємо кнопки
    );
    // Можна також надіслати повідомлення з головним меню
    await ctx.reply(
      getTranslation("choose_action", lang),
      getClientMainMenuKeyboard(lang)
    );
    return;
  }

  if (callbackData === "ignore_slot") {
    return; // Ігноруємо натискання на неактивні слоти
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  showTimeSlots,
  handleTimeSlotCallback,
};
