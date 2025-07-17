const { Markup } = require("telegraf");
const { getTranslation } = require("../../data/translations");
const { getSchedule, updateSchedule } = require("../../data/data");
const { userStates } = require("../../handlers/userPhone"); // Зверніть увагу на відносний шлях

/**
 * Генерує всі можливі часові слоти для одного дня (з 9:00 до 18:00 з інтервалом 30 хв).
 * @returns {string[]} Масив часових слотів у форматі "HH:MM".
 */
const generateAllTimeSlots = () => {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) continue; // Виключаємо 18:30
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
};

/**
 * Генерує інлайн-клавіатуру з часовими слотами для адмін-блокування.
 * Показує статус слотів (зарезервовано, заблоковано адміном).
 * @param {string} dateString - Дата у форматі 'YYYY-MM-DD'.
 * @param {string} lang - Мова користувача.
 * @returns {Object} Інлайн-клавіатура Telegraf.
 */
const getAdminTimeSlotsKeyboard = (dateString, lang) => {
  const schedule = getSchedule();
  const daySchedule = schedule[dateString] || {};
  const allPossibleSlots = generateAllTimeSlots();

  const buttons = [];
  const now = new Date();
  const todayString = now.toISOString().slice(0, 10);

  // Додаємо слоти у кнопки
  for (const slot of allPossibleSlots) {
    const [hours, minutes] = slot.split(":").map(Number);
    const slotDateTime = new Date(dateString);
    slotDateTime.setHours(hours, minutes, 0, 0);

    let buttonText = slot;
    let callbackData = `admin_toggle_hour_${dateString}_${slot}`; // Колбек для перемикання години

    const slotInfo = daySchedule[slot];
    if (slotInfo) {
      if (slotInfo.status === "booked") {
        // Якщо зарезервовано клієнтом, то цей слот не можна змінити, але можна показати
        buttonText = `${slot} 🧑`; // Позначаємо як зайнятий клієнтом
        callbackData = "ignore_slot_booked"; // Ігноруємо натискання
      } else if (slotInfo.status === "blocked_admin") {
        buttonText = `${slot} ❌`; // Позначаємо як заблокований адміном
      }
    }

    // Якщо слот у минулому, його теж не можна змінити
    if (
      (dateString === todayString && slotDateTime < now) || // Сьогодні і час вже минув
      new Date(dateString) < new Date(todayString) // День в минулому
    ) {
      buttonText = `${slot} ⌛`; // Минулий час
      callbackData = "ignore_past_slot";
    }

    buttons.push(Markup.button.callback(buttonText, callbackData));
  }

  // Розбиваємо кнопки на ряди по 4
  const rows = [];
  for (let i = 0; i < buttons.length; i += 4) {
    rows.push(buttons.slice(i, i + 4));
  }

  // Додаємо кнопку "Готово" та "Назад до календаря"
  rows.push([
    Markup.button.callback(
      getTranslation("button_finish_blocking_hours", lang),
      `admin_finish_hour_blocking_${dateString}`
    ),
    Markup.button.callback(
      getTranslation("button_back_to_calendar", lang), // ВИПРАВЛЕНО: Використовуємо універсальний ключ
      `admin_back_to_calendar_from_hours_${dateString}`
    ),
  ]);

  return Markup.inlineKeyboard(rows);
};

/**
 * Обробляє вибір години для блокування/розблокування адміном.
 * @param {Object} ctx - Об'єкт контексту Telegraf.
 */
const handleAdminTimeSlotCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = userStates[userId]; // Отримуємо стан користувача

  await ctx.answerCbQuery();

  if (!user || user.state !== "admin_waiting_for_hour_to_block") {
    await ctx.reply(getTranslation("access_denied", user ? user.lang : "ua"));
    return;
  }

  const lang = user.lang;
  const currentSelectedDate = user.current_admin_date; // Отримуємо дату з userStates

  if (!currentSelectedDate) {
    await ctx.reply(getTranslation("error_try_again", lang));
    return;
  }

  // Обробка натискання на слот для блокування/розблокування
  if (callbackData.startsWith("admin_toggle_hour_")) {
    const parts = callbackData.split("_");
    const dateString = parts[3]; // 'YYYY-MM-DD'
    const timeSlot = parts[4]; // 'HH:MM'

    if (dateString !== currentSelectedDate) {
      console.warn(
        `Admin tried to toggle hour on wrong date. Expected: ${currentSelectedDate}, Got: ${dateString}`
      );
      await ctx.reply(getTranslation("error_try_again", lang));
      return;
    }

    const schedule = getSchedule();
    schedule[dateString] = schedule[dateString] || {};
    const daySchedule = schedule[dateString];

    let messageText = "";

    if (
      daySchedule[timeSlot] &&
      daySchedule[timeSlot].status === "blocked_admin"
    ) {
      // Слот вже заблокований адміном, розблоковуємо
      delete daySchedule[timeSlot];
      messageText = getTranslation("admin_hour_unblocked", lang, {
        date: dateString,
        time: timeSlot,
      });
    } else if (
      daySchedule[timeSlot] &&
      daySchedule[timeSlot].status === "booked"
    ) {
      // Слот зайнятий клієнтом, не можемо блокувати
      messageText = getTranslation("slot_not_available", lang);
    } else {
      // Слот вільний, блокуємо
      daySchedule[timeSlot] = {
        status: "blocked_admin",
        timestamp: new Date().toISOString(),
        blockedBy: userId,
      };
      messageText = getTranslation("admin_hour_blocked", lang, {
        date: dateString,
        time: timeSlot,
      });
    }

    updateSchedule(schedule);

    // Оновлюємо клавіатуру, щоб відобразити зміни
    try {
      await ctx.editMessageReplyMarkup(
        getAdminTimeSlotsKeyboard(dateString, lang).reply_markup
      );
      await ctx.answerCbQuery(messageText, { show_alert: true }); // Показати сповіщення
    } catch (error) {
      console.error("Error editing time slots keyboard for admin:", error);
      await ctx.reply(messageText); // Відправити повідомлення, якщо не вдалося відредагувати
    }
    return;
  }

  // Обробка кнопки "Готово"
  if (callbackData.startsWith("admin_finish_hour_blocking_")) {
    // Видаляємо стан адміна і повертаємо його до головного меню
    delete userStates[userId];
    const userFound = require("../../data/data").findUser(userId); // Повторний findUser для збереження
    if (userFound) {
      userFound.state = null;
      require("../../data/data").saveUser(userFound);
    }

    try {
      await ctx.editMessageReplyMarkup({}); // Прибираємо інлайн-кнопки
      await ctx.reply(
        getTranslation("choose_action", lang), // Використаємо choose_action або інше відповідне
        require("../keyboard/adminMenu").getAdminMenuKeyboard(lang) // Повертаємо головне адмін-меню
      );
    } catch (error) {
      console.error("Error finishing hour blocking:", error);
      await ctx.reply(getTranslation("error_try_again", lang));
    }
    return;
  }

  // Обробка кнопки "Назад до календаря"
  if (callbackData.startsWith("admin_back_to_calendar_from_hours_")) {
    const now = new Date();
    // Повертаємося до стану вибору дати для блокування годин
    userStates[userId] = {
      state: "admin_waiting_for_date_for_time_block", // Встановлюємо правильний стан
      lang: lang,
    };
    // Також оновлюємо user в data.js, щоб стан зберігався
    const userFound = require("../../data/data").findUser(userId);
    if (userFound) {
      userFound.state = "admin_waiting_for_date_for_time_block";
      require("../../data/data").saveUser(userFound);
    }

    try {
      await ctx.editMessageReplyMarkup(
        // Редагуємо повідомлення з клавіатурою
        require("../../keyboard/calendar").getCalendarInlineKeyboard(
          now.getFullYear(),
          now.getMonth(),
          lang,
          true // true для адмін-режиму
        ).reply_markup
      );
      await ctx.editMessageText(
        getTranslation("admin_choose_date_for_hours_block", lang)
      ); // Змінюємо текст
    } catch (error) {
      console.error("Error going back to admin calendar from hours:", error);
      await ctx.reply(
        // Надсилаємо нове повідомлення, якщо редагування не вдалося
        getTranslation("admin_choose_date_for_hours_block", lang),
        require("../../keyboard/calendar").getCalendarInlineKeyboard(
          now.getFullYear(),
          now.getMonth(),
          lang,
          true
        )
      );
    }
    return;
  }

  // Обробка ігнорованих слотів
  if (
    callbackData === "ignore_slot_booked" ||
    callbackData === "ignore_past_slot"
  ) {
    await ctx.answerCbQuery(getTranslation("slot_not_available", lang), {
      show_alert: true,
    });
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  getAdminTimeSlotsKeyboard,
  handleAdminTimeSlotCallback,
};
