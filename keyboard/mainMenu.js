const { Markup } = require("telegraf");
const { getTranslation } = require("../data/translations");

const getClientMainMenuKeyboard = (lang) => {
  const menuButtons = {
    ua: [
      [
        getTranslation("client_menu_appointment", "ua"),
        getTranslation("client_menu_cancel", "ua"),
      ],
      [
        getTranslation("client_menu_profile", "ua"),
        getTranslation("client_menu_portfolio", "ua"),
      ],
    ],
    pl: [
      [
        getTranslation("client_menu_appointment", "pl"),
        getTranslation("client_menu_cancel", "pl"),
      ],
      [
        getTranslation("client_menu_profile", "pl"),
        getTranslation("client_menu_portfolio", "pl"),
      ],
    ],
  };

  const buttons = menuButtons[lang] || menuButtons.ua;

  return Markup.keyboard(buttons).resize();
};

module.exports = {
  getClientMainMenuKeyboard,
};
