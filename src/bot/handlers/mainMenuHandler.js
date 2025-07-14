const { getMessage } = require("../../utils/i18n");
const {
  generateServiceKeyboard,
  mainMenuKeyboard,
} = require("../../utils/keyboards");
const { generateCalendar } = require("../../utils/calendar"); // Імпортуємо функцію календаря
const appointmentService = require("../../services/appointmentService");
const userService = require("../../services/userService");
const { Markup } = require("telegraf");

const handleMainMenu = async (ctx) => {
  const messageText = ctx.message.text;

  if (messageText === getMessage(ctx, "bookAppointmentButton")) {
    await ctx.reply(
      getMessage(ctx, "selectService"),
      generateServiceKeyboard(ctx)
    );
    ctx.session.userState = "waiting_for_service";
  } else if (messageText === getMessage(ctx, "cancelAppointmentButton")) {
    // ... існуюча логіка скасування запису ...
    const userId = ctx.from.id;
    const userAppointments = await appointmentService.getAppointmentsByUserId(
      userId
    );

    if (userAppointments.length === 0) {
      await ctx.reply(getMessage(ctx, "noAppointments"), mainMenuKeyboard(ctx));
    } else {
      let response = getMessage(ctx, "yourAppointments") + "\n\n";
      const cancelButtons = userAppointments.map((app) => {
        response += `*${app.service}*\n${app.date} о ${app.time}\nID: \`${app.id}\`\n\n`;
        return Markup.button.callback(
          `Скасувати ${app.service} ${app.date}`,
          `cancel_specific_appointment_${app.id}`
        );
      });
      await ctx.replyWithMarkdown(
        response,
        Markup.inlineKeyboard(cancelButtons, { columns: 1 })
      );
      ctx.session.userState = "waiting_for_cancel_selection";
    }
  } else if (messageText === getMessage(ctx, "myCabinetButton")) {
    // ... існуюча логіка кабінету ...
    const userId = ctx.from.id;
    const user = await userService.getUser(userId);
    const userAppointments = await appointmentService.getAppointmentsByUserId(
      userId
    );

    const userName = user.firstName || "Невідомо";
    const userLastName = user.lastName || "";
    const userPhone =
      user.phone && user.phone !== "Пропущено"
        ? user.phone
        : getMessage(ctx, "notSpecified");

    let nextAppointmentInfo = getMessage(ctx, "noFutureAppointments");
    if (userAppointments.length > 0) {
      const sortedAppointments = userAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}:00`);
        const dateB = new Date(`${b.date}T${b.time}:00`);
        return dateA - dateB;
      });
      const nextApp = sortedAppointments[0];
      nextAppointmentInfo = `
🔧 ${getMessage(ctx, "service")}: ${nextApp.service}
📍 ${getMessage(ctx, "location")}: Онлайн
📆 ${getMessage(ctx, "scheduled")}: ${nextApp.date}
⏰ ${getMessage(ctx, "time")}: ${nextApp.time}
        `;
    }

    const profileInfo = `
📋 *${getMessage(ctx, "clientProfile")}*
━━━━━━━━━━━━━━━
👨‍💼 ${getMessage(ctx, "name")}: ${userName} ${userLastName}
📲 ${getMessage(ctx, "phone")}: ${userPhone}
${nextAppointmentInfo}
━━━━━━━━━━━━━━━
`;
    await ctx.replyWithMarkdown(
      profileInfo,
      Markup.inlineKeyboard([
        Markup.button.callback(
          getMessage(ctx, "backToMainMenu"),
          "back_to_main_menu"
        ),
      ])
    );
    ctx.session.userState = "idle";
  } else if (messageText === getMessage(ctx, "portfolioButton")) {
    await ctx.reply(getMessage(ctx, "portfolioDescription"));
    // Тут буде логіка відображення та гортання фото портфоліо
    await ctx.reply(
      getMessage(ctx, "backToMainMenu"),
      Markup.inlineKeyboard([
        Markup.button.callback(
          getMessage(ctx, "backToMainMenu"),
          "back_to_main_menu"
        ),
      ])
    );
    ctx.session.userState = "viewing_portfolio";
  }
};

// Новий обробник для вибору послуги (callback-дія)
const handleServiceSelection = async (ctx) => {
  await ctx.answerCbQuery();
  const serviceId = ctx.match[0].split("_")[1]; // Отримуємо ID послуги з callback-даних

  // Зберігаємо обрану послугу в сесії
  ctx.session.selectedService = serviceId;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11

  // Відправляємо календар
  await ctx.editMessageText(
    getMessage(ctx, "selectDate"),
    generateCalendar(year, month, ctx)
  );
  ctx.session.userState = "waiting_for_date";
};

module.exports = {
  handleMainMenu,
  handleServiceSelection, // Експортуємо новий обробник
};
