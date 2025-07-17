const { Markup } = require("telegraf");
const { getTranslation } = require("../../data/translations");
const { getAdminMenuKeyboard } = require("../keyboard/adminMenu");
const {
  findUser,
  getPortfolioPhotos,
  addPortfolioPhoto,
  deletePortfolioPhoto,
} = require("../../data/data");
const { userStates } = require("../../handlers/userPhone"); // Важливо: переконатись, що userStates імпортується звідти, де він визначений

// Зберігаємо стан для кожного адміна: поточний індекс фото, яке переглядається
const adminPortfolioStates = {};

// Функція для відображення меню портфоліо
const showPortfolioMenu = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);

  if (!user || !user.is_admin) {
    await ctx.reply(getTranslation("access_denied", "ua"));
    return;
  }

  const lang = user.lang;
  const photos = getPortfolioPhotos();
  adminPortfolioStates[userId] = adminPortfolioStates[userId] || {
    currentIndex: 0,
  };
  let currentPhotoIndex = adminPortfolioStates[userId].currentIndex;

  if (photos.length === 0) {
    // Якщо фотографій немає, показуємо тільки кнопку "Додати фото" та "Назад"
    await ctx.reply(
      getTranslation("admin_portfolio_no_photos", lang),
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            getTranslation("admin_portfolio_add_photo_button", lang),
            "admin_portfolio_add"
          ),
        ],
        [
          Markup.button.callback(
            getTranslation("button_back_to_admin_menu", lang),
            "back_to_admin_menu_from_portfolio"
          ),
        ],
      ]) // Тут не потрібно .reply_markup, бо ctx.reply() сам це зрозуміє
    );
    return;
  }

  // Перевірка, щоб currentIndex був у межах масиву
  if (currentPhotoIndex >= photos.length) {
    currentPhotoIndex = 0;
    adminPortfolioStates[userId].currentIndex = 0;
  }
  if (currentPhotoIndex < 0) {
    currentPhotoIndex = photos.length - 1;
    adminPortfolioStates[userId].currentIndex = photos.length - 1;
  }

  const currentPhoto = photos[currentPhotoIndex];
  const caption = getTranslation("admin_portfolio_photo_caption", lang, {
    current: currentPhotoIndex + 1,
    total: photos.length,
  });

  const navigationButtons = [];
  if (photos.length > 1) {
    navigationButtons.push(
      Markup.button.callback("◀️", "admin_portfolio_prev")
    );
  }
  navigationButtons.push(
    Markup.button.callback(
      `📷 ${currentPhotoIndex + 1}/${photos.length} 📷`,
      "ignore_portfolio_count"
    )
  );
  if (photos.length > 1) {
    navigationButtons.push(
      Markup.button.callback("▶️", "admin_portfolio_next")
    );
  }

  const actionButtons = [
    Markup.button.callback(
      getTranslation("admin_portfolio_add_photo_button", lang),
      "admin_portfolio_add"
    ),
    Markup.button.callback(
      getTranslation("admin_portfolio_delete_photo_button", lang),
      `admin_portfolio_delete_${currentPhotoIndex}`
    ),
  ];

  const backButton = [
    Markup.button.callback(
      getTranslation("button_back_to_admin_menu", lang),
      "back_to_admin_menu_from_portfolio"
    ),
  ];

  // Збираємо всі кнопки в один масив для Markup.inlineKeyboard
  const allButtons = [navigationButtons, actionButtons, backButton];

  try {
    await ctx.replyWithPhoto(currentPhoto.fileId, {
      caption: caption,
      reply_markup: Markup.inlineKeyboard(allButtons).reply_markup, // Тут .reply_markup потрібен
    });
  } catch (error) {
    console.error("Помилка при відправці фото портфоліо:", error);
    await ctx.reply(
      getTranslation("image_load_error", lang) ||
        "Помилка завантаження зображення.",
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            getTranslation("admin_portfolio_add_photo_button", lang),
            "admin_portfolio_add"
          ),
        ],
        [
          Markup.button.callback(
            getTranslation("button_back_to_admin_menu", lang),
            "back_to_admin_menu_from_portfolio"
          ),
        ],
      ])
    );
  }
};

