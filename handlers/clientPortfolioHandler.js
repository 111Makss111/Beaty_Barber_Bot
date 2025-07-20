// handlers/clientPortfolioHandler.js

const { Markup } = require("telegraf");
const { getTranslation } = require("../data/translations");
const { getPortfolioPhotos, findUser } = require("../data/data");
const { getClientMainMenuKeyboard } = require("../keyboard/mainMenu"); // Для повернення в головне меню

// Зберігаємо стан для кожного користувача: поточний індекс фото, яке переглядається
const clientPortfolioStates = {};

/**
 * Відображає портфоліо адміністратора для клієнтів.
 * @param {object} ctx - Об'єкт контексту Telegraf.
 */
const showClientPortfolio = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const lang = user ? user.lang : "ua"; // Використовуємо мову користувача

  const photos = getPortfolioPhotos();
  clientPortfolioStates[userId] = clientPortfolioStates[userId] || {
    currentIndex: 0,
  };
  let currentPhotoIndex = clientPortfolioStates[userId].currentIndex;

  // Якщо фотографій немає в портфоліо
  if (photos.length === 0) {
    await ctx.reply(
      getTranslation("client_portfolio_no_photos", lang),
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            getTranslation("client_portfolio_back_button", lang),
            "back_to_main_menu_from_client_portfolio"
          ),
        ],
      ])
    );
    return;
  }

  // Перевірка, щоб currentIndex був у межах масиву
  if (currentPhotoIndex >= photos.length) {
    currentPhotoIndex = 0;
    clientPortfolioStates[userId].currentIndex = 0;
  }
  if (currentPhotoIndex < 0) {
    currentPhotoIndex = photos.length - 1;
    clientPortfolioStates[userId].currentIndex = photos.length - 1;
  }

  const currentPhoto = photos[currentPhotoIndex];
  const caption = getTranslation("client_portfolio_photo_caption", lang, {
    current: currentPhotoIndex + 1,
    total: photos.length,
  });

  const navigationButtons = [];
  if (photos.length > 1) {
    navigationButtons.push(
      Markup.button.callback("◀️", "client_portfolio_prev")
    );
  }
  // Кнопка-лічильник, що не робить нічого при натисканні
  navigationButtons.push(
    Markup.button.callback(
      `📷 ${currentPhotoIndex + 1}/${photos.length} 📷`,
      "ignore_client_portfolio_count"
    )
  );
  if (photos.length > 1) {
    navigationButtons.push(
      Markup.button.callback("▶️", "client_portfolio_next")
    );
  }

  const backButton = [
    Markup.button.callback(
      getTranslation("client_portfolio_back_button", lang),
      "back_to_main_menu_from_client_portfolio"
    ),
  ];

  // Збираємо всі кнопки в один масив для Markup.inlineKeyboard
  const allButtons = [navigationButtons, backButton];

  try {
    await ctx.replyWithPhoto(currentPhoto.fileId, {
      caption: caption,
      reply_markup: Markup.inlineKeyboard(allButtons).reply_markup,
    });
  } catch (error) {
    console.error("Помилка при відправці фото клієнтського портфоліо:", error);
    await ctx.reply(
      getTranslation("image_load_error", lang) ||
        "Помилка завантаження зображення.", //Fallback
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            getTranslation("client_portfolio_back_button", lang),
            "back_to_main_menu_from_client_portfolio"
          ),
        ],
      ])
    );
  }
};

/**
 * Обробляє колбек-запити, пов'язані з клієнтським портфоліо (навігація, повернення).
 * @param {object} ctx - Об'єкт контексту Telegraf.
 */
