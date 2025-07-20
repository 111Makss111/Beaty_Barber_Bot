// handlers/clientProfileHandler.js

const { Markup } = require("telegraf");
const { findUser, getSchedule } = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu");

const showClientProfile = async (ctx) => {
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

  let profileText = `${getTranslation(
    "profile_client_header",
    lang
  )}\n${getTranslation("profile_booking_separator", lang)}\n`;

  profileText += `${getTranslation("profile_your_info", lang, {
    first_name: user.first_name || ctx.from.first_name || "",
    last_name: user.last_name || ctx.from.last_name || "",
  })}\n`;

  // ВИПРАВЛЕНО: Змінено user.phone_number на user.phone
  if (user.phone) {
    profileText += `${getTranslation("profile_phone", lang, {
      phone: user.phone,
    })}\n`;
  } else {
    profileText += `${getTranslation("profile_no_phone_provided", lang)}\n`;
  }

  profileText += `${getTranslation("profile_booking_separator", lang)}\n`;

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

  if (userBookings.length > 0) {
    profileText += `\n${getTranslation("profile_your_bookings", lang)}\n`;
    userBookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    for (const booking of userBookings) {
      const serviceName = getTranslation(booking.service, lang);
      profileText += `${getTranslation("profile_booking_separator", lang)}\n`;
      profileText += `${getTranslation("profile_service", lang, {
        service: serviceName,
      })}\n`;
      profileText += `${getTranslation("profile_date", lang, {
        date: booking.date,
      })}\n`;
      profileText += `${getTranslation("profile_time", lang, {
        time: booking.time,
      })}\n`;
    }
    profileText += `${getTranslation("profile_booking_separator", lang)}\n`;
  } else {
    profileText += `${getTranslation("profile_no_bookings", lang)}\n`;
    profileText += `${getTranslation("profile_booking_separator", lang)}\n`;
  }

  await ctx.reply(profileText, {
    parse_mode: "Markdown",
    reply_markup: Markup.inlineKeyboard([
      [
        Markup.button.callback(
          getTranslation("button_back_to_main_menu", lang),
          "back_to_main_menu_from_profile"
        ),
      ],
    ]).reply_markup,
  });
};

const handleProfileCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = findUser(userId);

  await ctx.answerCbQuery();

  if (!user) {
    await ctx.reply(getTranslation("error_try_again", "ua"));
    return;
  }

  const lang = user.lang;

  if (callbackData === "back_to_main_menu_from_profile") {
    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {
      // Ігноруємо помилки, якщо повідомлення вже було відредаговано або не існує
    }
    await ctx.reply(
      getTranslation("choose_action", lang),
      getClientMainMenuKeyboard(lang)
    );
  }
};

module.exports = {
  showClientProfile,
  handleProfileCallback,
};
