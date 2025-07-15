const fs = require("fs");
const path = require("path");
const { Markup } = require("telegraf");
const { getTranslation } = require("../utils/translate");

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

module.exports = async (ctx) => {
  const text = ctx.message.text;
  const userId = String(ctx.from.id);

  const users = readUsers();
  const user = users[userId] || {};

  if (text === "🇺🇦 Українська" || text === "🇵🇱 Польська") {
    user.language = text === "🇺🇦 Українська" ? "uk" : "pl";
    user.first_name = null;
    user.last_name = null;
    user.phone = null;

    users[userId] = user;
    saveUsers(users);

    await ctx.reply(
      getTranslation(user.language, "write_name_surname"),
      Markup.removeKeyboard()
    );
    return;
  }

  if (user.language && (!user.first_name || !user.last_name)) {
    const parts = text.trim().split(" ");
    if (parts.length < 2) {
      return ctx.reply(getTranslation(user.language, "name_surname_error"));
    }

    user.first_name = parts[0];
    user.last_name = parts.slice(1).join(" ");
    users[userId] = user;
    saveUsers(users);

    // Після збереження імені/прізвища не відповідаємо, щоб bot міг запитати телефон
    return;
  }
};