const handleClientPortfolioCallback = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const callbackData = ctx.callbackQuery.data;

  await ctx.answerCbQuery(); // Обов'язково відповідаємо на callbackQuery

  const lang = user ? user.lang : "ua";
  const photos = getPortfolioPhotos();
  clientPortfolioStates[userId] = clientPortfolioStates[userId] || {
    currentIndex: 0,
  };
  let currentPhotoIndex = clientPortfolioStates[userId].currentIndex;

  switch (callbackData) {
    case "client_portfolio_next":
      if (photos.length > 0) {
        clientPortfolioStates[userId].currentIndex =
          (currentPhotoIndex + 1) % photos.length;
      }
      // Оновлюємо повідомлення замість видалення та надсилання нового
      if (ctx.callbackQuery.message && ctx.callbackQuery.message.message_id) {
        const updatedPhotoIndex = clientPortfolioStates[userId].currentIndex;
        const updatedPhoto = photos[updatedPhotoIndex];
        const updatedCaption = getTranslation(
          "client_portfolio_photo_caption",
          lang,
          {
            current: updatedPhotoIndex + 1,
            total: photos.length,
          }
        );

        const navigationButtons = [];
        if (photos.length > 1) {
          navigationButtons.push(
            Markup.button.callback("◀️", "client_portfolio_prev")
          );
        }
        navigationButtons.push(
          Markup.button.callback(
            `📷 ${updatedPhotoIndex + 1}/${photos.length} 📷`,
            "ignore_client_portfolio_count"
          )
        );
        if (photos.length > 1) {
          navigationButtons.push(
            Markup.button.callback("▶️", "client_portfolio_next")
          );
        }

        const backButton = [
          Markup.button.callback(
            getTranslation("client_portfolio_back_button", lang),
            "back_to_main_menu_from_client_portfolio"
          ),
        ];
        const allButtons = [navigationButtons, backButton];

        try {
          await ctx.editMessageMedia(
            {
              type: "photo",
              media: updatedPhoto.fileId,
              caption: updatedCaption,
            },
            { reply_markup: Markup.inlineKeyboard(allButtons).reply_markup }
          );
        } catch (e) {
          console.error(
            "Помилка при оновленні медіа-повідомлення для клієнта:",
            e.message
          );
          // Якщо не вдалося оновити, спробуємо надіслати нове
          await ctx.deleteMessage(); // Видаляємо попереднє, бо оновлення не вдалось
          await showClientPortfolio(ctx);
        }
      } else {
        await ctx.deleteMessage(); // Якщо немає message_id, просто видаляємо
        await showClientPortfolio(ctx);
      }
      break;

    case "client_portfolio_prev":
      if (photos.length > 0) {
        clientPortfolioStates[userId].currentIndex =
          (currentPhotoIndex - 1 + photos.length) % photos.length;
      }
      // Оновлюємо повідомлення замість видалення та надсилання нового
      if (ctx.callbackQuery.message && ctx.callbackQuery.message.message_id) {
        const updatedPhotoIndex = clientPortfolioStates[userId].currentIndex;
        const updatedPhoto = photos[updatedPhotoIndex];
        const updatedCaption = getTranslation(
          "client_portfolio_photo_caption",
          lang,
          {
            current: updatedPhotoIndex + 1,
            total: photos.length,
          }
        );

        const navigationButtons = [];
        if (photos.length > 1) {
          navigationButtons.push(
            Markup.button.callback("◀️", "client_portfolio_prev")
          );
        }
        navigationButtons.push(
          Markup.button.callback(
            `📷 ${updatedPhotoIndex + 1}/${photos.length} 📷`,
            "ignore_client_portfolio_count"
          )
        );
        if (photos.length > 1) {
          navigationButtons.push(
            Markup.button.callback("▶️", "client_portfolio_next")
          );
        }

        const backButton = [
          Markup.button.callback(
            getTranslation("client_portfolio_back_button", lang),
            "back_to_main_menu_from_client_portfolio"
          ),
        ];
        const allButtons = [navigationButtons, backButton];

        try {
          await ctx.editMessageMedia(
            {
              type: "photo",
              media: updatedPhoto.fileId,
              caption: updatedCaption,
            },
            { reply_markup: Markup.inlineKeyboard(allButtons).reply_markup }
          );
        } catch (e) {
          console.error(
            "Помилка при оновленні медіа-повідомлення для клієнта:",
            e.message
          );
          // Якщо не вдалося оновити, спробуємо надіслати нове
          await ctx.deleteMessage(); // Видаляємо попереднє, бо оновлення не вдалось
          await showClientPortfolio(ctx);
        }
      } else {
        await ctx.deleteMessage(); // Якщо немає message_id, просто видаляємо
        await showClientPortfolio(ctx);
      }
      break;

    case "back_to_main_menu_from_client_portfolio":
      if (ctx.callbackQuery.message && ctx.callbackQuery.message.message_id) {
        try {
          await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        } catch (e) {
          console.warn(
            "Не вдалося видалити повідомлення при поверненні з клієнтського портфоліо:",
            e.message
          );
        }
      }
      // Повернення до головного меню клієнта
      await ctx.reply(
        getTranslation("welcome_back", lang), // Можна використати інший текст при поверненні.
        // Примітка: getTranslation("welcome_back", lang) має бути визначено у translations.js
        getClientMainMenuKeyboard(lang)
      );
      delete clientPortfolioStates[userId]; // Очищаємо стан портфоліо для цього клієнта
      break;

    case "ignore_client_portfolio_count":
      // Нічого не робимо, це кнопка-лічильник
      break;
  }
};

module.exports = {
  showClientPortfolio,
  handleClientPortfolioCallback,
};