// Обробка колбек-запитів для портфоліо
const handlePortfolioCallback = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);
  const callbackData = ctx.callbackQuery.data;

  await ctx.answerCbQuery(); // Обов'язково відповідаємо на callbackQuery

  if (!user || !user.is_admin) {
    await ctx.reply(getTranslation("access_denied", "ua"));
    return;
  }

  const lang = user.lang;
  const photos = getPortfolioPhotos();
  adminPortfolioStates[userId] = adminPortfolioStates[userId] || {
    currentIndex: 0,
  };
  let currentPhotoIndex = adminPortfolioStates[userId].currentIndex;

  switch (callbackData) {
    case "admin_portfolio_add":
      // Видаляємо попереднє повідомлення, щоб уникнути конфлікту клавіатур
      if (ctx.callbackQuery.message && ctx.callbackQuery.message.message_id) {
        try {
          await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        } catch (e) {
          console.warn("Не вдалося видалити повідомлення:", e.message);
        }
      }
      await ctx.reply(
        getTranslation("admin_portfolio_send_photo_instruction", lang),
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              getTranslation("button_back_to_admin_menu", lang),
              "back_to_admin_menu_from_portfolio"
            ),
          ],
        ])
      );
      userStates[userId] = { state: "admin_waiting_for_portfolio_photo" };
      break;

    case "admin_portfolio_next":
      if (photos.length > 0) {
        adminPortfolioStates[userId].currentIndex =
          (currentPhotoIndex + 1) % photos.length;
      }
      // Оновлюємо повідомлення замість видалення та надсилання нового
      if (ctx.callbackQuery.message && ctx.callbackQuery.message.message_id) {
        const updatedPhotoIndex = adminPortfolioStates[userId].currentIndex;
        const updatedPhoto = photos[updatedPhotoIndex];
        const updatedCaption = getTranslation(
          "admin_portfolio_photo_caption",
          lang,
          {
            current: updatedPhotoIndex + 1,
            total: photos.length,
          }
        );

        const navigationButtons = [];
        if (photos.length > 1) {
          navigationButtons.push(
            Markup.button.callback("◀️", "admin_portfolio_prev")
          );
        }
        navigationButtons.push(
          Markup.button.callback(
            `📷 ${updatedPhotoIndex + 1}/${photos.length} 📷`,
            "ignore_portfolio_count"
          )
        );
        if (photos.length > 1) {
          navigationButtons.push(
            Markup.button.callback("▶️", "admin_portfolio_next")
          );
        }

        const actionButtons = [
          Markup.button.callback(
            getTranslation("admin_portfolio_add_photo_button", lang),
            "admin_portfolio_add"
          ),
          Markup.button.callback(
            getTranslation("admin_portfolio_delete_photo_button", lang),
            `admin_portfolio_delete_${updatedPhotoIndex}`
          ),
        ];

        const backButton = [
          Markup.button.callback(
            getTranslation("button_back_to_admin_menu", lang),
            "back_to_admin_menu_from_portfolio"
          ),
        ];

        const allButtons = [navigationButtons, actionButtons, backButton];

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
          console.error("Помилка при оновленні медіа-повідомлення:", e.message);
          // Якщо не вдалося оновити, спробуємо надіслати нове
          await ctx.deleteMessage();
          await showPortfolioMenu(ctx);
        }
      } else {
        await ctx.deleteMessage(); // Якщо немає message_id, просто видаляємо
        await showPortfolioMenu(ctx);
      }
      break;

    case "admin_portfolio_prev":
      if (photos.length > 0) {
        adminPortfolioStates[userId].currentIndex =
          (currentPhotoIndex - 1 + photos.length) % photos.length;
      }
      // Оновлюємо повідомлення замість видалення та надсилання нового
      if (ctx.callbackQuery.message && ctx.callbackQuery.message.message_id) {
        const updatedPhotoIndex = adminPortfolioStates[userId].currentIndex;
        const updatedPhoto = photos[updatedPhotoIndex];
        const updatedCaption = getTranslation(
          "admin_portfolio_photo_caption",
          lang,
          {
            current: updatedPhotoIndex + 1,
            total: photos.length,
          }
        );

        const navigationButtons = [];
        if (photos.length > 1) {
          navigationButtons.push(
            Markup.button.callback("◀️", "admin_portfolio_prev")
          );
        }
        navigationButtons.push(
          Markup.button.callback(
            `📷 ${updatedPhotoIndex + 1}/${photos.length} 📷`,
            "ignore_portfolio_count"
          )
        );
        if (photos.length > 1) {
          navigationButtons.push(
            Markup.button.callback("▶️", "admin_portfolio_next")
          );
        }

        const actionButtons = [
          Markup.button.callback(
            getTranslation("admin_portfolio_add_photo_button", lang),
            "admin_portfolio_add"
          ),
          Markup.button.callback(
            getTranslation("admin_portfolio_delete_photo_button", lang),
            `admin_portfolio_delete_${updatedPhotoIndex}`
          ),
        ];

        const backButton = [
          Markup.button.callback(
            getTranslation("button_back_to_admin_menu", lang),
            "back_to_admin_menu_from_portfolio"
          ),
        ];

        const allButtons = [navigationButtons, actionButtons, backButton];

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
          console.error("Помилка при оновленні медіа-повідомлення:", e.message);
          // Якщо не вдалося оновити, спробуємо надіслати нове
          await ctx.deleteMessage();
          await showPortfolioMenu(ctx);
        }
      } else {
        await ctx.deleteMessage(); // Якщо немає message_id, просто видаляємо
        await showPortfolioMenu(ctx);
      }
      break;

    case "back_to_admin_menu_from_portfolio":
      if (ctx.callbackQuery.message && ctx.callbackQuery.message.message_id) {
        try {
          await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        } catch (e) {
          console.warn(
            "Не вдалося видалити повідомлення при поверненні:",
            e.message
          );
        }
      }
      await ctx.reply(
        getTranslation("admin_welcome", lang),
        getAdminMenuKeyboard(lang)
      );
      delete adminPortfolioStates[userId];
      delete userStates[userId];
      break;

    case "ignore_portfolio_count":
      break;

    default:
      if (callbackData.startsWith("admin_portfolio_delete_")) {
        const indexToDelete = parseInt(callbackData.split("_")[3], 10);
        if (
          !isNaN(indexToDelete) &&
          indexToDelete >= 0 &&
          indexToDelete < photos.length
        ) {
          deletePortfolioPhoto(indexToDelete);

          // Якщо видаляємо останнє фото, повертаємось до меню без фото
          if (getPortfolioPhotos().length === 0) {
            if (
              ctx.callbackQuery.message &&
              ctx.callbackQuery.message.message_id
            ) {
              try {
                await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
              } catch (e) {
                console.warn(
                  "Не вдалося видалити повідомлення після видалення останнього фото:",
                  e.message
                );
              }
            }
            await ctx.reply(
              getTranslation("admin_portfolio_photo_deleted", lang)
            );
            await showPortfolioMenu(ctx); // Показуємо меню без фото
          } else {
            // Оновлюємо індекс, якщо видалене фото було поточним або раніше нього
            if (
              adminPortfolioStates[userId].currentIndex >=
              getPortfolioPhotos().length
            ) {
              adminPortfolioStates[userId].currentIndex = Math.max(
                0,
                getPortfolioPhotos().length - 1
              );
            }
            await ctx.reply(
              getTranslation("admin_portfolio_photo_deleted", lang)
            );
            // Оновлюємо повідомлення, щоб показати наступне фото
            if (
              ctx.callbackQuery.message &&
              ctx.callbackQuery.message.message_id
            ) {
              try {
                await ctx.deleteMessage(ctx.callbackQuery.message.message_id); // Видаляємо попереднє, щоб не було двох
              } catch (e) {
                console.warn(
                  "Не вдалося видалити попереднє повідомлення після видалення фото:",
                  e.message
                );
              }
            }
            await showPortfolioMenu(ctx);
          }
        } else {
          await ctx.reply(getTranslation("error_try_again", lang));
        }
      }
      break;
  }
};

