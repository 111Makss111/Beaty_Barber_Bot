// admin/handlers/adminHandler.js

const { Markup } = require("telegraf");
const { getTranslation } = require("../../data/translations");
const {
  findUser,
  saveUser,
  getSchedule,
  setSchedule, // ВИПРАВЛЕНО: Змінено updateSchedule на setSchedule
} = require("../../data/data");
const { userStates } = require("../../handlers/userPhone");
const { getCalendarInlineKeyboard } = require("../../keyboard/calendar");
const {
  getAdminTimeSlotsKeyboard,
  handleAdminTimeSlotCallback,
} = require("./adminTimeSlotHandler"); // Імпортуємо новий обробник годин

/**
 * Генерує всі можливі часові слоти для одного дня (з 9:00 до 18:00 з інтервалом 30 хв).
 * Ця функція дублюється для забезпечення незалежності, але краще винести її в утиліти, якщо вона потрібна в кількох місцях.
 * @returns {string[]} Масив часових слотів у форматі "HH:MM".
 */
const generateAllTimeSlots = () => {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) continue;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
};

/**
 * Обробляє вибір опції з головного адмін-меню.
 * @param {Object} ctx - Об'єкт контексту Telegraf.
 */
const handleAdminMenuChoice = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const lang = user ? user.lang : "ua";
  const text = ctx.message.text;

  if (!user || !user.is_admin) {
    await ctx.reply(getTranslation("access_denied", lang));
    return;
  }

  if (text === getTranslation("admin_menu_block_date", lang)) {
    const now = new Date();
    userStates[userId] = {
      state: "admin_waiting_for_date_to_block",
      lang: lang,
    };
    saveUser(user);
    await ctx.reply(
      getTranslation("admin_choose_date_to_block", lang),
      getCalendarInlineKeyboard(now.getFullYear(), now.getMonth(), lang, true)
    );
    return;
  }

  // НОВА ЛОГІКА: ОБРОБКА ВИБОРУ "ЗАБЛОКУВАТИ ГОДИНИ"
  if (text === getTranslation("admin_menu_block_hours", lang)) {
    const now = new Date();
    userStates[userId] = {
      state: "admin_waiting_for_date_for_time_block",
      lang: lang,
    }; // Новий стан
    saveUser(user);
    await ctx.reply(
      getTranslation("admin_choose_date_for_hours_block", lang), // Новий переклад
      getCalendarInlineKeyboard(now.getFullYear(), now.getMonth(), lang, true) // Використовуємо той самий адмін-календар
    );
    return;
  }

  // Тут можуть бути інші адмін-дії
  if (text === getTranslation("admin_menu_view_records", lang)) {
    await ctx.reply(getTranslation("admin_not_implemented", lang));
    return;
  }
  if (text === getTranslation("admin_menu_add_portfolio", lang)) {
    await ctx.reply(getTranslation("admin_not_implemented", lang));
    return;
  }
  if (text === getTranslation("admin_menu_block_client", lang)) {
    await ctx.reply(getTranslation("admin_not_implemented", lang));
    return;
  }

  await ctx.reply(getTranslation("error_unknown_command", lang));
};

/**
 * Обробляє callback-запити від адмін-календаря.
 * @param {Object} ctx - Об'єкт контексту Telegraf.
 */
const handleAdminCalendarCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = findUser(userId);
  let currentState = userStates[userId];

  await ctx.answerCbQuery();

  if (
    !user ||
    !user.is_admin ||
    !currentState ||
    (!currentState.state.startsWith("admin_waiting_for_date_") && // Дозволяємо лише стани, що починаються з admin_waiting_for_date_
      !callbackData.startsWith("cal_admin_") && // Дозволяємо навігацію без конкретного стану
      !callbackData.startsWith("admin_date_")) // Дозволяємо вибір дати, навіть якщо стан неточний
  ) {
    await ctx.reply(getTranslation("access_denied", user ? user.lang : "ua"));
    return;
  }

  const lang = user.lang;

  // Обробка навігації календарем для адміна (незалежно від стану)
  if (
    callbackData.startsWith("cal_admin_prev_") ||
    callbackData.startsWith("cal_admin_next_")
  ) {
    const parts = callbackData.split("_");
    const action = parts[2];
    let year = parseInt(parts[3], 10);
    let month = parseInt(parts[4], 10);

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
      // Перевіряємо, в якому режимі ми були, щоб повернути правильний календар
      const isAdminModeForCalendar =
        currentState &&
        (currentState.state === "admin_waiting_for_date_to_block" ||
          currentState.state === "admin_waiting_for_date_for_time_block");
      await ctx.editMessageReplyMarkup(
        getCalendarInlineKeyboard(year, month, lang, isAdminModeForCalendar)
          .reply_markup
      );
    } catch (error) {
      console.error("Error editing admin calendar (navigation):", error);
      await ctx.reply(getTranslation("error_try_again", lang));
    }
    return;
  }

  // Обробка вибору дати
  if (callbackData.startsWith("admin_date_")) {
    const selectedDateString = callbackData.split("_")[2];
    const selectedDate = new Date(selectedDateString);

    if (currentState.state === "admin_waiting_for_date_to_block") {
      // Логіка блокування/розблокування ЦІЛОЇ ДАТИ
      const schedule = getSchedule();
      let daySchedule = schedule[selectedDateString] || {};
      const allPossibleSlots = generateAllTimeSlots();

      let isFullDayBlocked = true;
      if (allPossibleSlots.length > 0) {
        for (const slot of allPossibleSlots) {
          const slotInfo = daySchedule[slot];
          if (!slotInfo || slotInfo.status !== "blocked_admin") {
            isFullDayBlocked = false;
            break;
          }
        }
      } else {
        isFullDayBlocked = false;
      }

      if (isFullDayBlocked && allPossibleSlots.length > 0) {
        allPossibleSlots.forEach((slot) => {
          if (
            daySchedule[slot] &&
            daySchedule[slot].status === "blocked_admin"
          ) {
            delete daySchedule[slot];
          }
        });
        schedule[selectedDateString] = daySchedule;
        setSchedule(schedule); // ВИПРАВЛЕНО: Використовуємо setSchedule
        await ctx.reply(
          getTranslation("admin_date_unblocked", lang, {
            date: selectedDateString,
          })
        );
      } else {
        allPossibleSlots.forEach((slot) => {
          daySchedule[slot] = {
            status: "blocked_admin",
            timestamp: new Date().toISOString(),
            blockedBy: userId,
          };
        });
        schedule[selectedDateString] = daySchedule;
        setSchedule(schedule); // ВИПРАВЛЕНО: Використовуємо setSchedule
        await ctx.reply(
          getTranslation("admin_date_blocked", lang, {
            date: selectedDateString,
          })
        );
      }

      try {
        await ctx.editMessageReplyMarkup(
          getCalendarInlineKeyboard(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            lang,
            true
          ).reply_markup
        );
      } catch (error) {
        console.error(
          "Error updating admin calendar after block/unblock:",
          error
        );
        await ctx.reply(
          getTranslation("admin_choose_date_to_block", lang),
          getCalendarInlineKeyboard(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            lang,
            true
          )
        );
      }
      return;
    } else if (currentState.state === "admin_waiting_for_date_for_time_block") {
      // НОВА ЛОГІКА: ВИБІР ДАТИ ДЛЯ БЛОКУВАННЯ ГОДИН
      userStates[userId].state = "admin_waiting_for_hour_to_block"; // Змінюємо стан
      userStates[userId].current_admin_date = selectedDateString; // Зберігаємо обрану дату
      saveUser(user); // Зберігаємо оновлений стан

      // Надсилаємо інлайн-клавіатуру з годинами для цієї дати
      await ctx.reply(
        getTranslation("admin_block_hours_instructions", lang),
        getAdminTimeSlotsKeyboard(selectedDateString, lang) // Викликаємо новий обробник клавіатури
      );
      return;
    }
  }

  // Обробка повернення до головного адмін-меню
  if (callbackData === "back_to_admin_main_menu") {
    delete userStates[userId];
    if (user) {
      user.state = null;
      saveUser(user);
    }
    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {
      console.error("Error removing inline keyboard:", error);
    }
    await ctx.reply(
      getTranslation("choose_action", lang),
      Markup.keyboard([
        [getTranslation("admin_menu_view_records", lang)],
        [
          getTranslation("admin_menu_block_date", lang),
          getTranslation("admin_menu_block_hours", lang),
        ],
        [
          getTranslation("admin_menu_add_portfolio", lang),
          getTranslation("admin_menu_block_client", lang),
        ],
      ]).resize()
    );
    return;
  }

  // Обробка інших callback-ів в адмін-календарі, які ми не очікуємо або ігноруємо
  if (callbackData.startsWith("ignore")) {
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  handleAdminMenuChoice,
  handleAdminCalendarCallback,
  // Тепер handleAdminCalendarCallback більше не викликатиме adminTimeSlotHandler.
  // Він викликатиметься напряму з index.js
};
