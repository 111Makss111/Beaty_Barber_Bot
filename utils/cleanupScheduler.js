// utils/cleanupScheduler.js

const cron = require("node-cron");
const moment = require("moment-timezone");
const { getAllUsers, getSchedule, saveData } = require("../data/data");

const TIMEZONE = "Europe/Warsaw";

const cleanupOldRecords = () => {
  let dataModified = false;
  const now = moment().tz(TIMEZONE);

  const schedule = getSchedule();
  const datesToDelete = [];

  for (const dateKey in schedule) {
    const dateMoment = moment.tz(dateKey, "YYYY-MM-DD", TIMEZONE);

    if (dateMoment.isBefore(now, "day")) {
      datesToDelete.push(dateKey);
      dataModified = true;
    } else {
      const daySlots = schedule[dateKey];
      const slotsToDelete = [];
      for (const timeKey in daySlots) {
        const slotDateTime = moment.tz(
          `${dateKey} ${timeKey}`,
          "YYYY-MM-DD HH:mm",
          TIMEZONE
        );

        if (slotDateTime.add(30, "minutes").isBefore(now)) {
          // <--- ЗМІНА ТУТ
          slotsToDelete.push(timeKey);
          dataModified = true;
        }
      }
      slotsToDelete.forEach((timeKey) => {
        delete daySlots[timeKey];
      });

      if (Object.keys(daySlots).length === 0) {
        datesToDelete.push(dateKey);
        dataModified = true;
      }
    }
  }

  datesToDelete.forEach((dateKey) => {
    delete schedule[dateKey];
  });

  const users = getAllUsers();
  users.forEach((user) => {
    if (user.current_date && user.current_time) {
      const userAppointmentMoment = moment.tz(
        `${user.current_date} ${user.current_time}`,
        "YYYY-MM-DD HH:mm",
        TIMEZONE
      );

      if (userAppointmentMoment.add(30, "minutes").isBefore(now)) {
        dataModified = true;
        user.current_date = null;
        user.current_time = null;
        user.current_service = null;
      }
    }
  });

  if (dataModified) {
    saveData();
  }
};

const initCleanupScheduler = () => {
  cron.schedule("*/10 * * * *", cleanupOldRecords, {
    timezone: TIMEZONE,
  });
};

module.exports = {
  initCleanupScheduler,
};
