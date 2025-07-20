// handlers/userPhone.js

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
      // Якщо номер прийшов через кнопку Telegram, він вже має правильний формат (з +)
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
      // Обробка ручного введення номера
      const inputPhone = ctx.message.text.replace(/[^0-9+]/g, ""); // Дозволяємо також '+' на початку

      // Перевірка, чи номер починається з '+'
      const startsWithPlus = inputPhone.startsWith("+");

      // Регулярний вираз для перевірки номера: 9-12 цифр, можливо з '+' на початку
      // Якщо починається з '+', то після нього ще 9-12 цифр. Якщо без '+', то просто 9-12 цифр.
      const phoneRegex = startsWithPlus ? /^\+\d{9,12}$/ : /^\d{9,12}$/;

      if (phoneRegex.test(inputPhone)) {
        // Якщо номер не починається з '+' і має 9-12 цифр, додаємо '+48'
        if (!startsWithPlus) {
          user.phone = `+48${inputPhone}`; // ВИПРАВЛЕНО: Додаємо +48
        } else {
          user.phone = inputPhone; // Якщо вже є '+', зберігаємо як є
        }

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
              ? "Будь ласка, введіть коректний номер (тільки цифри, або з '+' на початку, наприклад, +380XXXXXXXXX)."
              : "Proszę wprowadzić poprawny numer (tylko cyfry, lub z '+' na początku, np. +48XXXXXXXXX).")
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
