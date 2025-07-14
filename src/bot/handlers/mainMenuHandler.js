const { getMessage } = require("../../utils/i18n");
const { generateServiceKeyboard } = require("../../utils/keyboards");
const appointmentService = require("../../services/appointmentService"); // Заздалегідь імпортуємо
const userService = require("../../services/userService"); // Заздалегідь імпортуємо

const handleMainMenu = async (ctx) => {
  const messageText = ctx.message.text;
  const lang = ctx.session.language; // Отримуємо мову з сесії

  if (messageText === getMessage(ctx, "bookAppointment")) {
    await ctx.reply(
      getMessage(ctx, "selectService"),
      generateServiceKeyboard(ctx)
    );
    ctx.session.userState = "waiting_for_service";
  } else if (messageText === getMessage(ctx, "viewMyAppointments")) {
    // Логіка для перегляду моїх записів та кабінету
    const userId = ctx.from.id;
    const userAppointments = await appointmentService.getAppointmentsByUserId(
      userId
    );
    const user = await userService.getUser(userId);

    let response = getMessage(ctx, "yourAppointments") + "\n\n";
    if (userAppointments.length === 0) {
      response = getMessage(ctx, "noAppointments");
    } else {
      userAppointments.forEach((app) => {
        response += `*${app.service}*\n${app.date} о ${app.time}\nID: \`${app.id}\`\n\n`;
      });
    }

    // Інформація профілю (Кабінет)
    const userName = user.firstName || "Невідомо";
    const userPhone = user.phone || "Не вказано";
    const nextAppointment =
      userAppointments.length > 0 ? userAppointments[0] : null; // Можна покращити вибір "наступного"

    const profileInfo = `
📋 *Профіль клієнта*
━━━━━━━━━━━━━━━
👨‍💼 Ім’я: ${userName} ${user.lastName || ""}
📲 Телефон: ${userPhone}
${
  nextAppointment
    ? `🔧 Обрана послуга: ${nextAppointment.service}
📍 Локація: Онлайн
📆 Заплановано: ${nextAppointment.date}
⏰ Початок: ${nextAppointment.time}`
    : "Немає майбутніх записів"
}
━━━━━━━━━━━━━━━
`;
    await ctx.replyWithMarkdown(response); // Спочатку записи
    await ctx.replyWithMarkdown(
      profileInfo,
      Markup.inlineKeyboard([
        Markup.button.callback(
          getMessage(ctx, "cancelAppointmentButton"),
          "show_cancel_options"
        ), // Додамо кнопку для скасування
        Markup.button.callback(
          getMessage(ctx, "backToMainMenu"),
          "back_to_main_menu"
        ),
      ])
    );
    ctx.session.userState = "viewing_appointments_cabinet"; // Встановлюємо стан
  } else if (messageText === getMessage(ctx, "portfolio")) {
    // Логіка для портфоліо
    await ctx.reply(getMessage(ctx, "portfolioDescription"));
    // Тут пізніше додамо логіку відображення та гортання фото
    await ctx.reply(
      getMessage(ctx, "backToMainMenu"),
      Markup.inlineKeyboard([
        Markup.button.callback(
          getMessage(ctx, "backToMainMenu"),
          "back_to_main_menu"
        ),
      ])
    );
  }
};

module.exports = {
  handleMainMenu,
};
