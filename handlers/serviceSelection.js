const { findUser, saveUser } = require("../data/data");
const { getTranslation } = require("../data/translations");
const { getServiceMenuInlineKeyboard } = require("../keyboard/serviceMenu");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu");
const { showCalendar } = require("./calendarHandler"); // Підключаємо showCalendar

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
    getTranslation("choose_action", user.lang),
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
    await ctx.reply(getTranslation("error_try_again", user ? user.lang : "ua"));
    return;
  }

  const lang = user.lang;

  if (callbackData === "back_to_main_menu") {
    delete userStates[userId];
    user.state = null;
    saveUser(user);

    try {
      await ctx.editMessageText(ctx.callbackQuery.message.text, {
        reply_markup: { inline_keyboard: [] },
      });
    } catch (error) {}

    await ctx.reply(
      getTranslation("choose_action", lang),
      getClientMainMenuKeyboard(lang)
    );
    return;
  }

  if (callbackData.startsWith("service_")) {
    const serviceKey = callbackData;
    const serviceNameForTranslation = serviceKey.replace("service_", "");
    const serviceName = getTranslation(serviceNameForTranslation, lang);

    user.current_service = serviceName;
    // userStates[userId].state = 'waiting_for_date_selection'; // Цей стан буде встановлено в showCalendar
    saveUser(user);

    // Редагуємо попереднє повідомлення, щоб прибрати inline-клавіатуру послуг
    try {
      await ctx.editMessageText(
        `${getTranslation("data_saved", lang, {
          first_name: user.first_name || "клієнт",
        })}. ` + `Ви обрали послугу: **${serviceName}**. Тепер оберіть дату.`,
        { parse_mode: "Markdown", reply_markup: { inline_keyboard: [] } }
      );
    } catch (error) {
      // Може виникнути, якщо повідомлення вже було змінено
    }

    // ВИКЛИКАЄМО ФУНКЦІЮ ДЛЯ ВІДОБРАЖЕННЯ КАЛЕНДАРЯ
    await showCalendar(ctx);
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  showServiceMenu,
  handleServiceSelection,
};
