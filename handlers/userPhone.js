const fs = require("fs");
const path = require("path");
const { Markup } = require("telegraf");
const { getTranslation } = require("../utils/translate");
const { getMainMenuKeyboard } = require("../keyboards/mainMenu");

const usersFilePath = path.resolve(__dirname, "../data/users.json");

function readUsers() {
  if (!fs.existsSync(usersFilePath)) return {};
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

function isValidPhone(phone) {
  return /^(\+)?\d{7,15}$/.test(phone);
}

module.exports = async (ctx) => {
  const userId = String(ctx.from.id);
  const users = readUsers();
  const user = users[userId] || {};

  if (!user.language || !user.first_name || !user.last_name) return;

  const text = ctx.message?.text;
  const contact = ctx.message?.contact;

  // Якщо номер вже є — не питаємо повторно
  if (user.phone) return;

  // 1. Якщо користувач натиснув "Надати з Telegram" і надіслав контакт
  if (contact && contact.phone_number) {
    user.phone = contact.phone_number;
    users[userId] = user;
    saveUsers(users);

    await ctx.reply(getTranslation(user.language, "thank_you_phone"));
    await ctx.reply(
      getTranslation(user.language, "main_menu_text"),
      getMainMenuKeyboard(user.language)
    );
    return;
  }

  // 2. Якщо натиснув Пропустити
  if (text === "⏭ Пропустити" || text === "⏭ Pomiń") {
    user.phone = null;
    users[userId] = user;
    saveUsers(users);

    await ctx.reply(getTranslation(user.language, "no_phone"));
    await ctx.reply(
      getTranslation(user.language, "main_menu_text"),
      getMainMenuKeyboard(user.language)
    );
    return;
  }

  // 3. Якщо ввів номер вручну
  if (text && isValidPhone(text.trim())) {
    user.phone = text.trim();
    users[userId] = user;
    saveUsers(users);

    await ctx.reply(getTranslation(user.language, "thank_you_phone"));
    await ctx.reply(
      getTranslation(user.language, "main_menu_text"),
      getMainMenuKeyboard(user.language)
    );
    return;
  }

  // 4. Якщо нічого не ввів або перший раз — показуємо інлайн-кнопки
  await ctx.reply(
    getTranslation(user.language, "ask_phone"),
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          getTranslation(user.language, "phone_from_telegram"),
          "tg_phone"
        ),
      ],
      [
        Markup.button.callback(
          getTranslation(user.language, "skip_phone"),
          "skip_phone"
        ),
      ],
    ])
  );
};
