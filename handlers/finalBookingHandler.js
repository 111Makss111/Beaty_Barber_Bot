const {
  findUser,
  saveUser,
  getSchedule,
  updateSchedule,
} = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu");

const { userStates } = require("./userPhone");

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN); // Ініціалізуємо бот для надсилання повідомлень
const axios = require("axios"); // Імпорт axios

/**
 * Обробляє callback-запити для підтвердження або скасування запису.
 * @param {Object} ctx - Об'єкт контексту Telegraf (містить callbackQuery).
 */
const handleFinalBookingCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = findUser(userId);
  let currentState = userStates[userId];

  await ctx.answerCbQuery();

  if (
    !user ||
    !currentState ||
    currentState.state !== "waiting_for_confirmation"
  ) {
    await ctx.reply(getTranslation("error_try_again", user ? user.lang : "ua"));
    return;
  }

  const lang = user.lang;

  const serviceKey = user.current_service;
  const selectedDateString = user.current_date;
  const selectedTime = user.current_time;

  // Видаляємо попереднє повідомлення з кнопками підтвердження/скасування
  try {
    await ctx.editMessageReplyMarkup({});
  } catch (error) {
    // Пропускаємо помилку, якщо повідомлення вже змінено або видалено
  }

  if (callbackData === "confirm_booking") {
    const schedule = getSchedule();

    const daySchedule = schedule[selectedDateString] || {};
    if (
      daySchedule[selectedTime] &&
      (daySchedule[selectedTime].status === "booked" ||
        daySchedule[selectedTime].status === "blocked_admin")
    ) {
      // Виправлено: Використовуємо переклад для повідомлення про недоступність слоту
      await ctx.reply(
        getTranslation("slot_taken_while_confirming", lang), // Виправлено: використання перекладу
        getClientMainMenuKeyboard(lang)
      );
      delete user.current_service;
      delete user.current_date;
      delete user.current_time;
      delete userStates[userId];
      user.state = null;
      saveUser(user);
      return;
    }

    if (!schedule[selectedDateString]) {
      schedule[selectedDateString] = {};
    }
    schedule[selectedDateString][selectedTime] = {
      status: "booked",
      userId: userId,
      service: serviceKey, // Зберігаємо serviceKey, а не перекладене ім'я
      userName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      userPhone: user.phone || "Не вказано",
    };
    updateSchedule(schedule);

    delete user.current_service;
    delete user.current_date;
    delete user.current_time;
    delete userStates[userId];
    user.state = null;
    saveUser(user);

    await ctx.reply(
      getTranslation("booking_confirmed", lang),
      getClientMainMenuKeyboard(lang)
    );

    // --- ЛОГІКА НАДСИЛАННЯ ФОТО ТА СПОВІЩЕННЯ АДМІНУ ---
    const adminIds = process.env.ADMIN_IDS
      ? process.env.ADMIN_IDS.split(",").map((id) => parseInt(id.trim(), 10))
      : [];
    if (adminIds.length > 0) {
      const serviceDisplayName = getTranslation(serviceKey, lang); // Отримуємо перекладену назву для сповіщення
      const notificationText = getTranslation(
        "admin_new_booking_notification",
        lang,
        {
          user_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          user_id: userId,
          user_phone: user.phone || "Не вказано",
          service: serviceDisplayName,
          date: selectedDateString,
          time: selectedTime,
        }
      );

      for (const adminId of adminIds) {
        try {
          const photos = await bot.telegram.getUserProfilePhotos(userId);
          if (photos.total_count > 0 && photos.photos[0].length > 0) {
            const fileId =
              photos.photos[(0)[photos.photos[0].length - 1]].file_id; // Виправлена помилка в індексації масиву
            const fileLink = await bot.telegram.getFileLink(fileId);

            await bot.telegram.sendPhoto(
              adminId,
              { url: fileLink.href },
              { caption: notificationText, parse_mode: "Markdown" }
            );
          } else {
            await bot.telegram.sendMessage(adminId, notificationText, {
              parse_mode: "Markdown",
            });
          }
        } catch (error) {
          console.error(
            `Помилка відправки сповіщення/фото адміну ${adminId} для користувача ${userId}:`,
            error
          );
          try {
            await bot.telegram.sendMessage(adminId, notificationText, {
              parse_mode: "Markdown",
            });
          } catch (e) {
            console.error(
              `Повторна помилка відправки текстового сповіщення адміну ${adminId}:`,
              e
            );
          }
        }
      }
    }
    // --- КІНЕЦЬ ЛОГІКИ НАДСИЛАННЯ ФОТО ТА СПОВІЩЕННЯ АДМІНУ ---
  } else if (callbackData === "cancel_booking") {
    delete user.current_service;
    delete user.current_date;
    delete user.current_time;
    delete userStates[userId];
    user.state = null;
    saveUser(user);

    // Виправлено: Використовуємо booking_cancelled_by_user
    await ctx.reply(
      getTranslation("booking_cancelled_by_user", lang), // Виправлено: використання перекладу
      getClientMainMenuKeyboard(lang)
    );
  }
};

module.exports = {
  handleFinalBookingCallback,
};
