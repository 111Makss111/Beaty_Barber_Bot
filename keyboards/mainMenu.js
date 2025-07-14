const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");

function getMainMenuKeyboard(lang, isAdmin = false) {
  const keyboard = [
    [
      Markup.button.text(getTranslation(lang, "book_appointment_btn")),
      Markup.button.text(getTranslation(lang, "my_cabinet_btn")),
    ],
    [
      Markup.button.text(
        getTranslation(lang, "cancel_appointment_main_menu_btn")
      ), // <-- ДОДАНО: Кнопка "Скасувати візит"
    ],
  ];

  if (isAdmin) {
    keyboard.push([
      Markup.button.text(getTranslation(lang, "admin_panel_btn")),
    ]);
  }

  return Markup.keyboard(keyboard).resize();
}

module.exports = {
  getMainMenuKeyboard,
};
