const { Telegraf, session, Markup } = require("telegraf");
const LocalSession = require("telegraf-session-local");
const config = require("../config");
const {
  startHandler,
  handleLanguageSelectionText,
  handleUserInfoInput,
  handleContactInput,
} = require("./handlers/startHandler");
const {
  handleMainMenu,
  handleServiceSelection,
} = require("./handlers/mainMenuHandler");
const { getMessage } = require("../utils/i18n");
const {
  mainMenuKeyboard,
  generateServiceKeyboard,
  generateTimeKeyboard,
  generateUserAppointmentsKeyboard,
} = require("../utils/keyboards"); // Додано generateUserAppointmentsKeyboard
const { generateCalendar } = require("../utils/calendar");
const appointmentService = require("../services/appointmentService");
const userService = require("../services/userService");

const bot = new Telegraf(config.botToken);

const sessionDirectory = "data";
const fs = require("fs");
if (!fs.existsSync(sessionDirectory)) {
  fs.mkdirSync(sessionDirectory);
}
bot.use(new LocalSession({ database: "data/sessions.json" }).middleware());

bot.start(startHandler);

bot.on("text", async (ctx, next) => {
  if (ctx.session?.userState === "awaiting_language_selection") {
    return handleLanguageSelectionText(ctx);
  }

  if (
    ctx.session?.userState === "waiting_for_name" ||
    ctx.session?.userState === "waiting_for_phone"
  ) {
    return handleUserInfoInput(ctx);
  }

  const bookAppointmentText = getMessage(ctx, "bookAppointmentButton");
  const cancelAppointmentText = getMessage(ctx, "cancelAppointmentButton");
  const myCabinetText = getMessage(ctx, "myCabinetButton");
  const portfolioText = getMessage(ctx, "portfolioButton");
  const changeLanguageText = getMessage(ctx, "changeLanguage");

  if (ctx.message.text === bookAppointmentText) {
    // Вже обробляється handleMainMenu, але для чіткості
    return handleMainMenu(ctx);
  } else if (ctx.message.text === cancelAppointmentText) {
    // Обробник для кнопки "Скасувати запис"
    await ctx.replyWithChatAction("typing");
    const userId = ctx.from.id;
    const futureAppointments =
      await appointmentService.getFutureAppointmentsByUserId(userId);

    if (futureAppointments.length === 0) {
      await ctx.reply(getMessage(ctx, "noFutureAppointments"));
    } else {
      let appointmentsList = getMessage(ctx, "yourAppointments") + "\n\n";
      futureAppointments.forEach((app) => {
        const serviceName = getMessage(ctx, `${app.service}Service`);
        appointmentsList += `${serviceName}\n${app.date} о ${app.time}\nID: \`${app.id}\`\n\n`;
      });

      await ctx.reply(
        appointmentsList,
        generateUserAppointmentsKeyboard(ctx, futureAppointments)
      );
      ctx.session.userState = "awaiting_appointment_to_cancel"; // Встановлюємо стан
    }
  } else if (
    ctx.message.text === myCabinetText ||
    ctx.message.text === portfolioText ||
    ctx.message.text === changeLanguageText
  ) {
    return handleMainMenu(ctx); // Залишаємо поточну логіку для інших кнопок головного меню
  }
  return next();
});

bot.on("contact", handleContactInput);

bot.action(/service_(.+)/, handleServiceSelection);

bot.action(/calendar_nav_(\d{4})_(\d{1,2})/, async (ctx) => {
  await ctx.answerCbQuery();
  const year = parseInt(ctx.match[1]);
  const month = parseInt(ctx.match[2]);
  await ctx.editMessageText(
    getMessage(ctx, "selectDate"),
    generateCalendar(year, month, ctx)
  );
});

bot.action(/calendar_date_(past_)?(\d{4}-\d{2}-\d{2})/, async (ctx) => {
  await ctx.answerCbQuery();
  const isPast = ctx.match[1];
  const selectedDateStr = ctx.match[2];
  const [year, month, day] = selectedDateStr.split("-").map(Number);

  const today = new Date();
  const todayAtMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const selectedDateObj = new Date(year, month - 1, day);

  if (isPast || selectedDateObj < todayAtMidnight) {
    await ctx.reply(
      getMessage(ctx, "invalidPastDate"),
      generateCalendar(today.getFullYear(), today.getMonth(), ctx)
    );
    return;
  }

  ctx.session.selectedDate = selectedDateStr;

  const bookedTimes = await appointmentService.getBookedTimesForDate(
    selectedDateStr
  );

  await ctx.editMessageText(
    getMessage(ctx, "selectTime"),
    generateTimeKeyboard(ctx, bookedTimes, selectedDateStr)
  );
  ctx.session.userState = "waiting_for_time";
});

