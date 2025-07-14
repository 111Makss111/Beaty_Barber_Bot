const {
  getMessage,
  setUserLanguage,
  getUserLanguage,
} = require("../../utils/i18n");
const {
  languageSelectionReplyKeyboard,
  mainMenuKeyboard,
} = require("../../utils/keyboards"); // Імпортуємо нову клавіатуру
const userService = require("../../services/userService");
const { ADMIN_ID } = require("../../utils/constants");
const { Markup } = require("telegraf");

const startHandler = async (ctx) => {
  // Завжди пропонуємо вибір мови при /start за допомогою ReplyKeyboard
  await ctx.reply(
    getMessage(ctx, "selectLanguage"),
    languageSelectionReplyKeyboard()
  );
  ctx.session.userState = "awaiting_language_selection"; // Встановлюємо стан
};

// Ця функція тепер буде обробляти текстові повідомлення для вибору мови
const handleLanguageSelectionText = async (ctx) => {
  const messageText = ctx.message.text;
  let lang = "";

  if (messageText === "🇺🇦 Українська") {
    lang = "uk";
  } else if (messageText === "🇵🇱 Polski") {
    lang = "pl";
  } else {
    // Якщо введено щось інше, просимо обрати з кнопок
    await ctx.reply(
      getMessage(ctx, "pleaseSelectLanguageFromButtons"),
      languageSelectionReplyKeyboard()
    ); // Додамо це повідомлення в messages.js
    return; // Залишаємось у стані очікування вибору мови
  }

  const userId = ctx.from.id;
  let user = await userService.getUser(userId);

  if (!user) {
    user = await userService.createUser(
      userId,
      ctx.from.first_name || "",
      ctx.from.last_name || "",
      ""
    );
  }
  await userService.updateUserData(userId, { language: lang });
  setUserLanguage(ctx, lang);

  // Приховуємо клавіатуру вибору мови
  await ctx.reply(getMessage(ctx, "languageSet"), Markup.removeKeyboard());

  // Перевіряємо, чи потрібно запитувати ім'я/прізвище та телефон
  if (!user.firstName || !user.phone || user.phone === "Пропущено") {
    ctx.session.userState = "waiting_for_name";
    await ctx.reply(getMessage(ctx, "enterName"));
  } else {
    ctx.session.userState = "idle";
    const userName = user.firstName || ctx.from.first_name || "Користувач";
    await ctx.reply(getMessage(ctx, "start", userName), mainMenuKeyboard(ctx));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  }
};

const handleUserInfoInput = async (ctx) => {
  const userId = ctx.from.id;
  let user = await userService.getUser(userId);

  if (!user) {
    user = await userService.createUser(
      userId,
      ctx.from.first_name || "",
      ctx.from.last_name || "",
      ""
    );
  }

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
    );
  } else if (ctx.session.userState === "waiting_for_phone") {
    let phoneNumber = "";
    if (ctx.message.contact) {
      phoneNumber = ctx.message.contact.phone_number;
    } else if (ctx.message.text === getMessage(ctx, "skipPhone")) {
      phoneNumber = "Пропущено";
    } else {
      phoneNumber = ctx.message.text;
    }
    await userService.updateUserData(userId, { phone: phoneNumber });

    ctx.session.userState = "idle";
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
    ctx.session.userState = "idle";
    const updatedUser = await userService.getUser(userId);
    const userName =
      updatedUser.firstName || ctx.from.first_name || "Користувач";
    await ctx.reply(getMessage(ctx, "start", userName), mainMenuKeyboard(ctx));
    await ctx.reply(getMessage(ctx, "mainMenu"), mainMenuKeyboard(ctx));
  }
};

module.exports = {
  startHandler,
  handleLanguageSelectionText, // Експортуємо нову функцію
  handleUserInfoInput,
  handleContactInput,
};
