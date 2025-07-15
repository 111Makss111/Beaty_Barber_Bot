const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");
const {
  getTimeKeyboard,
  getCalendarKeyboard,
  getMainMenuKeyboard,
} = require("../keyboards");
const { getServicesKeyboard } = require("../keyboards");
const { scheduleAppointmentReminders } = require("../utils/notification");

const bookedAppointments = [];

function setupTimeHandlers(bot, ADMIN_IDS, localSessionInstance) {
  bot.on("callback_query", async (ctx, next) => {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    if (ctx.session.nextStep === "await_time_selection") {
      await ctx.answerCbQuery();

      if (callbackData === "back_to_calendar") {
        console.log('User pressed "Back to Calendar" from time selection.');
        ctx.session.nextStep = "await_date_selection";
        const year = ctx.session.calendarYear || new Date().getFullYear();
        const month = ctx.session.calendarMonth || new Date().getMonth();
        await ctx.editMessageText(
          getTranslation(ctx.session.lang, "request_date"),
          {
            reply_markup: getCalendarKeyboard(year, month, ctx.session.lang)
              .reply_markup,
          }
        );
        return;
      }

      if (callbackData.startsWith("time-select-")) {
        const selectedTime = callbackData.replace("time-select-", "");
        const selectedDate = new Date(ctx.session.selectedDate);

        const [hours, minutes] = selectedTime.split(":").map(Number);
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(hours, minutes, 0, 0);
        const now = new Date();

        if (
          selectedDate.toDateString() === now.toDateString() &&
          slotDateTime.getTime() < now.getTime()
        ) {
          await ctx.reply(
            getTranslation(ctx.session.lang, "invalid_past_time")
          );
          await ctx.editMessageReplyMarkup(
            getTimeKeyboard(selectedDate, bookedAppointments, ctx.session.lang)
              .reply_markup
          );
          return;
        }

        const isBooked = bookedAppointments.some((appointment) => {
          const apptDate = new Date(appointment.date);
          const apptTime = appointment.time;
          return (
            apptDate.toDateString() === selectedDate.toDateString() &&
            apptTime === selectedTime
          );
        });

        if (isBooked) {
          await ctx.reply(
            getTranslation(ctx.session.lang, "time_already_booked")
          );
          await ctx.editMessageReplyMarkup(
            getTimeKeyboard(selectedDate, bookedAppointments, ctx.session.lang)
              .reply_markup
          );
          return;
        }

        ctx.session.selectedTime = selectedTime;
        ctx.session.nextStep = "await_confirmation";

        const serviceName = getTranslation(
          ctx.session.lang,
          `${ctx.session.selectedService}_service_btn`
        );
        const formattedDate = new Date(
          ctx.session.selectedDate
        ).toLocaleDateString(ctx.session.lang === "ua" ? "uk-UA" : "pl-PL");

        await ctx.editMessageText(
          getTranslation(
            ctx.session.lang,
            "confirm_appointment",
            serviceName,
            formattedDate,
            selectedTime
          ),
          Markup.inlineKeyboard([
            [
              Markup.button.callback(
                getTranslation(ctx.session.lang, "confirm_btn"),
                "confirm_appointment"
              ),
              Markup.button.callback(
                getTranslation(ctx.session.lang, "cancel_btn"),
                "cancel_appointment"
              ),
            ],
          ])
        );
        return;
      }
    }

    if (ctx.session.nextStep === "await_confirmation") {
      await ctx.answerCbQuery();

      if (callbackData === "confirm_appointment") {
        console.log("User confirmed appointment.");

        const newAppointment = {
          userId: userId,
          name: ctx.session.userName,
          phone: ctx.session.userPhone,
          service: ctx.session.selectedService,
          date: ctx.session.selectedDate,
          time: ctx.session.selectedTime,
          timestamp: new Date().toISOString(),
          lang: ctx.session.lang, // <<<<< ДОДАНО ЦЕЙ РЯДОК
        };
        bookedAppointments.push(newAppointment);

        scheduleAppointmentReminders(
          bot,
          newAppointment,
          bookedAppointments,
          localSessionInstance
        );

        const serviceName = getTranslation(
          ctx.session.lang,
          `${ctx.session.selectedService}_service_btn`
        );
        const formattedDate = new Date(
          ctx.session.selectedDate
        ).toLocaleDateString(ctx.session.lang === "ua" ? "uk-UA" : "pl-PL");
        const confirmationMessage = getTranslation(
          ctx.session.lang,
          "appointment_confirmed",
          serviceName,
          formattedDate,
          ctx.session.selectedTime
        );

        await ctx.editMessageText(
          confirmationMessage,
          Markup.inlineKeyboard([
            [
              Markup.button.callback(
                getTranslation(ctx.session.lang, "back_to_main_menu_final_btn"),
                "go_to_main_menu"
              ),
            ],
          ])
        );

        // --- ЛОГІКА ДЛЯ АДМІН-ПОВІДОМЛЕННЯ ---
        const adminMessageText =
          `${getTranslation(
            ctx.session.lang,
            "admin_new_appointment_header"
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
            "admin_service",
            serviceName
          )}\n` +
          `${getTranslation(ctx.session.lang, "admin_location", "Онлайн")}\n` +
          `${getTranslation(ctx.session.lang, "admin_date", formattedDate)}\n` +
          `${getTranslation(
            ctx.session.lang,
            "admin_time",
            ctx.session.selectedTime
          )}\n` +
          `${getTranslation(ctx.session.lang, "admin_delimiter")}`;

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

        for (const adminId of ADMIN_IDS) {
          try {
            if (userProfilePhotoFileId) {
              await bot.telegram.sendPhoto(adminId, userProfilePhotoFileId, {
                caption: adminMessageText,
                parse_mode: "HTML",
              });
            } else {
              await bot.telegram.sendMessage(adminId, adminMessageText);
            }
          } catch (e) {
            console.error(
              `Failed to send admin notification to ${adminId}:`,
              e
            );
          }
        }
        // --- КІНЕЦЬ ЛОГІКИ ДЛЯ АДМІН-ПОВІДОМЛЕННЯ ---

        ctx.session.nextStep = null;
        delete ctx.session.selectedService;
        delete ctx.session.selectedDate;
        delete ctx.session.selectedTime;
        delete ctx.session.calendarYear;
        delete ctx.session.calendarMonth;

        return;
      }

      if (callbackData === "cancel_appointment") {
        console.log("User cancelled appointment.");
        await ctx.editMessageText(
          getTranslation(ctx.session.lang, "appointment_cancelled"),
          Markup.inlineKeyboard([
            [
              Markup.button.callback(
                getTranslation(ctx.session.lang, "back_to_main_menu_final_btn"),
                "go_to_main_menu"
              ),
            ],
          ])
        );

        ctx.session.nextStep = null;
        delete ctx.session.selectedService;
        delete ctx.session.selectedDate;
        delete ctx.session.selectedTime;
        delete ctx.session.calendarYear;
        delete ctx.session.calendarMonth;
        return;
      }
    }

    if (callbackData === "go_to_main_menu") {
      await ctx.answerCbQuery();
      console.log(
        "User navigated to main menu from final confirmation/cancellation screen."
      );
      ctx.session.nextStep = null;
      try {
        await ctx.editMessageReplyMarkup({});
      } catch (e) {
        console.error(
          "Failed to remove inline keyboard after final confirmation:",
          e
        );
      }
      await ctx.reply(
        getTranslation(ctx.session.lang, "main_menu_welcome"),
        getMainMenuKeyboard(ctx.session.lang)
      );
      return;
    }

    return next();
  });
}

module.exports = {
  setupTimeHandlers,
  bookedAppointments,
};
