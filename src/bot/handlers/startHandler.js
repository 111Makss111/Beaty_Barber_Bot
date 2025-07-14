const {
  getMessage,
  setUserLanguage,
  getUserLanguage,
} = require("../../utils/i18n");
const {
  languageSelectionKeyboard,
  mainMenuKeyboard,
} = require("../../utils/keyboards");
const userService = require("../../services/userService");
const { ADMIN_ID } = require("../../utils/constants");

const startHandler = async (ctx) => {
  const userId = ctx.from.id;
  const existingUser = await userService.getUser(userId);

  if (!existingUser || !existingUser.language) {
    // Якщо користувача немає або немає мови, пропонуємо вибір мови
    await ctx.reply(
      getMessage(ctx, "selectLanguage"),
      languageSelectionKeyboard()
    );
  } else {
    // Якщо користувач вже є і мова встановлена
    ctx.session.language = existingUser.language; // Встановлюємо мову в сесію
    ctx.session.userState = "idle"; // Встановлюємо початковий стан

    const userName =
      existingUser.firstName || ctx.from.first_name || "Користувач";
    await ctx.reply(getMessage(ctx, "start", userName), mainMenuKeyboard(ctx));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  }
};

const setLanguageHandler = async (ctx) => {
  const lang = ctx.match[0].split("_")[2];
  const userId = ctx.from.id;
  let user = await userService.getUser(userId);

  if (!user) {
    user = await userService.createUser(
      userId,
      ctx.from.first_name,
      ctx.from.last_name || "",
      ""
    );
  }
  await userService.updateUserData(userId, { language: lang });
  setUserLanguage(ctx, lang);

  await ctx.answerCbQuery();
  await ctx.deleteMessage(); // Видалити повідомлення з вибором мови

  // Перевіряємо, чи потрібно запитувати ім'я/прізвище та телефон
  if (!user.firstName || !user.phone) {
    ctx.session.userState = "waiting_for_name";
    await ctx.reply(getMessage(ctx, "enterName")); // Додамо це повідомлення в messages.js
  } else {
    const userName = user.firstName || ctx.from.first_name || "Користувач";
    await ctx.reply(getMessage(ctx, "start", userName), mainMenuKeyboard(ctx));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  }
};

const handleUserInfoInput = async (ctx) => {
  const userId = ctx.from.id;
  let user = await userService.getUser(userId);

  if (ctx.session.userState === "waiting_for_name") {
    const [firstName, ...lastNameParts] = ctx.message.text.split(" ");
    const lastName = lastNameParts.join(" ");
    await userService.updateUserData(userId, { firstName, lastName });
    ctx.session.userState = "waiting_for_phone";
    await ctx.reply(
      getMessage(ctx, "enterPhone"),
      Markup.keyboard([
        [
          getMessage(ctx, "skipPhone"),
          Markup.button.contactRequest(getMessage(ctx, "sendMyContact")),
        ],
      ]).resize()
    ); // Додамо enterPhone та skipPhone в messages.js
  } else if (ctx.session.userState === "waiting_for_phone") {
    if (ctx.message.contact) {
      await userService.updateUserData(userId, {
        phone: ctx.message.contact.phone_number,
      });
    } else if (ctx.message.text === getMessage(ctx, "skipPhone")) {
      await userService.updateUserData(userId, { phone: "Пропущено" });
    } else {
      await userService.updateUserData(userId, { phone: ctx.message.text });
    }

    ctx.session.userState = "idle"; // Завершуємо стан
    const updatedUser = await userService.getUser(userId);
    const userName =
      updatedUser.firstName || ctx.from.first_name || "Користувач";
    await ctx.reply(getMessage(ctx, "start", userName), mainMenuKeyboard(ctx));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  }
};

const handleContactInput = async (ctx) => {
  const userId = ctx.from.id;
  if (ctx.session.userState === "waiting_for_phone" && ctx.message.contact) {
    await userService.updateUserData(userId, {
      phone: ctx.message.contact.phone_number,
    });
    ctx.session.userState = "idle"; // Завершуємо стан
    const updatedUser = await userService.getUser(userId);
    const userName =
      updatedUser.firstName || ctx.from.first_name || "Користувач";
    await ctx.reply(getMessage(ctx, "start", userName), mainMenuKeyboard(ctx));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  }
};

module.exports = {
  startHandler,
  setLanguageHandler,
  handleUserInfoInput,
  handleContactInput,
};
