// admin/handlers/adminViewRecordsHandler.js

const { Markup } = require("telegraf");
const { getSchedule, findUser } = require("../../data/data"); // Переконайся, що findUser також доступний
const { getTranslation } = require("../../data/translations");
const { getAdminMenuKeyboard } = require("../keyboard/adminMenu");

const viewAllRecords = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);

  if (!user || !user.is_admin) {
    await ctx.reply(getTranslation("access_denied", "ua"));
    return;
  }

  const lang = user.lang;
  const schedule = getSchedule();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let recordsText = `${getTranslation(
    "admin_all_records_header",
    lang
  )}\n${getTranslation("profile_booking_separator", lang)}\n`;

  const activeBookings = [];

  for (const dateString in schedule) {
    const bookingDate = new Date(dateString);
    if (bookingDate < today) {
      continue; // Пропускаємо минулі дні
    }

    const daySchedule = schedule[dateString];
    for (const time in daySchedule) {
      const booking = daySchedule[time];
      if (booking.status === "booked") {
        // Перевіряємо, чи запис не є минулим на сьогоднішній день
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
            continue; // Пропускаємо минулі години на сьогоднішній день
          }
        }

        const client = findUser(booking.userId);
        activeBookings.push({
          date: dateString,
          time: time,
          service: booking.service,
          clientName: client
            ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
            : "Невідомий клієнт",
          clientPhone: client
            ? client.phone_number || "Не надано"
            : "Невідомий",
        });
      }
    }
  }

  if (activeBookings.length > 0) {
    activeBookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

    for (const booking of activeBookings) {
      const serviceName = getTranslation(booking.service, lang);
      recordsText += `${getTranslation("profile_booking_separator", lang)}\n`;
      recordsText += `${getTranslation("admin_record_client_name", lang, {
        client_name: booking.clientName,
      })}\n`;
      recordsText += `${getTranslation("admin_record_client_phone", lang, {
        client_phone: booking.clientPhone,
      })}\n`;
      recordsText += `${getTranslation("profile_service", lang, {
        service: serviceName,
      })}\n`;
      recordsText += `${getTranslation("profile_date", lang, {
        date: booking.date,
      })}\n`;
      recordsText += `${getTranslation("profile_time", lang, {
        time: booking.time,
      })}\n`;
    }
    recordsText += `${getTranslation("profile_booking_separator", lang)}\n`;
  } else {
    recordsText += `${getTranslation("admin_no_active_records", lang)}\n`;
    recordsText += `${getTranslation("profile_booking_separator", lang)}\n`;
  }

  await ctx.reply(recordsText, {
    parse_mode: "Markdown",
    reply_markup: Markup.inlineKeyboard([
      [
        Markup.button.callback(
          getTranslation("button_back_to_admin_menu", lang),
          "back_to_admin_menu_from_records"
        ),
      ],
    ]).reply_markup,
  });
};

const handleAdminRecordsCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = findUser(userId);

  await ctx.answerCbQuery();

  if (!user || !user.is_admin) {
    await ctx.reply(getTranslation("access_denied", "ua"));
    return;
  }

  const lang = user.lang;

  if (callbackData === "back_to_admin_menu_from_records") {
    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {
      // Ігноруємо помилки, якщо повідомлення вже було відредаговано або не існує
    }
    await ctx.reply(
      getTranslation("admin_welcome", lang),
      getAdminMenuKeyboard(lang)
    );
  }
};

module.exports = {
  viewAllRecords,
  handleAdminRecordsCallback,
};
