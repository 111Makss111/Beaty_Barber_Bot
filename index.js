require("dotenv").config();
const { Telegraf } = require("telegraf");
const startCommand = require("./handlers/start");
const { handleUserNameAndSurname } = require("./handlers/userName");
const { handlePhoneNumber, userStates } = require("./handlers/userPhone"); // Експортуємо userStates

const bot = new Telegraf(process.env.BOT_TOKEN);

startCommand(bot);

// УНІВЕРСАЛЬНИЙ ОБРОБНИК ТЕКСТОВИХ ПОВІДОМЛЕНЬ ТА КОНТАКТІВ
bot.on(["text", "contact"], async (ctx) => {
  const userId = ctx.from.id;
  const currentState = userStates[userId] ? userStates[userId].state : null;

  if (currentState === "waiting_for_name") {
    // Якщо чекаємо ім'я/прізвище
    await handleUserNameAndSurname(ctx);
  } else if (currentState === "waiting_for_phone") {
    // Якщо чекаємо номер телефону
    await handlePhoneNumber(ctx);
  }
  // Додаємо інші стани тут, якщо вони з'являться
});

bot.launch();
console.log("Бот запущено!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
