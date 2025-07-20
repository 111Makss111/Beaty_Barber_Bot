const cron = require("node-cron");
const moment = require("moment-timezone");
const { getAllUsers, getSchedule, setSchedule } = require("../data/data");
const { getTranslation } = require("../data/translations");

let botInstance;
const CRON_INTERVAL_SECONDS = 30;

function initNotifications(bot) {
  botInstance = bot;

  cron.schedule(
    `*/${CRON_INTERVAL_SECONDS} * * * * *`,
    () => {
      checkAndSendNotifications();
    },
    {
      timezone: "Europe/Warsaw",
    }
  );
}

async function checkAndSendNotifications() {
  if (!botInstance) {
    return;
  }

  const users = getAllUsers();
  const schedule = getSchedule();
  const now = moment().tz("Europe/Warsaw");

  let dataChanged = false;

  for (const dateKey in schedule) {
    const dailySchedule = schedule[dateKey];

    for (const timeKey in dailySchedule) {
      const booking = dailySchedule[timeKey];

      if (!booking.userId) {
        continue;
      }

      const user = users.find((u) => u.id === booking.userId);
      if (!user) {
        continue;
      }

      if (typeof booking.notification_2h_sent === "undefined") {
        booking.notification_2h_sent = false;
        dataChanged = true;
      }
      if (typeof booking.notification_24h_sent === "undefined") {
        booking.notification_24h_sent = false;
        dataChanged = true;
      }

      const bookingDateTime = moment.tz(
        `${dateKey} ${timeKey}`,
        "YYYY-MM-DD HH:mm",
        "Europe/Warsaw"
      );

      if (bookingDateTime.isSameOrBefore(now) || booking.status !== "booked") {
        continue;
      }

      const diffMinutes = bookingDateTime.diff(now, "minutes");
      const diffSeconds = bookingDateTime.diff(now, "seconds");

      let message = null;
      let notificationKey = null;

      const TWENTY_FOUR_HOURS_IN_MINUTES = 24 * 60; // 1440 хвилин
      const TWO_HOURS_IN_MINUTES = 2 * 60; // 120 хвилин

      if (
        diffMinutes === TWENTY_FOUR_HOURS_IN_MINUTES &&
        !booking.notification_24h_sent
      ) {
        if (
          diffSeconds >= TWENTY_FOUR_HOURS_IN_MINUTES * 60 &&
          diffSeconds <
            TWENTY_FOUR_HOURS_IN_MINUTES * 60 + CRON_INTERVAL_SECONDS
        ) {
          message = getTranslation("notification_reminder", user.lang || "ua", {
            name: user.first_name || user.name || "",
            surname: user.last_name || user.surname || "",
            date: bookingDateTime.format("DD.MM.YYYY"),
            time: bookingDateTime.format("HH:mm"),
            service: getTranslation(booking.service, user.lang || "ua"),
          });
          notificationKey = "notification_24h_sent";
        }
      } else if (
        diffMinutes === TWO_HOURS_IN_MINUTES &&
        !booking.notification_2h_sent
      ) {
        if (
          diffSeconds >= TWO_HOURS_IN_MINUTES * 60 &&
          diffSeconds < TWO_HOURS_IN_MINUTES * 60 + CRON_INTERVAL_SECONDS
        ) {
          message = getTranslation("notification_reminder", user.lang, {
            name: user.first_name || user.name || "",
            surname: user.last_name || user.surname || "",
            date: bookingDateTime.format("DD.MM.YYYY"),
            time: bookingDateTime.format("HH:mm"),
            service: getTranslation(booking.service, user.lang || "ua"),
          });
          notificationKey = "notification_2h_sent";
        }
      }

      if (message && notificationKey) {
        try {
          await botInstance.telegram.sendMessage(user.id, message, {
            parse_mode: "Markdown",
          });
          booking[notificationKey] = true;
          dataChanged = true;
        } catch (error) {
          if (error.message.includes("bot was blocked by the user")) {
            // Дії, якщо бот заблоковано користувачем
          }
        }
      }
    }
  }

  if (dataChanged) {
    setSchedule(schedule);
  }
}

module.exports = { initNotifications };
