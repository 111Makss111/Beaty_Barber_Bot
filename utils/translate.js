const translations = {
  uk: {
    write_name_surname:
      "Будь ласка, напишіть ваше ім'я та прізвище через пробіл.",
    name_surname_error: "Будь ласка, введіть ім'я та прізвище через пробіл.",
    ask_phone: "Будь ласка, надайте ваш номер телефону:",
    skip_phone: "Пропустити",
    thank_you_phone: "Дякую за номер телефону!",
    no_phone: "Ви пропустили надання номера телефону.",
    phone_invalid:
      "Будь ласка, введіть коректний номер телефону (від 7 до 15 цифр).",
    ask_phone:
      "📞 Будь ласка, надайте номер телефону.\nВи можете скористатися кнопками нижче або просто надіслати свій номер у чат (9 цифр, без +48).",
    phone_from_telegram: "📱 Надати з Telegram",
    skip_phone: "⏭ Пропустити",
    thank_you_phone: "✅ Дякуємо за номер телефону!",
    no_phone: "⚠️ Ви не надали номер телефону.",
    main_menu_text: "⬇️ Головне меню. Оберіть дію:",
  },
  pl: {
    write_name_surname:
      "Proszę podaj swoje imię i nazwisko, rozdzielone spacją.",
    name_surname_error: "Proszę podaj imię i nazwisko, rozdzielone spacją.",
    ask_phone: "Proszę podaj swój numer telefonu:",
    skip_phone: "Pomiń",
    thank_you_phone: "Dziękujemy za numer telefonu!",
    no_phone: "Pominąłeś podanie numeru telefonu.",
    phone_invalid: "Proszę podać poprawny numer telefonu (7-15 cyfr).",

    ask_phone:
      "📞 Prosimy o podanie numeru telefonu.\nMożesz skorzystać z przycisków poniżej lub po prostu wpisać numer w czacie (9 cyfr, bez +48).",
    phone_from_telegram: "📱 Podaj z Telegram",
    skip_phone: "⏭ Pomiń",
    thank_you_phone: "✅ Dziękujemy za numer telefonu!",
    no_phone: "⚠️ Nie podałeś numeru telefonu.",
    main_menu_text: "⬇️ Menu główne. Wybierz opcję:",
  },
};

function getTranslation(lang, key) {
  return translations[lang] && translations[lang][key]
    ? translations[lang][key]
    : key;
}

module.exports = { getTranslation };
