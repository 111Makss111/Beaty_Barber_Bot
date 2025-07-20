const {
  findUser,
  saveUser,
  getSchedule,
  setSchedule, // ВИПРАВЛЕНО: Змінено updateSchedule на setSchedule
} = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu");
const { userStates } = require("./userPhone");

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const axios = require("axios");

const showCancelBookingMenu = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);

  if (!user) {
    await ctx.reply(getTranslation("error_try_again", "ua"));
    return;
  }

  const lang = user.lang;
  const schedule = getSchedule();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const userBookings = [];

  for (const dateString in schedule) {
    const bookingDate = new Date(dateString);
    if (bookingDate < today) {
      continue;
    }

    const daySchedule = schedule[dateString];
    for (const time in daySchedule) {
      const booking = daySchedule[time];
      if (booking.userId === userId && booking.status === "booked") {
        if (bookingDate.toDateString() === today.toDateString()) {
          const [hours, minutes] = time.split(":").map(Number);
          const bookingDateTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes
          );
          if (bookingDateTime <= now) {
            continue;
          }
        }
        userBookings.push({
          date: dateString,
          time: time,
          service: booking.service,
        });
      }
    }
  }

  if (userBookings.length === 0) {
    await ctx.reply(
      getTranslation("no_upcoming_bookings", lang),
      getClientMainMenuKeyboard(lang)
    );
    delete userStates[userId];
    user.state = null;
    saveUser(user);
    return;
  }

  userStates[userId] = {
    state: "waiting_for_booking_to_cancel",
    lang: lang,
    bookings: userBookings,
  };
  saveUser(user);

  const inlineKeyboard = userBookings.map((booking, index) => {
    const serviceName = getTranslation(booking.service, lang);
    return [
      {
        text: getTranslation("booking_display_format", lang, {
          date: booking.date,
          time: booking.time,
          service: serviceName,
        }),
        callback_data: `cancel_select_${index}`,
      },
    ];
  });

  inlineKeyboard.push([
    {
      text: getTranslation("button_back_to_main_menu", lang),
      callback_data: "back_to_main_menu_from_cancel",
    },
  ]);

  await ctx.reply(getTranslation("choose_booking_to_cancel", lang), {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
};

const handleCancelBookingCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = findUser(userId);
  let currentState = userStates[userId];

  await ctx.answerCbQuery();

  if (
    !user ||
    !currentState ||
    ![
      "waiting_for_booking_to_cancel",
      "waiting_for_cancel_confirmation",
    ].includes(currentState.state)
  ) {
    await ctx.reply(getTranslation("error_try_again", user ? user.lang : "ua"));
    return;
  }

  const lang = user.lang;

  if (callbackData === "back_to_main_menu_from_cancel") {
    delete userStates[userId];
    user.state = null;
    saveUser(user);
    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {}
    await ctx.reply(
      getTranslation("choose_action", lang),
      getClientMainMenuKeyboard(lang)
    );
    return;
  }

  if (
    callbackData.startsWith("cancel_select_") &&
    currentState.state === "waiting_for_booking_to_cancel"
  ) {
    const index = parseInt(callbackData.split("_")[2]);
    const selectedBooking = currentState.bookings[index];

    if (!selectedBooking) {
      await ctx.reply(
        getTranslation("booking_not_found", lang),
        getClientMainMenuKeyboard(lang)
      );
      delete userStates[userId];
      user.state = null;
      saveUser(user);
      return;
    }

    currentState.selected_booking_to_cancel = selectedBooking;
    currentState.state = "waiting_for_cancel_confirmation";
    saveUser(user);

    const serviceName = getTranslation(selectedBooking.service, lang);

    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {}

    await ctx.reply(
      getTranslation("cancel_confirmation", lang, {
        service: serviceName,
        date: selectedBooking.date,
        time: selectedBooking.time,
      }),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: getTranslation("button_yes_cancel", lang),
                callback_data: "confirm_cancel_booking",
              },
              {
                text: getTranslation("button_no_keep", lang),
                callback_data: "abort_cancel_booking",
              },
            ],
            [
              {
                text: getTranslation("button_back_to_cancel_menu", lang),
                callback_data: "back_to_cancel_list",
              },
            ],
          ],
        },
      }
    );
    return;
  }

  if (
    callbackData === "back_to_cancel_list" &&
    currentState.state === "waiting_for_cancel_confirmation"
  ) {
    currentState.state = "waiting_for_booking_to_cancel";
    delete currentState.selected_booking_to_cancel;
    saveUser(user);

    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {}

    await showCancelBookingMenu(ctx);
    return;
  }

  if (currentState.state === "waiting_for_cancel_confirmation") {
    const bookingToCancel = currentState.selected_booking_to_cancel;

    if (!bookingToCancel) {
      await ctx.reply(
        getTranslation("booking_not_found", lang),
        getClientMainMenuKeyboard(lang)
      );
      delete userStates[userId];
      user.state = null;
      saveUser(user);
      return;
    }

    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {}

    if (callbackData === "confirm_cancel_booking") {
      const schedule = getSchedule();
      if (
        schedule[bookingToCancel.date] &&
        schedule[bookingToCancel.date][bookingToCancel.time]
      ) {
        schedule[bookingToCancel.date][bookingToCancel.time].status =
          "cancelled";
        setSchedule(schedule); // ВИПРАВЛЕНО: Використовуємо setSchedule

        await ctx.reply(
          getTranslation("booking_successfully_cancelled", lang),
          getClientMainMenuKeyboard(lang)
        );

        const adminIds = process.env.ADMIN_IDS
          ? process.env.ADMIN_IDS.split(",").map((id) =>
              parseInt(id.trim(), 10)
            )
          : [];
        if (adminIds.length > 0) {
          const serviceDisplayName = getTranslation(
            bookingToCancel.service,
            lang
          );
          const notificationText = getTranslation(
            "admin_booking_cancelled_notification",
            lang,
            {
              user_name: `${user.first_name || ""} ${
                user.last_name || ""
              }`.trim(),
              user_id: userId,
              service: serviceDisplayName,
              date: bookingToCancel.date,
              time: bookingToCancel.time,
            }
          );

          for (const adminId of adminIds) {
            try {
              const photos = await bot.telegram.getUserProfilePhotos(userId);
              if (photos.total_count > 0 && photos.photos[0].length > 0) {
                const fileId =
                  photos.photos[0][photos.photos[0].length - 1].file_id;
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
                `Помилка відправки сповіщення/фото адміну ${adminId} про скасування для користувача ${userId}:`,
                error
              );
              try {
                await bot.telegram.sendMessage(adminId, notificationText, {
                  parse_mode: "Markdown",
                });
              } catch (e) {
                console.error(
                  `Повторна помилка відправки текстового сповіщення адміну ${adminId} про скасування:`,
                  e
                );
              }
            }
          }
        }
      } else {
        await ctx.reply(
          getTranslation("booking_not_found", lang),
          getClientMainMenuKeyboard(lang)
        );
      }
    } else if (callbackData === "abort_cancel_booking") {
      await ctx.reply(
        getTranslation("choose_action", lang),
        getClientMainMenuKeyboard(lang)
      );
    }

    delete userStates[userId];
    user.state = null;
    saveUser(user);
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  showCancelBookingMenu,
  handleCancelBookingCallback,
};
