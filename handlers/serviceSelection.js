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

  // Виправлено: Використовуємо choose_service для цього повідомлення
  await ctx.reply(
    getTranslation("choose_service", user.lang), // Змінено з "choose_action"
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
      await ctx.editMessageReplyMarkup({}); // Просто прибираємо інлайн-клавіатуру
    } catch (error) {
      // Може бути помилка, якщо повідомлення вже відредаговано або надто старе
      console.error(
        "Error editing message markup in handleServiceSelection (back_to_main_menu):",
        error
      );
    }

    await ctx.reply(
      getTranslation("choose_action", lang), // Тут залишаємо choose_action
      getClientMainMenuKeyboard(lang)
    );
    return;
  }

  if (callbackData.startsWith("service_")) {
    const serviceKey = callbackData; // Зберігаємо повний ключ 'service_manicure'

    // Зберігаємо ПОВНИЙ КЛЮЧ послуги в user.current_service
    // Це дозволить використовувати його напряму з getTranslation
    user.current_service = serviceKey;
    saveUser(user);

    // Отримуємо перекладену назву для відображення клієнту
    const serviceNameForDisplay = getTranslation(serviceKey, lang);

    try {
      // Виправлено: Використовуємо choose_time_slot для цього повідомлення
      await ctx.editMessageText(
        `${getTranslation("data_saved", lang, {
          first_name: user.first_name || "клієнт",
        })} ` +
          // Використовуємо choose_time_slot, оскільки наступний крок - вибір дати/часу
          `${getTranslation("choose_time_slot", lang, { date: "" })
            .replace(" на ", "")
            .replace(":", "")}\n` + // Прибираємо "на {date}:" для цього конкретного випадку
          `Ви обрали послугу: **${serviceNameForDisplay}**. Тепер оберіть дату.`,
        { parse_mode: "Markdown", reply_markup: { inline_keyboard: [] } }
      );
    } catch (error) {
      console.error(
        "Error editing message text in handleServiceSelection:",
        error
      );
      // Відправляємо нове повідомлення, якщо не вдалося відредагувати
      await ctx.reply(
        `${getTranslation("data_saved", lang, {
          first_name: user.first_name || "клієнт",
        })} ` +
          `${getTranslation("choose_time_slot", lang, { date: "" })
            .replace(" на ", "")
            .replace(":", "")}\n` +
          `Ви обрали послугу: **${serviceNameForDisplay}**. Тепер оберіть дату.`,
        { parse_mode: "Markdown" }
      );
    }

    await showCalendar(ctx);
    return;
  }

  await ctx.reply(getTranslation("error_try_again", lang));
};

module.exports = {
  showServiceMenu,
  handleServiceSelection,
};
