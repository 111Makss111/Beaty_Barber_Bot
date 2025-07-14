const ADMIN_ID = process.env.ADMIN_ID;
const AVAILABLE_TIMES = [
  "08:00",
  "09:30",
  "11:00",
  "12:30",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
];
const APPOINTMENT_REMINDER_24H = 24 * 60 * 60 * 1000; // 24 години в мілісекундах
const APPOINTMENT_REMINDER_2H = 2 * 60 * 60 * 1000; // 2 години в мілісекундах

module.exports = {
  ADMIN_ID,
  AVAILABLE_TIMES,
  APPOINTMENT_REMINDER_24H,
  APPOINTMENT_REMINDER_2H,
};
