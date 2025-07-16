const translations = {
  // Загальні фрази
  welcome_message_ua:
    "✨ Вітаємо! Я твій помічник для запису на б’юті-послуги. Обери зручну мову:",
  welcome_message_pl:
    "✨ Witaj! Jestem Twoim asystentem do umawiania wizyt na usługi beauty. Wybierz dogodny język:",
  image_load_error_ua:
    "❌ На жаль, не вдалося завантажити зображення. Будь ласка, спробуйте пізніше або зверніться до підтримки.",
  image_load_error_pl:
    "❌ Niestety, nie udało się załadować obrazu. Spróbuj ponownie później lub skontaktuj się z pomocą techniczną.",
  error_try_again_ua: "⚠️ Сталася помилка, спробуйте почати знову (/start).",
  error_try_again_pl: "⚠️ Wystąpił błąd, spróbuj zacząć od nowa (/start).",

  // Адмін-повідомлення
  admin_welcome_ua: "👩‍💻 Ви увійшли як адміністратор. Ось ваше головне меню.",
  admin_welcome_pl:
    "👩‍💻 Zalogowałeś się jako administrator. Oto Twoje główne menu.",

  // Клієнт-повідомлення
  request_name_ua:
    "📝 Дякуємо! Будь ласка, введіть ваше Ім'я та Прізвище (наприклад: Іван Петренко):",
  request_name_pl:
    "📝 Dziękuję! Proszę podaj swoje Imię i Nazwisko (np. Jan Kowalski):",
  data_saved_ua:
    "✅ Дякую, {first_name}! Ваші дані збережено. Тепер ви можете скористатися функціями бота.",
  data_saved_pl:
    "✅ Dziękuję, {first_name}! Twoje dane zostały zapisane. Teraz możesz korzystać z funkcji bota.",

  // Меню адміністратора (з емоджі для кнопок)
  admin_menu_view_records_ua: "🗓️ Переглянути всі записи",
  admin_menu_view_records_pl: "🗓️ Zobacz wszystkie rezerwacje",
  admin_menu_block_date_ua: "🚫 Заблокувати дату",
  admin_menu_block_date_pl: "🚫 Zablokuj datę",
  admin_menu_block_hours_ua: "⏰ Заблокувати години",
  admin_menu_block_hours_pl: "⏰ Zablokuj godziny",
  admin_menu_add_portfolio_ua: "📸 Додати до портфоліо",
  admin_menu_add_portfolio_pl: "📸 Dodaj do portfolio",
  admin_menu_block_client_ua: "🚫 Клієнт",
  admin_menu_block_client_pl: "🚫 Klient",
  request_name_ua:
    "📝 Дякуємо! Будь ласка, введіть ваше Ім'я та Прізвище (наприклад: Іван Петренко):",
  request_name_pl:
    "📝 Dziękuję! Proszę podaj swoje Imię i Nazwisko (np. Jan Kowalski):",
  request_phone_ua:
    "📞 Впишіть свій номер телефону (без +38) або скористайтесь кнопками знизу:", // Змінив на +38 для України
  request_phone_pl:
    "📞 Wprowadź swój numer telefonu (bez +48) lub skorzystaj z przycisków poniżej:",
  phone_button_telegram_ua: "📲 Мій номер з Telegram",
  phone_button_telegram_pl: "📲 Mój numer z Telegrama",
  phone_button_skip_ua: "➡️ Пропустити",
  phone_button_skip_pl: "➡️ Pomiń",
  data_saved_ua: "✅ Дякую, {first_name}! Ваші дані збережено.",
  data_saved_pl: "✅ Dziękuję, {first_name}! Twoje dane zostały zapisane.",
  info_saved_thank_you_ua: "🎉 Дякуємо за надану інформацію!",
  info_saved_thank_you_pl: "🎉 Dziękuję za podane informacje!",

  // Меню клієнта
  client_menu_appointment_ua: "✍️ Запис",
  client_menu_appointment_pl: "✍️ Rezerwacja",
  client_menu_cancel_ua: "❌ Скасувати запис",
  client_menu_cancel_pl: "❌ Anuluj rezerwację",
  client_menu_profile_ua: "👤 Мій профіль",
  client_menu_profile_pl: "👤 Mój profil",
  client_menu_portfolio_ua: "🖼️ Портфоліо",
  client_menu_portfolio_pl: "🖼️ Portfolio",
  choose_action_ua: "✨ Оберіть дію:",
  choose_action_pl: "✨ Wybierz działanie:",
};

const getTranslation = (key, lang, placeholders = {}) => {
  const fullKey = `${key}_${lang}`;
  let text =
    translations[fullKey] || `[Translation missing for ${key} in ${lang}]`;

  for (const placeholder in placeholders) {
    text = text.replace(`{${placeholder}}`, placeholders[placeholder]);
  }

  return text;
};

module.exports = {
  getTranslation,
};
