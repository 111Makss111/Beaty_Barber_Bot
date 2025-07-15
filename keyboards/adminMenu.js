const { Markup } = require("telegraf");
const { getTranslation } = require("../translate");

function getAdminMenuKeyboard(lang) {
  return Markup.keyboard([
    [
      getTranslation(lang, "view_all_records_btn"),
      getTranslation(lang, "block_date_time_btn"),
    ],
    [getTranslation(lang, "add_to_portfolio_btn")],
  ]).resize();
}

module.exports = {
  getAdminMenuKeyboard,
};