// Обробка отриманого фото для портфоліо
const handlePortfolioPhoto = async (ctx) => {
  const userId = ctx.from.id;
  const user = findUser(userId);

  if (!user || !user.is_admin) {
    await ctx.reply(getTranslation("access_denied", "ua"));
    return;
  }

  const lang = user.lang;
  const photo = ctx.message.photo;

  if (photo && photo.length > 0) {
    const fileId = photo[photo.length - 1].file_id; // Беремо найбільшу якість фото
    addPortfolioPhoto(fileId);

    // Перевіряємо, чи є message_id, щоб видалити інструкцію "надішліть фото"
    if (ctx.message && ctx.message.message_id) {
      try {
        // Можливо, потрібно видалити повідомлення-інструкцію, яке було відправлене
        // Але це залежить від того, яке повідомлення ти хочеш видалити
        // Краще просто відповісти і потім оновити меню портфоліо
        await ctx.deleteMessage(ctx.message.message_id); // Видаляємо отримане фото від користувача
      } catch (e) {
        console.warn("Не вдалося видалити отримане фото:", e.message);
      }
    }
    await ctx.reply(getTranslation("admin_portfolio_photo_added", lang));
    delete userStates[userId];
    await showPortfolioMenu(ctx); // Показуємо оновлене портфоліо
  } else {
    await ctx.reply(getTranslation("admin_portfolio_no_photo_received", lang));
  }
};

module.exports = {
  showPortfolioMenu,
  handlePortfolioCallback,
  handlePortfolioPhoto,
};
