// admin/handlers/adminViewRecordsHandler.js

const { Markup } = require("telegraf");
const { getSchedule, findUser } = require("../../data/data");
const { getTranslation } = require("../../data/translations");
const { getAdminMenuKeyboard } = require("../keyboard/adminMenu");

/**
 * Показує адміну меню для вибору періоду перегляду записів.
 * @param {Object} ctx - Об'єкт контексту Telegraf.
 */
const showRecordsPeriodSelection = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);

  if (!user || !user.is_admin) {
    await ctx.reply(getTranslation("access_denied", "ua"));
    return;
  }

  const lang = user.lang;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        getTranslation("records_today", lang),
        "admin_records_period_today"
      ),
      Markup.button.callback(
        getTranslation("records_tomorrow", lang),
        "admin_records_period_tomorrow"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation("records_week", lang),
        "admin_records_period_week"
      ),
      Markup.button.callback(
        getTranslation("records_month", lang),
        "admin_records_period_month"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation("records_all_time", lang),
        "admin_records_period_all"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation("button_back_to_admin_menu", lang),
        "back_to_admin_menu_from_records_selection"
      ),
    ],
  ]);

  await ctx.reply(
    getTranslation("admin_select_records_period", lang),
    keyboard
  );
};

/**
 * Відображає всі записи для адміна, відфільтровані за вибраним періодом.
 * @param {Object} ctx - Об'єкт контексту Telegraf.
 * @param {string} period - Період фільтрації ('today', 'tomorrow', 'week', 'month', 'all').
 */
const viewFilteredRecords = async (ctx, period) => {
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
  )}\n${getTranslation("profile_booking_separator", lang)}\n\n`;

  const activeBookings = [];

  // Визначення кінцевої дати для фільтрації
  let endDate = new Date(now);
  if (period === "today") {
    endDate.setHours(23, 59, 59, 999);
  } else if (period === "tomorrow") {
    endDate.setDate(now.getDate() + 1);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === "week") {
    endDate.setDate(now.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === "month") {
    endDate.setMonth(now.getMonth() + 1);
    endDate.setHours(23, 59, 59, 999);
  }
  // Для 'all' endDate не обмежується

  for (const dateString in schedule) {
    const bookingDate = new Date(dateString);
    bookingDate.setHours(0, 0, 0, 0); // Обнуляємо час для порівняння лише дат

    // Фільтрація за періодом
    if (period !== "all" && bookingDate > endDate) {
      continue;
    }

    // Пропускаємо минулі дні (для всіх періодів, крім 'all' для історії)
    // У цьому випадку ми завжди хочемо бачити лише майбутні/поточні записи, тому ця перевірка залишається
    if (bookingDate < today) {
      continue;
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
          clientPhone: client ? client.phone || "Не надано" : "Невідомий",
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

    let currentDate = "";
    for (const booking of activeBookings) {
      if (booking.date !== currentDate) {
        recordsText += `*📅 ${getTranslation("admin_records_date", lang, {
          date: booking.date,
        })}*\n`;
        recordsText += `${getTranslation("profile_booking_separator", lang)}\n`;
        currentDate = booking.date;
      }

      const serviceName = getTranslation(booking.service, lang);
      recordsText += `*⏰ ${booking.time}* - *${serviceName}*\n`;
      recordsText += `  ${getTranslation("admin_record_client_name", lang, {
        client_name: booking.clientName,
      })}\n`;
      recordsText += `  ${getTranslation("admin_record_client_phone", lang, {
        client_phone: booking.clientPhone,
      })}\n\n`;
    }
    recordsText += `${getTranslation("profile_booking_separator", lang)}\n`;
  } else {
    recordsText += `${getTranslation("admin_no_active_records", lang)}\n`;
    recordsText += `${getTranslation("profile_booking_separator", lang)}\n`;
  }

  // Оновлюємо клавіатуру, щоб адмін міг повернутися до вибору періоду або головного меню
  await ctx.reply(recordsText, {
    parse_mode: "Markdown",
    reply_markup: Markup.inlineKeyboard([
      [
        Markup.button.callback(
          getTranslation("button_back_to_records_selection", lang),
          "admin_back_to_records_selection"
        ),
      ],
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

  if (callbackData.startsWith("admin_records_period_")) {
    const period = callbackData.split("_")[3]; // Отримуємо 'today', 'tomorrow' тощо
    await ctx.editMessageReplyMarkup({}); // Прибираємо кнопки вибору періоду
    await viewFilteredRecords(ctx, period); // Викликаємо функцію з потрібним періодом
  } else if (callbackData === "admin_back_to_records_selection") {
    try {
      await ctx.editMessageReplyMarkup({}); // Прибираємо поточні кнопки
    } catch (error) {
      /* ignore */
    }
    await showRecordsPeriodSelection(ctx); // Повертаємося до меню вибору періоду
  } else if (
    callbackData === "back_to_admin_menu_from_records" ||
    callbackData === "back_to_admin_menu_from_records_selection"
  ) {
    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {
      // Ігноруємо помилки
    }
    await ctx.reply(
      getTranslation("admin_welcome", lang),
      getAdminMenuKeyboard(lang)
    );
  }
};

module.exports = {
  showRecordsPeriodSelection, // Експортуємо нову функцію
  handleAdminRecordsCallback,
};
