const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");
const { getMainMenuKeyboard } = require("../keyboards");
const { bookedAppointments } = require("./time"); // Імпортуємо масив записів

function setupProfileHandlers(bot) {
  // Обробник натискання кнопки "👤 Кабінет"
  bot.on("text", async (ctx, next) => {
    const messageText = ctx.message.text;
    const myCabinetBtnText = getTranslation(
      ctx.session.lang || "ua",
      "my_cabinet_btn"
    );

    if (messageText === myCabinetBtnText) {
      console.log('User pressed "My Cabinet" button.');
      ctx.session.nextStep = "profile_view"; // Встановлюємо стан перегляду профілю

      const userId = ctx.from.id;
      const userName =
        ctx.session.userName || ctx.from.first_name || "Не вказано";
      const userPhone = ctx.session.userPhone || "Не вказано";

      // Формуємо базове повідомлення профілю
      let profileMessage =
        `${getTranslation(ctx.session.lang, "profile_header")}\n` +
        `${getTranslation(ctx.session.lang, "admin_delimiter")}\n` +
        `${getTranslation(ctx.session.lang, "admin_client_name", userName)}\n` +
        `${getTranslation(
          ctx.session.lang,
          "admin_client_phone",
          userPhone
        )}\n`;

      // Знаходимо записи користувача
      const userAppointments = bookedAppointments.filter(
        (app) => app.userId === userId
      );

      if (userAppointments.length > 0) {
        profileMessage += "\n"; // Додаємо відступ перед записами
        userAppointments.forEach((app) => {
          const serviceName = getTranslation(
            ctx.session.lang,
            `${app.service}_service_btn`
          );
          const formattedDate = new Date(app.date).toLocaleDateString(
            ctx.session.lang === "ua" ? "uk-UA" : "pl-PL"
          );
          profileMessage += `${getTranslation(
            ctx.session.lang,
            "profile_appointment_details",
            serviceName,
            formattedDate,
            app.time
          )}\n`;
        });
      } else {
        profileMessage += `\n${getTranslation(
          ctx.session.lang,
          "profile_no_appointments"
        )}\n`;
      }
      profileMessage += getTranslation(ctx.session.lang, "admin_delimiter");

      let userProfilePhotoFileId = null;
      try {
        const photos = await bot.telegram.getUserProfilePhotos(userId);
        if (photos.total_count > 0 && photos.photos[0].length > 0) {
          userProfilePhotoFileId =
            photos.photos[0][photos.photos[0].length - 1].file_id;
        }
      } catch (e) {
        console.error(`Failed to get user profile photos for ${userId}:`, e);
      }

      // Відправляємо повідомлення з фото або без
      if (userProfilePhotoFileId) {
        await ctx.replyWithPhoto(userProfilePhotoFileId, {
          caption: profileMessage,
          parse_mode: "HTML", // Або 'MarkdownV2' якщо використовуєш markdown
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.button.callback(
                getTranslation(
                  ctx.session.lang,
                  "back_to_main_menu_profile_btn"
                ),
                "go_to_main_menu_from_profile"
              ),
            ],
          ]).reply_markup,
        });
      } else {
        await ctx.reply(
          profileMessage,
          Markup.inlineKeyboard([
            [
              Markup.button.callback(
                getTranslation(
                  ctx.session.lang,
                  "back_to_main_menu_profile_btn"
                ),
                "go_to_main_menu_from_profile"
              ),
            ],
          ])
        );
      }
      return;
    }
    return next();
  });

  // Обробник для кнопки "Повернутись до головного меню" з профілю
  bot.on("callback_query", async (ctx, next) => {
    const callbackData = ctx.callbackQuery.data;

    if (
      ctx.session.nextStep === "profile_view" &&
      callbackData === "go_to_main_menu_from_profile"
    ) {
      await ctx.answerCbQuery();
      console.log("User navigated to main menu from profile screen.");
      ctx.session.nextStep = null; // Скидаємо стан

      // Видаляємо інлайн-клавіатуру з повідомлення профілю
      try {
        await ctx.editMessageReplyMarkup({});
      } catch (e) {
        console.error(
          "Failed to remove inline keyboard after profile view:",
          e
        );
      }
      // Відправляємо нове повідомлення з головним меню
      await ctx.reply(
        getTranslation(ctx.session.lang, "main_menu_welcome"),
        getMainMenuKeyboard(ctx.session.lang, ctx.session.isAdmin)
      );
      return;
    }
    return next();
  });
}

module.exports = {
  setupProfileHandlers,
};