bot.action(/time_selected_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const selectedTime = ctx.match[1];

  ctx.session.selectedTime = selectedTime;

  const serviceName = getMessage(ctx, `${ctx.session.selectedService}Service`);
  const date = ctx.session.selectedDate;
  const time = ctx.session.selectedTime;

  await ctx.editMessageText(
    getMessage(ctx, "confirmAppointment", serviceName, date, time),
    Markup.inlineKeyboard([
      Markup.button.callback(getMessage(ctx, "confirm"), "confirm_booking"),
      Markup.button.callback(
        getMessage(ctx, "cancel"),
        "cancel_appointment_flow"
      ), // Змінено на cancel_appointment_flow
    ])
  );
  ctx.session.userState = "awaiting_confirmation";
});

bot.action("time_booked_or_past", async (ctx) => {
  await ctx.answerCbQuery(getMessage(ctx, "alreadyBooked"), true);
});

bot.action("confirm_booking", async (ctx) => {
  await ctx.answerCbQuery();
  if (
    ctx.session.selectedService &&
    ctx.session.selectedDate &&
    ctx.session.selectedTime
  ) {
    const userId = ctx.from.id;
    const service = ctx.session.selectedService;
    const date = ctx.session.selectedDate;
    const time = ctx.session.selectedTime;

    const user = await userService.getUser(userId);
    const userName = user?.firstName || ctx.from.first_name || "Невідомий";
    const userPhone =
      user?.phone && user.phone !== "Пропущено" ? user.phone : "Не вказано";

    const newAppointment = await appointmentService.createAppointment({
      userId,
      service,
      date,
      time,
    });

    if (config.ADMIN_ID && newAppointment) {
      // Перевіряємо, чи запис реально створено (не дублікат)
      const serviceNameLocalized = getMessage(ctx, `${service}Service`);
      const adminMessageText = `
🔔 *НОВИЙ ЗАПИС!*
━━━━━━━━━━━━━━━
👤 *Клієнт:* ${userName} (ID: \`${userId}\`)
📞 *Телефон:* ${userPhone}
🔧 *Послуга:* ${serviceNameLocalized}
📆 *Дата:* ${date}
⏰ *Час:* ${time}
ID Запису: \`${newAppointment.id}\`
━━━━━━━━━━━━━━━
`;
      try {
        const userPhotos = await bot.telegram.getUserProfilePhotos(userId);

        if (userPhotos.total_count > 0) {
          const fileId = userPhotos.photos[0].pop().file_id;
          await bot.telegram.sendPhoto(config.ADMIN_ID, fileId, {
            caption: adminMessageText,
            parse_mode: "Markdown",
          });
        } else {
          await bot.telegram.sendMessage(config.ADMIN_ID, adminMessageText, {
            parse_mode: "Markdown",
          });
        }
      } catch (adminError) {
        console.error(
          "Помилка відправки повідомлення адміну про новий запис:",
          adminError
        );
        try {
          await bot.telegram.sendMessage(config.ADMIN_ID, adminMessageText, {
            parse_mode: "Markdown",
          });
        } catch (fallbackError) {
          console.error(
            "Критична помилка: Не вдалося відправити повідомлення адміну про новий запис навіть текстом:",
            fallbackError
          );
        }
      }
    }

    await ctx.editMessageText(getMessage(ctx, "appointmentConfirmed"));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
    ctx.session.userState = "idle";

    delete ctx.session.selectedService;
    delete ctx.session.selectedDate;
    delete ctx.session.selectedTime;
  } else {
    await ctx.editMessageText(getMessage(ctx, "error"));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
    ctx.session.userState = "idle";
  }
});

