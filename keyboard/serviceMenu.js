const { Markup } = require("telegraf");
const { getTranslation } = require("../data/translations");

const getServiceMenuInlineKeyboard = (lang) => {
  const services = [
    [
      Markup.button.callback(
        getTranslation("service_manicure", lang), // Виправлено: додано 'service_'
        "service_manicure"
      ),
      Markup.button.callback(
        getTranslation("service_pedicure", lang), // Виправлено: додано 'service_'
        "service_pedicure"
      ),
    ],
    [
      Markup.button.callback(
        getTranslation("service_removal", lang), // Виправлено: додано 'service_'
        "service_removal"
      ),
      Markup.button.callback(
        getTranslation("service_strengthening", lang), // Виправлено: додано 'service_'
        "service_strengthening"
      ),
    ],
    // Якщо у тебе є інші послуги, які ми повернули у translations.js, додай їх сюди
    // Наприклад:
    // [
    //   Markup.button.callback(getTranslation("service_haircut", lang), "service_haircut"),
    //   Markup.button.callback(getTranslation("service_shave", lang), "service_shave"),
    // ],
    // [
    //   Markup.button.callback(getTranslation("service_beard_trim", lang), "service_beard_trim"),
    // ],
    [
      Markup.button.callback(
        getTranslation("button_back_to_main_menu", lang), // Виправлено: змінено на 'button_back_to_main_menu'
        "back_to_main_menu"
      ),
    ],
  ];

  return Markup.inlineKeyboard(services);
};

module.exports = {
  getServiceMenuInlineKeyboard,
};
