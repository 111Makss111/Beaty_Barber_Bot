const { Markup } = require("telegraf");
const { getTranslation } = require("../data/translations");

const getServiceMenuInlineKeyboard = (lang) => {
  const services = [
    [
      Markup.button.callback(
        getTranslation("manicure", lang), // Змінено з 'service_manicure'
        "service_manicure"
      ),
      Markup.button.callback(
        getTranslation("pedicure", lang), // Змінено з 'service_pedicure'
        "service_pedicure"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation("removal", lang), // Змінено з 'service_removal'
        "service_removal"
      ),
      Markup.button.callback(
        getTranslation("strengthening", lang), // Змінено з 'service_strengthening'
        "service_strengthening"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation("button_back_to_menu", lang),
        "back_to_main_menu"
      ),
    ],
  ];

  return Markup.inlineKeyboard(services);
};

module.exports = {
  getServiceMenuInlineKeyboard,
};
