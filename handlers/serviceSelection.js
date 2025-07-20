// handlers/serviceSelection.js

const { findUser, saveUser } = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getServiceMenuInlineKeyboard } = require("../keyboard/serviceMenu");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu");
const { showCalendar } = require("./calendarHandler");

const { userStates } = require("./userPhone");

const showServiceMenu = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);

  if (!user) {
    await ctx.reply(getTranslation("error_try_again", "ua"));
    return;
  }

  userStates[userId] = {
    state: "waiting_for_service_selection",
    lang: user.lang,
  };
  saveUser(user);

  await ctx.reply(
    getTranslation("choose_service", user.lang),
    getServiceMenuInlineKeyboard(user.lang)
  );
};

const handleServiceSelection = async (ctx) => {
  const userId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  const user = findUser(userId);
  const currentState = userStates[userId];

  await ctx.answerCbQuery();

  if (
    !user ||
    !currentState ||
    currentState.state !== "waiting_for_service_selection"
  ) {
    await ctx.reply(getTranslation("error_try_again", user?.lang || "ua"));
    return;
  }

  if (callbackData.startsWith("service_")) {
    const serviceKey = callbackData;
    user.current_service = serviceKey;
    saveUser(user);

    const lang = user.lang || "ua";
    const serviceNameForDisplay = getTranslation(serviceKey, lang);

    const dataSavedMessage = getTranslation("data_saved", lang, {
      name: user.first_name || "клієнт",
      surname: user.last_name || "",
    });
    const proceedToDateMessage = getTranslation(
      "service_selected_proceed_to_date",
      lang,
      {
        service_name: serviceNameForDisplay,
      }
    );

    // Комбінуємо повідомлення з новим рядком.
    const fullMessageText = `${dataSavedMessage}\n${proceedToDateMessage}`;

    // Додаємо дебаг лог для перевірки сформованого тексту та режиму парсингу
    console.log(`[DEBUG] Сформований текст для відправки:`);
    console.log(fullMessageText);
    console.log(`[DEBUG] Parse Mode: Markdown`); // Логуємо поточний режим парсингу

    try {
      await ctx.editMessageText(
        fullMessageText,
        { parse_mode: "Markdown" } // Використовуємо Markdown
      );
    } catch (error) {
      console.error(
        "Error editing message text in handleServiceSelection:",
        error.message
      );
      if (error.on && error.on.payload) {
        console.error(
          "[DEBUG] Payload, що викликав помилку:",
          error.on.payload
        );
      }
      // Якщо редагування не вдалося, відправляємо нове повідомлення
      await ctx.reply(fullMessageText, {
        parse_mode: "Markdown",
      });
    }

    await showCalendar(ctx);
    return;
  }

  if (callbackData === "back_to_main_menu") {
    user.state = null;
    user.current_service = null;
    saveUser(user);

    // Спроба видалити інлайн-клавіатуру з поточного повідомлення
    try {
      await ctx.editMessageReplyMarkup({});
    } catch (error) {
      console.error(
        "Помилка видалення інлайн-клавіатури при поверненні в головне меню:",
        error.message
      );
      // Якщо не вдалося видалити (наприклад, повідомлення вже змінено або видалено), продовжуємо.
    }

    // Відправляємо нове повідомлення з привітанням і звичайною клавіатурою головного меню
    await ctx.reply(
      getTranslation("welcome_back", user.lang), // Використовуємо існуючий ключ "welcome_back"
      getClientMainMenuKeyboard(user.lang)
    );
    return;
  }

  await ctx.reply(getTranslation("error_unknown_command", user.lang || "ua"));
};

module.exports = {
  showServiceMenu,
  handleServiceSelection,
};
