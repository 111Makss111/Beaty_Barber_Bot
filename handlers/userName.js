const { Markup } = require("telegraf");
const { findUser, saveUser } = require("../data/data");
const { getAdminMenuKeyboard } = require("../admin/keyboard/adminMenu");
const { getTranslation } = require("../data/translations");
const { requestPhoneNumber, userStates } = require("./userPhone");

const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(",").map((id) => parseInt(id.trim()))
  : [];

const processLanguageSelection = async (ctx, langCode) => {
  const userId = ctx.from.id;
  let user = findUser(userId);

  if (!user) {
    user = {
      id: userId,
      lang: langCode,
      is_admin: ADMIN_IDS.includes(userId),
      state: null,
    };
    saveUser(user);
  } else {
    user.lang = langCode;
    user.is_admin = ADMIN_IDS.includes(userId);
    saveUser(user);
  }

  if (user.is_admin) {
    await ctx.reply(
      getTranslation("admin_welcome", user.lang),
      getAdminMenuKeyboard(user.lang)
    );
  } else {
    userStates[userId] = { state: "waiting_for_name", lang: langCode };
    saveUser(user);

    await ctx.reply(
      getTranslation("request_name", user.lang),
      Markup.removeKeyboard()
    );
  }
};

const handleUserNameAndSurname = async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  const currentState = userStates[userId];

  if (currentState && currentState.state === "waiting_for_name") {
    let user = findUser(userId);
    if (!user) {
      delete userStates[userId];
      await ctx.reply(getTranslation("error_try_again", currentState.lang));
      return;
    }

    const [firstName, ...lastNameParts] = text.split(" ");
    const lastName = lastNameParts.join(" ");

    user.first_name = firstName || null;
    user.last_name = lastName || null;
    saveUser(user);

    await ctx.reply(
      getTranslation("data_saved", user.lang, { first_name: user.first_name })
    );
    await requestPhoneNumber(ctx, user.lang);
  }
};

module.exports = {
  processLanguageSelection,
  handleUserNameAndSurname,
};
