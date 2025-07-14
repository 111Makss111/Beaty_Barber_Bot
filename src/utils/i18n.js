const messages = require("./messages");

const getUserLanguage = (ctx) => {
  return ctx.session?.language || "uk"; // За замовчуванням українська, якщо мова не встановлена
};

const setUserLanguage = (ctx, lang) => {
  ctx.session.language = lang;
};

const getMessage = (ctx, key, ...args) => {
  const lang = getUserLanguage(ctx);
  const message = messages[lang] && messages[lang][key];
  if (typeof message === "function") {
    return message(...args);
  }
  return message || `Missing message for key: ${key} in ${lang}`;
};

module.exports = {
  getMessage,
  getUserLanguage,
  setUserLanguage, // Експортуємо функцію для встановлення мови
};
