const { Markup } = require("telegraf");
const { getTranslation } = require("../../data/translations"); // Підключаємо переклади

const getAdminMenuKeyboard = (lang) => {
  const menuButtons = {
    ua: [
      [getTranslation("admin_menu_view_records", "ua")],
      [
        getTranslation("admin_menu_block_date", "ua"),
        getTranslation("admin_menu_block_hours", "ua"),
      ],
      [
        getTranslation("admin_menu_add_portfolio", "ua"),
        getTranslation("admin_menu_block_client", "ua"),
      ],
    ],
    pl: [
      [getTranslation("admin_menu_view_records", "pl")],
      [
        getTranslation("admin_menu_block_date", "pl"),
        getTranslation("admin_menu_block_hours", "pl"),
      ],
      [
        getTranslation("admin_menu_add_portfolio", "pl"),
        getTranslation("admin_menu_block_client", "pl"),
      ],
    ],
  };

  const buttons = menuButtons[lang] || menuButtons.ua;

  return Markup.keyboard(buttons).resize();
};

module.exports = {
  getAdminMenuKeyboard,
};
