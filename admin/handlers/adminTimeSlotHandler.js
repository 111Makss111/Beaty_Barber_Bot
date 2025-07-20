const { Markup } = require("telegraf");
const { getTranslation } = require("../../data/translations");
const { getSchedule, setSchedule } = require("../../data/data");
const { userStates } = require("../../handlers/userPhone");
const { AVAILABLE_TIMES } = require("../../keyboard/timeSlots");
const moment = require("moment-timezone");

const getAdminTimeSlotsKeyboard = (dateString, lang) => {
  const schedule = getSchedule();
  const daySchedule = schedule[dateString] || {};
  const allPossibleSlots = [...new Set(AVAILABLE_TIMES)].sort((a, b) => {
    const [hA, mA] = a.split(":").map(Number);
    const [hB, mB] = b.split(":").map(Number);
    if (hA === hB) return mA - mB;
    return hA - hB;
  });

  const buttons = [];
  const now = moment().tz("Europe/Warsaw");
  const todayString = now.format("YYYY-MM-DD");

  for (const slot of allPossibleSlots) {
    const [hours, minutes] = slot.split(":").map(Number);
    const slotDateTime = moment.tz(
      `${dateString} ${slot}`,
      "YYYY-MM-DD HH:mm",
      "Europe/Warsaw"
    );

    let buttonText = slot;
    let callbackData = `admin_toggle_hour_${dateString}_${slot}`;

    const slotInfo = daySchedule[slot];
    let isBlockedByAdmin = false;
    let isBooked = false;
    let isPast = false;

    if (slotInfo) {
      if (slotInfo.status === "booked") {
        isBooked = true;
      } else if (slotInfo.status === "blocked_admin") {
        isBlockedByAdmin = true;
      }
    }

    if (slotDateTime.isSameOrBefore(now)) {
      isPast = true;
    }

    if (isBlockedByAdmin) {
      buttonText = `${slot} ❌`;
    } else if (isBooked) {
      buttonText = `${slot} 🧑`;
    } else if (isPast) {
      buttonText = `${slot} ⌛`;
    }

    if (isBooked || isPast) {
      callbackData = "ignore_slot";
    }

    buttons.push(Markup.button.callback(buttonText, callbackData));
  }

  const rows = [];
  for (let i = 0; i < buttons.length; i += 4) {
    rows.push(buttons.slice(i, i + 4));
  }

  rows.push([
    Markup.button.callback(
      getTranslation("button_finish_blocking_hours", lang),
      `admin_finish_hour_blocking_${dateString}`
    ),
    Markup.button.callback(
      getTranslation("button_back_to_calendar", lang),
      `admin_back_to_calendar_from_hours_${dateString}`
    ),
  ]);

  return Markup.inlineKeyboard(rows);
};

const handleAdminTimeSlotCallback = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = userStates[userId];

  await ctx.answerCbQuery();

  if (!user || user.state !== "admin_waiting_for_hour_to_block") {
    await ctx.reply(getTranslation("access_denied", user ? user.lang : "ua"));
    return;
  }

  const lang = user.lang;
  const currentSelectedDate = user.current_admin_date;

  if (!currentSelectedDate) {
    await ctx.reply(getTranslation("error_try_again", lang));
    return;
  }

  if (callbackData.startsWith("admin_toggle_hour_")) {
    const parts = callbackData.split("_");
    const dateString = parts[3];
    const timeSlot = parts[4];

    if (dateString !== currentSelectedDate) {
      await ctx.reply(getTranslation("error_try_again", lang));
      return;
    }

    const schedule = getSchedule();
    schedule[dateString] = schedule[dateString] || {};
    const daySchedule = schedule[dateString];

    let messageText = "";

    if (
      daySchedule[timeSlot] &&
      daySchedule[timeSlot].status === "blocked_admin"
    ) {
      delete daySchedule[timeSlot];
      messageText = getTranslation("admin_hour_unblocked", lang, {
        date: dateString,
        time: timeSlot,
      });
    } else if (
      daySchedule[timeSlot] &&
      daySchedule[timeSlot].status === "booked"
    ) {
      messageText = getTranslation("slot_not_available", lang);
    } else {
      daySchedule[timeSlot] = {
        status: "blocked_admin",
        timestamp: new Date().toISOString(),
        blockedBy: userId,
      };
      messageText = getTranslation("admin_hour_blocked", lang, {
        date: dateString,
        time: timeSlot,
      });
    }

    setSchedule(schedule);

    try {
      await ctx.editMessageReplyMarkup(
        getAdminTimeSlotsKeyboard(dateString, lang).reply_markup
      );
      await ctx.answerCbQuery(messageText, { show_alert: true });
    } catch (error) {
      await ctx.reply(messageText);
    }
    return;
  }

  if (callbackData.startsWith("admin_finish_hour_blocking_")) {
    delete userStates[userId];
    const userFound = require("../../data/data").findUser(userId);
    if (userFound) {
      userFound.state = null;
      require("../../data/data").saveUser(userFound);
    }

    try {
      await ctx.editMessageReplyMarkup({});
      await ctx.reply(
        getTranslation("choose_action", lang),
        require("../keyboard/adminMenu").getAdminMenuKeyboard(lang)
      );
    } catch (error) {
      await ctx.reply(getTranslation("error_try_again", lang));
    }
    return;
  }

  if (callbackData.startsWith("admin_back_to_calendar_from_hours_")) {
    const now = moment().tz("Europe/Warsaw");
    userStates[userId] = {
      state: "admin_waiting_for_date_for_time_block",
      lang: lang,
    };
    const userFound = require("../../data/data").findUser(userId);
    if (userFound) {
      userFound.state = "admin_waiting_for_date_for_time_block";
      require("../../data/data").saveUser(userFound);
    }

    try {
      await ctx.editMessageReplyMarkup(
        require("../../keyboard/calendar").getCalendarInlineKeyboard(
          now.year(), // Виправлено: використовуємо .year()
          now.month(), // Виправлено: використовуємо .month() (0-індексований місяць)
          lang,
          true
        ).reply_markup
      );
      await ctx.editMessageText(
        getTranslation("admin_choose_date_for_hours_block", lang)
      );
    } catch (error) {
      await ctx.reply(
        getTranslation("admin_choose_date_for_hours_block", lang),
        require("../../keyboard/calendar").getCalendarInlineKeyboard(
          now.year(),
          now.month(),
          lang,
          true
        )
      );
    }
    return;
  }

  if (
    callbackData === "ignore_slot_booked" ||
    callbackData === "ignore_past_slot"
  ) {
    await ctx.answerCbQuery(getTranslation("slot_not_available", lang), {
      show_alert: true,
    });
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  getAdminTimeSlotsKeyboard,
  handleAdminTimeSlotCallback,
};
