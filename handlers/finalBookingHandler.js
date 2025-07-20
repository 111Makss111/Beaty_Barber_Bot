// handlers/finalBookingHandler.js

const { Markup } = require("telegraf");
const {
  findUser,
  saveUser,
  getSchedule,
  setSchedule, // ВИПРАВЛЕНО: Змінено updateSchedule на setSchedule
} = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu");

const { userStates } = require("./userPhone");

const axios = require("axios"); // Залишаю, якщо потрібен для інших цілей

/**
 * Обробляє callback-запити для підтвердження або скасування запису.
 * @param {Object} ctx - Об'єкт контексту Telegraf (містить callbackQuery).
 * @param {Object} botInstance - Екземпляр бота Telegraf для надсилання повідомлень.
 */
const handleFinalBookingCallback = async (ctx, botInstance) => {
  // ДОДАНО botInstance як аргумент
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
    await ctx.reply(
      getTranslation("error_try_again", user ? user.lang : "ua"),
      getClientMainMenuKeyboard(user ? user.lang : "ua")
    );
    delete userStates[userId]; // Очищаємо стан, якщо сесія недійсна
    if (user) {
      // Додаткова перевірка, щоб user існував
      user.state = null; // Очищаємо user.state
      saveUser(user);
    }
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
    console.warn("Не вдалося видалити розмітку повідомлення:", error.message);
  }

  if (callbackData === "confirm_booking") {
    const schedule = getSchedule();

    const daySchedule = schedule[selectedDateString] || {};
    // Перевірка, чи слот вже зайнятий
    if (
      daySchedule[selectedTime] &&
      (daySchedule[selectedTime].status === "booked" ||
        daySchedule[selectedTime].status === "blocked_admin")
    ) {
      await ctx.reply(
        getTranslation("slot_taken_while_confirming", lang),
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
      service: serviceKey,
      userName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      userPhone: user.phone || "Не вказано",
    };
    setSchedule(schedule); // ВИПРАВЛЕНО: Використовуємо setSchedule
    saveUser(user);

    await ctx.reply(
      getTranslation("booking_confirmed", lang, {
        service: getTranslation(serviceKey, lang), // Перекладаємо сервіс для відображення користувачеві
        date: selectedDateString,
        time: selectedTime,
      }),
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
        lang, // Використовуємо мову користувача для сповіщення адміну
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
          if (!botInstance || !botInstance.telegram) {
            // ДОДАНО: Перевірка на існування botInstance та telegram
            console.error(
              "Bot instance is not provided or invalid for sending admin notification."
            );
            continue; // Пропускаємо відправку, якщо botInstance недійсний
          }
          const photos = await botInstance.telegram.getUserProfilePhotos(
            userId
          ); // ВИПРАВЛЕНО: Використовуємо botInstance
          if (photos.total_count > 0 && photos.photos[0].length > 0) {
            const fileId =
              photos.photos[0][photos.photos[0].length - 1].file_id; // ВИПРАВЛЕНО: Правильна індексація
            const fileLink = await botInstance.telegram.getFileLink(fileId); // ВИПРАВЛЕНО: Використовуємо botInstance

            await botInstance.telegram.sendPhoto(
              // ВИПРАВЛЕНО: Використовуємо botInstance
              adminId,
              { url: fileLink.href },
              { caption: notificationText, parse_mode: "Markdown" }
            );
          } else {
            await botInstance.telegram.sendMessage(adminId, notificationText, {
              // ВИПРАВЛЕНО: Використовуємо botInstance
              parse_mode: "Markdown",
            });
          }
        } catch (error) {
          console.error(
            `Помилка відправки сповіщення/фото адміну ${adminId} для користувача ${userId}:`,
            error
          );
          try {
            if (botInstance && botInstance.telegram) {
              // ДОДАНО: Перевірка перед повторною спробою
              await botInstance.telegram.sendMessage(
                adminId,
                notificationText,
                {
                  // ВИПРАВЛЕНО: Використовуємо botInstance
                  parse_mode: "Markdown",
                }
              );
            } else {
              console.error(
                "Bot instance is not valid for retry sending text notification."
              );
            }
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

    await ctx.reply(
      getTranslation("booking_cancelled_by_user", lang),
      getClientMainMenuKeyboard(lang)
    );
  }
};

module.exports = {
  handleFinalBookingCallback,
};
