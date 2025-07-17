const { Markup } = require("telegraf");
const { getTranslation } = require("../../data/translations"); // Підключаємо переклади

const getAdminMenuKeyboard = (lang) => {
  const menuButtons = {
    ua: [
      [
        getTranslation("admin_menu_view_records", "ua"),
        getTranslation("admin_menu_block_date", "ua"),
      ],
      [
        getTranslation("admin_menu_block_hours", "ua"),
        getTranslation("admin_menu_add_portfolio", "ua"),
      ],
      [
        getTranslation("admin_menu_block_client", "ua"), // Ця кнопка тепер буде в окремому рядку, якщо парних не буде
      ],
    ],
    pl: [
      [
        getTranslation("admin_menu_view_records", "pl"),
        getTranslation("admin_menu_block_date", "pl"),
      ],
      [
        getTranslation("admin_menu_block_hours", "pl"),
        getTranslation("admin_menu_add_portfolio", "pl"),
      ],
      [
        getTranslation("admin_menu_block_client", "pl"), // Ця кнопка тепер буде в окремому рядку, якщо парних не буде
      ],
    ],
  };

  const buttons = menuButtons[lang] || menuButtons.ua;

  return Markup.keyboard(buttons).resize();
};

module.exports = {
  getAdminMenuKeyboard,
};
