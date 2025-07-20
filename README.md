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

if (callbackData.startsWith("service\_")) {
const serviceKey = callbackData;
user.current_service = serviceKey;
saveUser(user);

    const lang = user.lang || "ua";
    const serviceNameForDisplay = getTranslation(serviceKey, lang);

    // Підготовка повідомлень, використовуючи вже готові переклади.
    // Уникаємо ручних маніпуляцій з рядками, щоб уникнути помилок Markdown.
    const dataSavedMessage = getTranslation("data_saved", lang, {
      name: user.first_name || "клієнт", // Використовуємо 'name' з first_name
      surname: user.last_name || "", // Використовуємо 'surname'
    });
    const proceedToDateMessage = getTranslation(
      "service_selected_proceed_to_date",
      lang,
      {
        service_name: serviceNameForDisplay,
      }
    );

    try {
      // Комбінуємо повідомлення з новим рядком.
      // Важливо: тут не використовується "choose_time_slot_prompt",
      // оскільки його вміст вже включено в загальну логіку переходу до календаря.
      await ctx.editMessageText(
        `${dataSavedMessage}\n${proceedToDateMessage}`,
        { parse_mode: "Markdown" } // Прибираємо reply_markup, оскільки далі буде календар
      );
    } catch (error) {
      console.error(
        "Error editing message text in handleServiceSelection:",
        error
      );
      // Якщо редагування не вдалося, відправляємо нове повідомлення
      await ctx.reply(`${dataSavedMessage}\n${proceedToDateMessage}`, {
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
await ctx.editMessageText(
getTranslation("main_menu_welcome", user.lang),
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
