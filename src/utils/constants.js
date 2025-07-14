const ADMIN_ID = process.env.ADMIN_ID;
const AVAILABLE_TIMES = ["09:00", "12:00", "15:00", "18:00"];
const APPOINTMENT_REMINDER_24H = 24 * 60 * 60 * 1000; // 24 години в мілісекундах
const APPOINTMENT_REMINDER_2H = 2 * 60 * 60 * 1000; // 2 години в мілісекундах

module.exports = {
  ADMIN_ID,
  AVAILABLE_TIMES,
  APPOINTMENT_REMINDER_24H,
  APPOINTMENT_REMINDER_2H,
};
