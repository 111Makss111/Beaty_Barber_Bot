// handlers/viewRecordsAdmin.js
const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");
const { bookedAppointments } = require("./time"); // Імпортуємо масив записів з time.js
const { getAdminMenuKeyboard } = require("../keyboards"); // Потрібно для повернення в адмін-меню

const RECORDS_PER_PAGE = 5; // Кількість записів на одній сторінці

/**
 * Створює клавіатуру для вибору фільтрів записів.
 * @param {string} lang Мова.
 * @returns {object} InlineKeyboardMarkup.
 */
function getRecordsFilterKeyboard(lang) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        getTranslation(lang, "filter_today_btn"),
        "filter_records_today"
      ),
      Markup.button.callback(
        getTranslation(lang, "filter_tomorrow_btn"),
        "filter_records_tomorrow"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation(lang, "filter_this_week_btn"),
        "filter_records_this_week"
      ),
      Markup.button.callback(
        getTranslation(lang, "filter_this_month_btn"),
        "filter_records_this_month"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation(lang, "filter_all_records_btn"),
        "filter_records_all"
      ), // Кнопка для всіх майбутніх записів
    ],
    // Додамо кнопку "Вибрати дату" пізніше, після реалізації календарю для цього
    // [Markup.button.callback(getTranslation(lang, 'filter_specific_date_btn'), 'filter_records_specific_date')],
    [
      Markup.button.callback(
        getTranslation(lang, "back_to_admin_menu_btn"),
        "back_to_admin_menu_from_records"
      ),
    ],
  ]);
}

/**
 * Форматує один запис для виводу.
 * @param {object} appointment Об'єкт запису.
 * @param {string} lang Мова.
 * @returns {string} Відформатований рядок.
 */
function formatAppointmentForAdmin(appointment, lang) {
  const serviceName = getTranslation(
    lang,
    `${appointment.service}_service_btn`
  );
  const formattedDate = new Date(appointment.date).toLocaleDateString(
    lang === "ua" ? "uk-UA" : "pl-PL"
  );

  return (
    `${getTranslation(lang, "admin_delimiter")}\n` +
    `ID користувача: \`${appointment.userId}\`\n` + // ID користувача
    `${getTranslation(
      lang,
      "admin_client_name",
      appointment.name || "Не вказано"
    )}\n` +
    `${getTranslation(
      lang,
      "admin_client_phone",
      appointment.phone || "Не вказано"
    )}\n` +
    `${getTranslation(lang, "admin_service", serviceName)}\n` +
    `${getTranslation(lang, "admin_date", formattedDate)}\n` +
    `${getTranslation(lang, "admin_time", appointment.time)}`
  );
}

/**
 * Фільтрує та пагінує записи для відображення.
 * @param {Array} records Масив записів.
 * @param {string} filterType Тип фільтрації (e.g., 'today', 'tomorrow', 'this_week', 'this_month', 'all').
 * @param {string} lang Мова.
 * @returns {Array} Відфільтровані записи.
 */
