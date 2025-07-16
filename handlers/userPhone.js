const { findUser, saveUser } = require("../data/data");
const { getTranslation } = require("../data/translations");
const { Markup } = require("telegraf");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu");

const userStates = {};

const requestPhoneNumber = async (ctx, langCode) => {
  const userId = ctx.from.id;
  userStates[userId] = { state: "waiting_for_phone", lang: langCode };

  const keyboard = Markup.keyboard([
    [
      Markup.button.contactRequest(
        getTranslation("phone_button_telegram", langCode)
      ),
    ],
    [getTranslation("phone_button_skip", langCode)],
  ])
    .resize()
    .oneTime();

  await ctx.reply(getTranslation("request_phone", langCode), keyboard);
};

const handlePhoneNumber = async (ctx) => {
  const userId = ctx.from.id;
  let user = findUser(userId);
  const currentState = userStates[userId];

  if (currentState && currentState.state === "waiting_for_phone") {
    const lang = currentState.lang;

    if (ctx.message.contact) {
      user.phone = ctx.message.contact.phone_number;
      delete userStates[userId];
      saveUser(user);

      await ctx.reply(getTranslation("info_saved_thank_you", lang));
      await ctx.reply(
        getTranslation("choose_action", lang),
        getClientMainMenuKeyboard(lang)
      );
    } else if (ctx.message.text === getTranslation("phone_button_skip", lang)) {
      user.phone = null;
      delete userStates[userId];
      saveUser(user);

      await ctx.reply(getTranslation("info_saved_thank_you", lang));
      await ctx.reply(
        getTranslation("choose_action", lang),
        getClientMainMenuKeyboard(lang)
      );
    } else {
      const phoneRegex = /^\d{9,12}$/;
      const inputPhone = ctx.message.text.replace(/[^0-9]/g, "");

      if (phoneRegex.test(inputPhone)) {
        user.phone = inputPhone;
        delete userStates[userId];
        saveUser(user);

        await ctx.reply(getTranslation("info_saved_thank_you", lang));
        await ctx.reply(
          getTranslation("choose_action", lang),
          getClientMainMenuKeyboard(lang)
        );
      } else {
        await ctx.reply(
          getTranslation("request_phone", lang) +
            "\n\n" +
            (lang === "ua"
              ? "Будь ласка, введіть коректний номер (тільки цифри)."
              : "Proszę wprowadzić poprawny numer (tylko cyfry).")
        );
      }
    }
  }
};

module.exports = {
  requestPhoneNumber,
  handlePhoneNumber,
  userStates,
};
