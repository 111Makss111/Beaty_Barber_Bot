const { Markup } = require("telegraf");
const { getMessage } = require("./i18n");
const { AVAILABLE_TIMES } = require("./constants");

// Клавіатура для вибору мови (спочатку, бо вона використовується на старті)
const languageSelectionKeyboard = () => {
  return Markup.inlineKeyboard([
    Markup.button.callback("🇺🇦 Українська", "set_lang_uk"),
    Markup.button.callback("🇵🇱 Polski", "set_lang_pl"),
  ]);
};

// Клавіатура головного меню (після languageSelectionKeyboard, але до її використання)
const mainMenuKeyboard = (ctx) => {
  return Markup.keyboard([
    [getMessage(ctx, "bookAppointment"), getMessage(ctx, "viewMyAppointments")],
    [getMessage(ctx, "portfolio"), getMessage(ctx, "changeLanguage")],
  ]).resize();
};

const adminPanelKeyboard = (ctx) => {
  return Markup.keyboard([
    [getMessage(ctx, "viewAllAppointments"), getMessage(ctx, "blockDateTime")],
    [getMessage(ctx, "addPortfolioPhoto"), getMessage(ctx, "backToMainMenu")],
  ]).resize();
};

const confirmationKeyboard = (ctx) => {
  return Markup.inlineKeyboard([
    Markup.button.callback(getMessage(ctx, "confirm"), "confirm_booking"),
    Markup.button.callback(getMessage(ctx, "cancel"), "cancel_booking"),
  ]);
};

const generateTimeKeyboard = (ctx, availableTimes) => {
  const buttons = availableTimes.map((time) =>
    Markup.button.callback(time, `time_${time}`)
  );
  return Markup.inlineKeyboard(buttons, { columns: 3 });
};

const generateServiceKeyboard = (ctx) => {
  const services = [
    { id: "haircut", name: "Стрижка" },
    { id: "manicure", name: "Манікюр" },
    { id: "massage", name: "Масаж" },
  ];
  const buttons = services.map((service) =>
    Markup.button.callback(service.name, `service_${service.id}`)
  );
  return Markup.inlineKeyboard(buttons, { columns: 2 });
};

module.exports = {
  mainMenuKeyboard,
  adminPanelKeyboard,
  confirmationKeyboard,
  generateTimeKeyboard,
  generateServiceKeyboard,
  languageSelectionKeyboard,
};
