const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");
const { getMainMenuKeyboard } = require("../keyboards");
const { bookedAppointments } = require("./time"); // Імпортуємо масив заброньованих записів

function setupCancelAppointmentHandlers(bot, ADMIN_IDS) {
  // Обробник натискання кнопки "❌ Скасувати візит"
  bot.on("text", async (ctx, next) => {
    const messageText = ctx.message.text;
    const cancelBtnText = getTranslation(
      ctx.session.lang || "ua",
      "cancel_appointment_main_menu_btn"
    );

    if (messageText === cancelBtnText) {
      console.log('User pressed "Cancel Appointment" button.');
      const userId = ctx.from.id;

      // Знаходимо всі активні записи користувача
      const userAppointments = bookedAppointments.filter(
        (app) => app.userId === userId
      );

      if (userAppointments.length === 0) {
        // Якщо записів немає
        await ctx.reply(
          getTranslation(ctx.session.lang, "no_active_appointments_cancel"),
          Markup.inlineKeyboard([
            [
              Markup.button.callback(
                getTranslation(ctx.session.lang, "back_to_main_menu_final_btn"),
                "go_to_main_menu"
              ),
            ],
          ])
        );
        return;
      }

      // Наразі ми припускаємо, що у користувача може бути лише один активний запис,
      // або що ми скасовуємо перший знайдений.
      // Якщо потрібно скасовувати конкретний запис з кількох, логіка буде складнішою (вибір запису).
      const appointmentToCancel = userAppointments[0]; // Беремо перший запис для скасування

      // Видаляємо запис з масиву bookedAppointments (розблоковуємо час)
      const index = bookedAppointments.indexOf(appointmentToCancel);
      if (index > -1) {
        bookedAppointments.splice(index, 1);
        console.log(
          `Appointment for user ${userId} at ${appointmentToCancel.date} ${appointmentToCancel.time} cancelled and time slot unlocked.`
        );
      }

      // Повідомлення користувачу про скасування
      await ctx.reply(
        getTranslation(ctx.session.lang, "visit_cancelled_success"),
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              getTranslation(ctx.session.lang, "back_to_main_menu_final_btn"),
              "go_to_main_menu"
            ),
          ],
        ])
      );

      // Повідомлення адміну про скасування
      const serviceName = getTranslation(
        ctx.session.lang,
        `${appointmentToCancel.service}_service_btn`
      );
      const formattedDate = new Date(
        appointmentToCancel.date
      ).toLocaleDateString(ctx.session.lang === "ua" ? "uk-UA" : "pl-PL");

      const adminCancellationMessage =
        `${getTranslation(
          ctx.session.lang,
          "admin_cancelled_appointment_header"
        )}\n` +
        `${getTranslation(ctx.session.lang, "admin_delimiter")}\n` +
        `${getTranslation(
          ctx.session.lang,
          "admin_client_name",
          ctx.session.userName || "Не вказано"
        )}\n` +
        `${getTranslation(
          ctx.session.lang,
          "admin_client_phone",
          ctx.session.userPhone || "Не вказано"
        )}\n` +
        `${getTranslation(
          ctx.session.lang,
          "admin_cancelled_service",
          serviceName
        )}\n` +
        `${getTranslation(
          ctx.session.lang,
          "admin_cancelled_date",
          formattedDate
        )}\n` +
        `${getTranslation(
          ctx.session.lang,
          "admin_cancelled_time",
          appointmentToCancel.time
        )}\n` +
        `${getTranslation(ctx.session.lang, "admin_delimiter")}`;

      // Отримуємо фото профілю користувача для адміна
      let userProfilePhotoFileId = null;
      try {
        const photos = await bot.telegram.getUserProfilePhotos(userId);
        if (photos.total_count > 0 && photos.photos[0].length > 0) {
          userProfilePhotoFileId =
            photos.photos[0][photos.photos[0].length - 1].file_id;
        }
      } catch (e) {
        console.error(
          `Failed to get user profile photos for ${userId} for cancellation notification:`,
          e
        );
      }

      for (const adminId of ADMIN_IDS) {
        try {
          if (userProfilePhotoFileId) {
            await bot.telegram.sendPhoto(adminId, userProfilePhotoFileId, {
              caption: adminCancellationMessage,
              parse_mode: "HTML",
            });
          } else {
            await bot.telegram.sendMessage(adminId, adminCancellationMessage);
          }
        } catch (e) {
          console.error(
            `Failed to send admin cancellation notification to ${adminId}:`,
            e
          );
        }
      }

      ctx.session.nextStep = null;

      return;
    }
    return next(); // Передаємо далі, якщо це не кнопка скасування
  });

  // Обробник для кнопки "Повернутись до головного меню" після скасування
  bot.on("callback_query", async (ctx, next) => {
    const callbackData = ctx.callbackQuery.data;

    if (callbackData === "go_to_main_menu") {
    }
    return next();
  });
}

module.exports = {
  setupCancelAppointmentHandlers,
};
