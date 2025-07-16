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

  // Загальні запити (для реєстрації)
  request_name_ua:
    "📝 Дякуємо! Будь ласка, введіть ваше Ім'я та Прізвище (наприклад: Іван Петренко):",
  request_name_pl:
    "📝 Dziękuję! Proszę podaj swoje Imię i Nazwisko (np. Jan Kowalski):",
  request_phone_ua:
    "📞 Впишіть свій номер телефону (без +38) або скористайтесь кнопками знизу:",
  request_phone_pl:
    "📞 Wprowadź swój numer telefonu (bez +48) lub skorzystaj z przycisków poniżej:",
  phone_button_telegram_ua: "📲 Мій номер з Telegram",
  phone_button_telegram_pl: "📲 Mój numer z Telegrama",
  phone_button_skip_ua: "➡️ Пропустити",
  phone_button_skip_pl: "➡️ Pomiń",
  data_saved_ua: "✅ Дякую, {first_name}! Ваші дані збережено.", // Виправив
  data_saved_pl: "✅ Dziękuję, {first_name}! Twoje dane zostały zapisane.", // Виправив
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

  // Послуги (Ключі для callback_data - без префікса "service_")
  manicure_ua: "💅 Манікюр",
  manicure_pl: "💅 Manicure",
  pedicure_ua: "👣 Педикюр",
  pedicure_pl: "👣 Pedicure",
  removal_ua: "✂️ Зняття",
  removal_pl: "✂️ Usunięcie",
  strengthening_ua: "💪 Укріплення",
  strengthening_pl: "💪 Wzmocnienie",
  button_back_to_menu_ua: "↩️ Повернутись до головного меню",
  button_back_to_menu_pl: "↩️ Powrót do menu głównego",

  // Календар
  month_names_ua: [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень",
  ],
  month_names_pl: [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ],
  weekday_short_ua: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
  weekday_short_pl: ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"],
  button_prev_month_ua: "◀️ Попередній місяць",
  button_prev_month_pl: "◀️ Poprzedni miesiąc",
  button_next_month_ua: "Наступний місяць ▶️",
  button_next_month_pl: "Następny miesiąc ▶️",
  button_back_to_services_ua: "↩️ Повернутись до послуг",
  button_back_to_services_pl: "↩️ Powrót do usług",
  choose_date_ua: "🗓️ Оберіть дату:",
  choose_date_pl: "🗓️ Wybierz datę:",
  choose_time_ua: "⏰ Оберіть зручний час:",
  choose_time_pl: "⏰ Wybierz dogodną godzinę:",
  button_back_to_calendar_ua: "↩️ Повернутись до календаря",
  button_back_to_calendar_pl: "↩️ Powrót do kalendarza",
};

const getTranslation = (key, lang, placeholders = {}) => {
  const fullKey = `${key}_${lang}`;
  let text;

  if (Array.isArray(translations[fullKey])) {
    text = translations[fullKey];
  } else {
    text =
      translations[fullKey] || `[Translation missing for ${key} in ${lang}]`;
  }

  for (const placeholder in placeholders) {
    if (typeof text === "string") {
      text = text.replace(`{${placeholder}}`, placeholders[placeholder]);
    }
  }

  return text;
};

module.exports = {
  getTranslation,
};
