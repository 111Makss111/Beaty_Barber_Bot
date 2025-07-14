const { Markup } = require("telegraf");

function getPhoneKeyboard(lang, getTranslationFunc) {
  return Markup.keyboard([
    [
      Markup.button.text(getTranslationFunc(lang, "share_phone_btn"), null, {
        request_contact: true,
      }),
      // ЗАЙВА КОМА ВИДАЛЕНА ЗВІДСИ
      getTranslationFunc(lang, "skip_phone_btn"),
    ],
  ])
    .resize()
    .oneTime();
}

module.exports = {
  getPhoneKeyboard,
};
