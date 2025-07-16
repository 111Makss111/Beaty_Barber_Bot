const { Markup } = require("telegraf");
const { findUser, saveUser } = require("../data/data");
const { getAdminMenuKeyboard } = require("../admin/keyboard/adminMenu");
const { getTranslation } = require("../data/translations");
const { requestPhoneNumber, userStates } = require("./userPhone"); // Підключаємо userStates та requestPhoneNumber

const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(",").map((id) => parseInt(id.trim()))
  : [];

// userStates НЕ ініціалізуємо тут, він знаходиться і контролюється в userPhone.js

const processLanguageSelection = async (ctx, langCode) => {
  const userId = ctx.from.id;
  let user = findUser(userId);

  if (!user) {
    user = {
      id: userId,
      lang: langCode,
      is_admin: ADMIN_IDS.includes(userId),
      state: null, // Початковий стан, якщо користувач новий
    };
    saveUser(user);
  } else {
    user.lang = langCode;
    user.is_admin = ADMIN_IDS.includes(userId); // Оновлюємо статус адміна на випадок змін
    saveUser(user);
  }

  if (user.is_admin) {
    await ctx.reply(
      getTranslation("admin_welcome", user.lang),
      getAdminMenuKeyboard(user.lang)
    );
  } else {
    // Встановлюємо стан 'waiting_for_name' для userPhone.js
    userStates[userId] = { state: "waiting_for_name", lang: langCode };
    // Зберігати користувача тут не обов'язково, бо ми вже зберегли його вище
    // або оновили мову та статус адміна.

    await ctx.reply(
      getTranslation("request_name", user.lang),
      Markup.removeKeyboard() // Прибираємо клавіатуру вибору мови
    );
  }
};

const handleUserNameAndSurname = async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  const currentState = userStates[userId];

  // Перевіряємо, чи користувач перебуває у стані очікування імені/прізвища
  if (currentState && currentState.state === "waiting_for_name") {
    let user = findUser(userId);
    if (!user) {
      // Якщо користувач з якихось причин не знайдений, скидаємо стан
      delete userStates[userId];
      await ctx.reply(getTranslation("error_try_again", currentState.lang));
      return;
    }

    const [firstName, ...lastNameParts] = text.split(" ");
    const lastName = lastNameParts.join(" ");

    user.first_name = firstName || null;
    user.last_name = lastName || null;
    // user.state залишаємо без змін або ставимо 'waiting_for_phone' якщо хочемо його бачити в JSON
    saveUser(user); // Зберігаємо ім'я та прізвище в JSON

    // НЕ видаляємо userStates[userId] тут! Він буде оновлений requestPhoneNumber
    // або вже містить 'waiting_for_name', який потім userPhone змінить на 'waiting_for_phone'

    await ctx.reply(
      getTranslation("data_saved", user.lang, { first_name: user.first_name })
    );

    // Переходимо до запиту номера телефону
    await requestPhoneNumber(ctx, user.lang);
  }
};

module.exports = {
  processLanguageSelection,
  handleUserNameAndSurname,
};