// Обробник для скасування запису (на етапі підтвердження) - повертає в головне меню
bot.action("cancel_appointment_flow", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(getMessage(ctx, "appointmentCanceled"));
  await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  ctx.session.userState = "idle";
  // Очищаємо дані сесії про поточний запис
  delete ctx.session.selectedService;
  delete ctx.session.selectedDate;
  delete ctx.session.selectedTime;
});

// Новий обробник для вибору запису для скасування (після натискання "Скасувати запис")
bot.action(/cancel_appointment_id_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const appointmentIdToCancel = ctx.match[1];

  // Знайдемо запис в сесії або знову з бази, щоб відобразити користувачу
  const futureAppointments =
    await appointmentService.getFutureAppointmentsByUserId(ctx.from.id);
  const appToCancel = futureAppointments.find(
    (app) => app.id === appointmentIdToCancel
  );

  if (appToCancel) {
    const serviceName = getMessage(ctx, `${appToCancel.service}Service`);
    await ctx.editMessageText(
      getMessage(
        ctx,
        "confirmCancelAppointment",
        serviceName,
        appToCancel.date,
        appToCancel.time
      ),
      Markup.inlineKeyboard([
        Markup.button.callback(
          getMessage(ctx, "confirm"),
          `confirm_cancel_id_${appToCancel.id}`
        ),
        Markup.button.callback(
          getMessage(ctx, "cancel"),
          "back_from_cancel_list"
        ), // Назад до списку
      ])
    );
    ctx.session.userState = "awaiting_cancel_confirmation"; // Новий стан
  } else {
    await ctx.editMessageText(getMessage(ctx, "appointmentCancelFailed"));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
    ctx.session.userState = "idle";
  }
});

// Новий обробник для підтвердження скасування запису
bot.action(/confirm_cancel_id_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const appointmentId = ctx.match[1];

  const canceledApp = await appointmentService.cancelAppointment(appointmentId);

  if (canceledApp) {
    await ctx.editMessageText(getMessage(ctx, "appointmentCanceled"));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx)); // Повертаємо головне меню

    // Відправка повідомлення адміністратору про скасування
    if (config.ADMIN_ID) {
      const user = await userService.getUser(ctx.from.id);
      const userName = user?.firstName || ctx.from.first_name || "Невідомий";
      const serviceNameLocalized = getMessage(
        ctx,
        `${canceledApp.service}Service`
      );

      const adminMessage = getMessage(
        ctx,
        "appointmentCanceledByClientAdmin",
        userName,
        ctx.from.id,
        serviceNameLocalized,
        canceledApp.date,
        canceledApp.time,
        canceledApp.id
      );
      try {
        await bot.telegram.sendMessage(config.ADMIN_ID, adminMessage, {
          parse_mode: "Markdown",
        });
        console.log("Повідомлення адміну про скасування успішно відправлено.");
      } catch (adminError) {
        console.error(
          "Помилка відправки повідомлення адміну про скасування:",
          adminError
        );
      }
    }
  } else {
    await ctx.editMessageText(getMessage(ctx, "appointmentCancelFailed"));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  }
  ctx.session.userState = "idle"; // Скидаємо стан
});

// Обробник для кнопки "Назад" зі списку скасування
bot.action("back_from_cancel_list", async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.callbackQuery.message) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  }
  await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  ctx.session.userState = "idle";
});

bot.action(
  /ignore_calendar_empty|ignore_calendar_day|ignore_header/,
  async (ctx) => {
    await ctx.answerCbQuery();
  }
);

bot.action("back_to_main_menu", async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.callbackQuery.message) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  }
  await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  ctx.session.userState = "idle";
});

bot.action("back_to_main_menu_from_services", async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.callbackQuery.message) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  }
  await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  ctx.session.userState = "idle";
});

bot.action("back_to_main_menu_from_calendar", async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.callbackQuery.message) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  }
  await ctx.reply(
    getMessage(ctx, "selectService"),
    generateServiceKeyboard(ctx)
  );
  ctx.session.userState = "waiting_for_service";
});

bot.action("back_to_calendar_from_time", async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.callbackQuery.message) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  }
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  await ctx.reply(
    getMessage(ctx, "selectDate"),
    generateCalendar(currentYear, currentMonth, ctx)
  );
  ctx.session.userState = "waiting_for_date";
});

bot
  .launch()
  .then(() => console.log("Bot started"))
  .catch((err) => console.error("Bot launch error:", err));

module.exports = bot;
