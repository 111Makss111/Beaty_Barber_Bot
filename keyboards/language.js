const { Markup } = require("telegraf");

function getLanguageSelectionKeyboard() {
  return Markup.keyboard([["🇺🇦 Українська", "🇵🇱 Polska"]]).resize();
}

module.exports = {
  getLanguageSelectionKeyboard,
};