function getFilteredAppointments(records, filterType, lang) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  // const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59); // Не використовується

  return records
    .filter((appointment) => {
      const appointmentDateTime = new Date(appointment.date);
      const [hours, minutes] = appointment.time.split(":").map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Перевіряємо, що запис ще не минув (навіть для "всіх" записів, ми хочемо тільки майбутні)
      if (appointmentDateTime.getTime() < now.getTime()) {
        return false;
      }

      switch (filterType) {
        case "today":
          return appointmentDateTime.toDateString() === today.toDateString();
        case "tomorrow":
          return appointmentDateTime.toDateString() === tomorrow.toDateString();
        case "this_week":
          // Перевіряємо, що це майбутній запис на цьому тижні (Пн-Нд)
          const startOfWeek = new Date(today);
          // Встановлюємо початок тижня на понеділок
          startOfWeek.setDate(
            today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
          );
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Кінець тижня (неділя)
          endOfWeek.setHours(23, 59, 59, 999);

          return (
            appointmentDateTime.getTime() >= now.getTime() &&
            appointmentDateTime.getTime() >= startOfWeek.getTime() &&
            appointmentDateTime.getTime() <= endOfWeek.getTime()
          );

        case "this_month":
          return (
            appointmentDateTime.getFullYear() === now.getFullYear() &&
            appointmentDateTime.getMonth() === now.getMonth() &&
            appointmentDateTime.getTime() >= now.getTime()
          ); // Тільки майбутні в цьому місяці
        case "all":
        default:
          return true; // Всі майбутні записи
      }
    })
    .sort((a, b) => {
      // Сортування за датою і часом
      const dateA = new Date(a.date);
      const [hA, mA] = a.time.split(":").map(Number);
      dateA.setHours(hA, mA, 0, 0);

      const dateB = new Date(b.date);
      const [hB, mB] = b.time.split(":").map(Number);
      dateB.setHours(hB, mB, 0, 0);

      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Надсилає адміністратору сторінку відфільтрованих записів.
 * @param {object} ctx Контекст Telegraf.
 * @param {Array} filteredRecords Відфільтровані записи.
 * @param {number} page Поточна сторінка.
 * @param {string} filterType Активний тип фільтрації.
 */
async function sendRecordsPage(ctx, filteredRecords, page, filterType) {
  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
  const startIndex = page * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const recordsOnPage = filteredRecords.slice(startIndex, endIndex);

  let messageText = getTranslation(ctx.session.lang, "records_list_header");
  if (recordsOnPage.length === 0) {
    messageText += `\n${getTranslation(ctx.session.lang, "no_records_found")}`;
  } else {
    recordsOnPage.forEach((record) => {
      messageText += `\n${formatAppointmentForAdmin(record, ctx.session.lang)}`;
    });
  }

  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push(
      Markup.button.callback(
        "⬅️",
        `records_prev_page_${filterType}_${page - 1}`
      )
    );
  }
  if (page < totalPages - 1) {
    navigationButtons.push(
      Markup.button.callback(
        "➡️",
        `records_next_page_${filterType}_${page + 1}`
      )
    );
  }

  const inlineKeyboard = Markup.inlineKeyboard([
    navigationButtons.length > 0 ? navigationButtons : [], // Додаємо кнопки навігації, якщо вони є
    [
      Markup.button.callback(
        getTranslation(ctx.session.lang, "back_to_records_filters_btn"),
        "back_to_records_filters"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation(ctx.session.lang, "back_to_admin_menu_btn"),
        "back_to_admin_menu_from_records"
      ),
    ],
  ]);

  // Використовуємо editMessageText, якщо це оновлення існуючого повідомлення (пагінація)
  // Якщо це перше відображення записів після вибору фільтра, то editMessageText теж підійде
  await ctx.editMessageText(messageText, inlineKeyboard);
}

function setupViewRecordsHandlers(bot, ADMIN_IDS) {
  // Обробник для входу в перегляд записів (з адмін-меню)
  bot.hears(async (text, ctx) => {
    const userId = ctx.from.id;
    const isAdmin = ADMIN_IDS.includes(userId);
    if (!isAdmin) return false; // Не обробляємо, якщо не адмін

    const viewAllRecordsBtnText = getTranslation(
      ctx.session.lang,
      "view_all_records_btn"
    );
    if (
      text === viewAllRecordsBtnText &&
      ctx.session.nextStep === "admin_menu"
    ) {
      console.log(`[Admin] User ${userId} selected 'View all records'.`);
      ctx.session.nextStep = "admin_view_records_filter_selection";
      // Видаляємо попереднє повідомлення з адмін-меню, щоб не було зайвих клавіатур
      await ctx.deleteMessage(ctx.message.message_id);
      await ctx.reply(
        // Використовуємо reply, щоб надіслати нове повідомлення з inline-клавіатурою
        getTranslation(ctx.session.lang, "select_records_filter"),
        getRecordsFilterKeyboard(ctx.session.lang)
      );
      return true; // Оброблено
    }
    return false; // Не оброблено, передати далі
  });

  // Обробка callback_query для фільтрації та пагінації
  bot.on("callback_query", async (ctx) => {
    const userId = ctx.from.id;
    const isAdmin = ADMIN_IDS.includes(userId);
    if (!isAdmin) return; // Не обробляємо, якщо не адмін

    const callbackData = ctx.callbackQuery.data;

    // Обробка вибору фільтра
    if (
      callbackData.startsWith("filter_records_") &&
      ctx.session.nextStep === "admin_view_records_filter_selection"
    ) {
      await ctx.answerCbQuery();
      const filterType = callbackData.replace("filter_records_", "");

      ctx.session.currentRecordsFilter = filterType;
      ctx.session.currentRecordsPage = 0; // Скидаємо на першу сторінку при зміні фільтра

      const filtered = getFilteredAppointments(
        bookedAppointments,
        filterType,
        ctx.session.lang
      );
      ctx.session.filteredAppointmentsCache = filtered; // Кешуємо відфільтровані записи

      ctx.session.nextStep = "admin_view_records_display"; // Переходимо в режим відображення записів
      await sendRecordsPage(
        ctx,
        filtered,
        ctx.session.currentRecordsPage,
        filterType
      );
      return;
    }

    // Обробка пагінації (переключення сторінок)
    if (
      (callbackData.startsWith("records_prev_page_") ||
        callbackData.startsWith("records_next_page_")) &&
      ctx.session.nextStep === "admin_view_records_display"
    ) {
      await ctx.answerCbQuery();

      const parts = callbackData.split("_");
      const newPage = parseInt(parts[parts.length - 1]);
      const filterType = parts[parts.length - 2]; // Отримуємо тип фільтрації з колбеку

      if (
        ctx.session.filteredAppointmentsCache &&
        ctx.session.currentRecordsFilter === filterType
      ) {
        ctx.session.currentRecordsPage = newPage;
        await sendRecordsPage(
          ctx,
          ctx.session.filteredAppointmentsCache,
          newPage,
          filterType
        );
      } else {
        // Якщо кеш з якихось причин зник, перефільтровуємо
        const filtered = getFilteredAppointments(
          bookedAppointments,
          filterType,
          ctx.session.lang
        );
        ctx.session.filteredAppointmentsCache = filtered;
        ctx.session.currentRecordsPage = newPage;
        await sendRecordsPage(ctx, filtered, newPage, filterType);
      }
      return;
    }

    // Обробка кнопки "Повернутись до фільтрів"
    if (
      callbackData === "back_to_records_filters" &&
      ctx.session.nextStep === "admin_view_records_display"
    ) {
      await ctx.answerCbQuery();
      ctx.session.nextStep = "admin_view_records_filter_selection";
      delete ctx.session.currentRecordsPage;
      delete ctx.session.filteredAppointmentsCache;
      // Редагуємо поточне повідомлення, щоб показати фільтри
      await ctx.editMessageText(
        getTranslation(ctx.session.lang, "select_records_filter"),
        getRecordsFilterKeyboard(ctx.session.lang)
      );
      return;
    }

    // Обробка кнопки "Повернутись до адмін-меню"
    if (
      callbackData === "back_to_admin_menu_from_records" &&
      (ctx.session.nextStep === "admin_view_records_filter_selection" ||
        ctx.session.nextStep === "admin_view_records_display")
    ) {
      await ctx.answerCbQuery();
      ctx.session.nextStep = "admin_menu"; // Повертаємося до адмін-меню
      delete ctx.session.currentRecordsFilter;
      delete ctx.session.currentRecordsPage;
      delete ctx.session.filteredAppointmentsCache;
      // Видаляємо повідомлення з inline-клавіатурою перегляду записів
      if (ctx.callbackQuery && ctx.callbackQuery.message) {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
      }
      // Надсилаємо нове повідомлення з reply-клавіатурою адмін-меню
      await ctx.reply(
        getTranslation(ctx.session.lang, "admin_menu_welcome"),
        getAdminMenuKeyboard(ctx.session.lang)
      );
      return;
    }
  });
}

module.exports = {
  setupViewRecordsHandlers,
};
