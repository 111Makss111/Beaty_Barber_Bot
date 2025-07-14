const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");

function getServicesKeyboard(lang) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        getTranslation(lang, "manicure_service_btn"),
        "manicure"
      ),
      Markup.button.callback(
        getTranslation(lang, "pedicure_service_btn"),
        "pedicure"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation(lang, "removal_service_btn"),
        "removal"
      ),
      Markup.button.callback(
        getTranslation(lang, "strengthening_service_btn"),
        "strengthening"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation(lang, "back_to_main_menu_btn"),
        "back_to_main_menu"
      ),
    ],
  ]);
}

module.exports = {
  getServicesKeyboard,
};
