const { Markup } = require("telegraf");

function getMainMenuKeyboard(lang = "uk") {
  const buttons = {
    uk: ["📅 Запис", "❌ Скасувати запис", "👤 Мій профіль", "📸 Портфоліо"],
    pl: ["📅 Rezerwacja", "❌ Anuluj", "👤 Mój profil", "📸 Portfolio"],
  };

  const keyboard = buttons[lang] || buttons.uk;

  return Markup.keyboard([
    [keyboard[0], keyboard[1]],
    [keyboard[2], keyboard[3]],
  ])
    .resize()
    .oneTime();
}

module.exports = { getMainMenuKeyboard };
