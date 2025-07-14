const { getLanguageSelectionKeyboard } = require("./language");
const { getPhoneKeyboard } = require("./phone");
const { getMainMenuKeyboard } = require("./mainMenu");
const { getAdminMenuKeyboard } = require("./adminMenu");
const { getServicesKeyboard } = require("./services");
const { getCalendarKeyboard } = require("./calendar");
const { getTimeKeyboard } = require("./time"); // <-- ДОДАНО: Імпортуємо time.js

module.exports = {
  getLanguageSelectionKeyboard,
  getPhoneKeyboard,
  getMainMenuKeyboard,
  getAdminMenuKeyboard,
  getServicesKeyboard,
  getCalendarKeyboard,
  getTimeKeyboard, // <-- ДОДАНО: Експортуємо getTimeKeyboard
};
