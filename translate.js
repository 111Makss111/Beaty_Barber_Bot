const translations = {
  ua: {
    welcome: "Привіт! Я твій новий бот.",
    choose_language: "Оберіть мову:",
    language_selected: "Ви обрали українську мову.",
    help_message: "Я можу відповідати на деякі команди.", // <-- Переконайся, що цей рядок є
    enter_name: "Будь ласка, вкажіть своє Ім'я та Прізвище:",
    name_saved: "Дякую, %s! Ваше ім'я збережено.",
    request_phone: "Будь ласка, вкажіть свій номер телефону:",
    share_phone_btn: "Надати номер з Telegram",
    skip_phone_btn: "Пропустити",
    phone_saved: "Дякую! Ваш номер телефону збережено: %s",
    phone_skipped: "Добре, ви пропустили введення номера телефону.",
    invalid_phone:
      "Будь ласка, введіть коректний номер телефону (9 цифр) або скористайтеся кнопками.",
    main_menu_welcome: "Вітаю в головному меню!",
    book_appointment_btn: "✍️ Записатись", // Додано емоджі
    my_cabinet_btn: "👤 Кабінет", // Додано емоджі
    portfolio_btn: "🖼️ Портфоліо",
    admin_menu_welcome: "Вітаю в адмін-меню!",
    view_all_records_btn: "📋 Переглянути всі записи",
    block_date_time_btn: "🚫 Заблокувати Дату/Години",
    block_client_btn: "🚫 Заблокувати клієнта",
    add_to_portfolio_btn: "➕ Додати до Портфоліо",
    back_to_main_menu_btn: "⬅️ Повернутись до головного меню",
    access_denied: "У вас немає доступу до цієї функції.",
    select_service: "Будь ласка, оберіть послугу:",
    manicure_service_btn: "💅 Манікюр",
    pedicure_service_btn: "👣 Педикюр",
    removal_service_btn: "✂️ Зняття", // Новий ключ для "Зняття"
    strengthening_service_btn: "💪 Укріплення", // Змінено назву для "Укріплення"
    service_selected: "Ви обрали послугу:",
    request_date: "Будь ласка, оберіть дату:",
    jan: "Січень",
    feb: "Лютий",
    mar: "Березень",
    apr: "Квітень",
    may: "Травень",
    jun: "Червень",
    jul: "Липень",
    aug: "Серпень",
    sep: "Вересень",
    oct: "Жовтень",
    nov: "Листопад",
    dec: "Грудень",
    mon_short: "Пн",
    tue_short: "Вт",
    wed_short: "Ср",
    thu_short: "Чт",
    fri_short: "Пт",
    sat_short: "Сб",
    sun_short: "Нд",
    back_to_services_btn: "⬅️ Повернутись до послуг",
    date_selected: "Ви обрали дату: %s.",
    invalid_past_date:
      "Ви не можете обрати минулу дату. Будь ласка, оберіть дату з майбутнього.",

    // Нові переклади для меню часу
    request_time: "Будь ласка, оберіть зручний час:",
    back_to_calendar_btn: "⬅️ Повернутись до календаря",
    time_selected: "Ви обрали час: %s.",
    invalid_past_time:
      "Ви не можете обрати минулий час. Будь ласка, оберіть час з майбутнього.",
    time_already_booked: "Цей час вже зайнятий. Будь ласка, оберіть інший.",

    // Переклади для підтвердження запису
    confirm_appointment:
      "Будь ласка, перевірте дані запису:\n\n" +
      "🔧 Послуга: %s\n" +
      "📆 Дата: %s\n" +
      "⏰ Час: %s\n\n" +
      "Все вірно?",
    confirm_btn: "✅ Підтвердити",
    cancel_btn: "❌ Скасувати",
    appointment_confirmed:
      "🎉 Ви успішно записані!\n\n" +
      "🔧 Послуга: %s\n" +
      "📆 Дата: %s\n" +
      "⏰ Час: %s",
    appointment_cancelled: "❌ Запис скасовано. Ви можете почати новий запис.",
    back_to_main_menu_final_btn: "⬅️ Головне меню",
    admin_new_appointment_header: "📋 Новий запис!",
    admin_client_name: "👨‍💼 Ім’я: %s",
    admin_client_phone: "📲 Телефон: %s",
    admin_service: "🔧 Обрана послуга: %s",
    admin_location: "📍 Локація: %s",
    admin_date: "📆 Заплановано: %s",
    admin_time: "⏰ Початок: %s",
    admin_delimiter: "━━━━━━━━━━━━━━━",
    profile_header: "📋 Ваш профіль",
    profile_no_appointments: "У вас немає активних записів.",
    profile_appointment_details:
      "━━━━━━━━━━━━━━━\n" + // Розділювач для записів
      "🔧 Послуга: %s\n" +
      "📆 Дата: %s\n" +
      "⏰ Час: %s",
    back_to_main_menu_profile_btn: "⬅️ Головне меню",
    cancel_appointment_main_menu_btn: "❌ Скасувати візит", // Нова кнопка в головному меню
    no_active_appointments_cancel:
      "У вас немає активних записів для скасування.",
    visit_cancelled_success: "✅ Ваш візит скасовано.",

    // Переклади для сповіщення адміна про скасування
    admin_cancelled_appointment_header: "❌ Візит скасовано!",
    admin_cancelled_service: "🔧 Послуга: %s",
    admin_cancelled_date: "📆 Дата: %s",
    admin_cancelled_time: "⏰ Час: %s",
    reminder_message_header: "🔔 Нагадування про ваш запис!",
    reminder_service: "🔧 Послуга: %s",
    reminder_date: "📆 Заплановано: %s",
    reminder_time: "⏰ Початок: %s",
    reminder_footer: "Чекаємо на вас!",
    select_records_filter: "Оберіть, які записи бажаєте переглянути:",
    filter_today_btn: "🗓️ На сьогодні",
    filter_tomorrow_btn: "➡️ На завтра",
    filter_this_week_btn: "📅 Цей тиждень",
    filter_this_month_btn: "📈 Цей місяць",
    filter_all_records_btn: "🗂️ Усі майбутні",
    filter_specific_date_btn: "🔎 Конкретна дата", // Можливо, додамо пізніше
    back_to_records_filters_btn: "⬅️ До фільтрів",
    back_to_admin_menu_btn: "⬅️ До адмін-меню", // Використовуємо тут для повернення з перегляду записів
    records_list_header: "📈 Активні записи:",
    no_records_found: "Записів за обраним критерієм не знайдено.",
    admin_menu_btn: "Адмін-меню", // Переконайтеся, що ця кнопка є в головному меню
    block_date_time_future_impl:
      "Функціонал Блокування дати/часу буде реалізовано.",
    add_to_portfolio_future_impl:
      "Функціонал Додавання до портфоліо буде реалізовано.",
    block_client_future_impl:
      "Функціонал Блокування клієнта буде реалізовано. Будь ласка, вкажіть ID користувача, якого потрібно заблокувати.", // Переклад для заглушки кнопки блокування
  },
  pl: {
    welcome: "Cześć! Jestem twoim nowym botem.",
    choose_language: "Wybierz język:",
    language_selected: "Wybrałeś język polski.",
    help_message: "Mogę odpowiadać na niektóre polecenia.", // <-- Переконайся, що цей рядок є
    enter_name: "Proszę podać swoje Imię i Nazwisko:",
    name_saved: "Dziękuję, %s! Twoje imię zostało zapisane.",
    request_phone: "Proszę podać swój numer telefonu:",
    share_phone_btn: "Udostępnij numer z Telegrama",
    skip_phone_btn: "Pomiń",
    phone_saved: "Dziękuję! Twój numer telefonu został zapisany: %s",
    phone_skipped: "Dobrze, pominąłeś podanie numeru telefonu.",
    invalid_phone:
      "Proszę podać prawidłowy numer telefonu (9 cyfr) lub użyć przycisków.",
    main_menu_welcome: "Witaj w menu głównym!",
    book_appointment_btn: "✍️ Umów wizytę", // Додано емоджі
    my_cabinet_btn: "👤 Gabinet", // Додано емоджі
    portfolio_btn: "🖼️ Portfolio",
    admin_menu_welcome: "Witaj w menu administratora!",
    view_all_records_btn: "📋 Zobacz wszystkie rezerwacje",
    block_date_time_btn: "🚫 Zablokuj Datę/Godzinę",
    block_client_btn: "🚫 Zablokuj klienta",
    add_to_portfolio_btn: "➕ Dodaj do Portfolio",
    back_to_main_menu_btn: "⬅️ Powrót do menu głównego",
    access_denied: "Nie masz dostępu do tej funkcji.",
    select_service: "Proszę wybrać usługę:",
    manicure_service_btn: "💅 Manicure",
    pedicure_service_btn: "👣 Pedicure",
    removal_service_btn: "✂️ Zdejmowanie", // Nowy klucz dla "Zdejmowanie"
    strengthening_service_btn: "💪 Wzmacnianie", // Zmieniono nazwę dla "Wzmacnianie"
    service_selected: "Wybrano usługę:",
    request_date: "Proszę wybrać datę:",
    jan: "Styczeń",
    feb: "Luty",
    mar: "Marzec",
    apr: "Kwiecień",
    may: "Maj",
    jun: "Czerwiec",
    jul: "Lipiec",
    aug: "Sierpień",
    sep: "Wrzesień",
    oct: "Październik",
    nov: "Listopad",
    dec: "Grudzień",
    mon_short: "Pn",
    tue_short: "Wt",
    wed_short: "Śr",
    thu_short: "Cz",
    fri_short: "Pt",
    sat_short: "Sb",
    sun_short: "Nd",
    back_to_services_btn: "⬅️ Wróć do usług",
    date_selected: "Wybrano datę: %s.",
    invalid_past_date:
      "Nie możesz wybrać daty z przeszłości. Proszę wybrać datę z przyszłości.",

    // Nowe tłumaczenia dla menu czasu
    request_time: "Proszę wybrać dogodną godzinę:",
    back_to_calendar_btn: "⬅️ Wróć do kalendarza",
    time_selected: "Wybrano godzinę: %s.",
    invalid_past_time:
      "Nie możesz wybrać godziny z przeszłości. Proszę wybrać godzinę z przyszłości.",
    time_already_booked: "Ta godzina jest już zajęta. Proszę wybrać inną.",

    // Tłumaczenia dla potwierdzenia rezerwacji
    confirm_appointment:
      "Proszę sprawdzić dane rezerwacji:\n\n" +
      "🔧 Usługa: %s\n" +
      "📆 Data: %s\n" +
      "⏰ Godzina: %s\n\n" +
      "Wszystko się zgadza?",
    confirm_btn: "✅ Potwierdź",
    cancel_btn: "❌ Anuluj",
    appointment_confirmed:
      "🎉 Rezerwacja pomyślna!\n\n" +
      "🔧 Usługa: %s\n" +
      "📆 Data: %s\n" +
      "⏰ Godzina: %s",
    appointment_cancelled:
      "❌ Rezerwacja anulowana. Możesz rozpocząć nową rezerwację.",
    back_to_main_menu_final_btn: "⬅️ Menu główne",

    // Tłumaczenia dla powiadomienia administratora
    admin_new_appointment_header: "📋 Nowa rezerwacja!",
    admin_client_name: "👨‍💼 Imię: %s",
    admin_client_phone: "📲 Telefon: %s",
    admin_service: "🔧 Wybrana usługa: %s",
    admin_location: "📍 Lokalizacja: %s",
    admin_date: "📆 Zaplanowano: %s",
    admin_time: "⏰ Początek: %s",
    admin_delimiter: "━━━━━━━━━━━━━━━",
    profile_header: "📋 Twój profil",
    profile_no_appointments: "Nie masz aktywnych rezerwacji.",
    profile_appointment_details:
      "━━━━━━━━━━━━━━━\n" + // Separator dla rezerwacji
      "🔧 Usługa: %s\n" +
      "📆 Data: %s\n" +
      "⏰ Godzina: %s",
    back_to_main_menu_profile_btn: "⬅️ Menu główne",
    cancel_appointment_main_menu_btn: "❌ Anuluj wizytę", // Nowy przycisk w menu głównym
    no_active_appointments_cancel:
      "Nie masz aktywnych rezerwacji do anulowania.",
    visit_cancelled_success: "✅ Twoja wizyta została anulowana.",

    // Tłumaczenia dla powiadomienia administratora o anulowaniu
    admin_cancelled_appointment_header: "❌ Wizyta anulowana!",
    admin_cancelled_service: "🔧 Usługa: %s",
    admin_cancelled_date: "📆 Data: %s",
    admin_cancelled_time: "⏰ Godzina: %s",
    reminder_message_header: "🔔 Przypomnienie o Twojej wizycie!",
    reminder_service: "🔧 Usługa: %s",
    reminder_date: "📆 Zaplanowano: %s",
    reminder_time: "⏰ Godzina: %s",
    reminder_footer: "Czekamy na Ciebie!",
    select_records_filter: "Wybierz, które rezerwacje chcesz zobaczyć:",
    filter_today_btn: "🗓️ Na dziś",
    filter_tomorrow_btn: "➡️ Na jutro",
    filter_this_week_btn: "📅 Ten tydzień",
    filter_this_month_btn: "📈 Ten miesiąc",
    filter_all_records_btn: "🗂️ Wszystkie przyszłe",
    filter_specific_date_btn: "🔎 Konkretna data", // Możliwe, dodamy później
    back_to_records_filters_btn: "⬅️ Do filtrów",
    records_list_header: "📈 Aktywne rezerwacje:",
    no_records_found: "Nie znaleziono rezerwacji według wybranych kryteriów.",
    admin_menu_btn: "Menu admina", // Upewnij się, że ten przycisk jest w głównym menu
    block_date_time_future_impl:
      "Funkcjonalność Blokowania daty/godziny zostanie zaimplementowana.",
    add_to_portfolio_future_impl:
      "Funkcjonalność Dodawania do portfolio zostanie zaimplementowana.",
    block_client_future_impl:
      "Funkcjonalność Blokowania klienta zostanie zaimplementowana. Proszę podać ID użytkownika do zablokowania.",
    back_to_main_menu_btn: "⬅️ Powrót do menu admina",
  },
};

function getTranslation(lang, key, ...args) {
  if (translations[lang] && translations[lang][key]) {
    let text = translations[lang][key];
    if (args.length > 0) {
      args.forEach((arg) => {
        text = text.replace("%s", arg);
      });
    }
    return text;
  }
  console.warn(`Переклад для ключа "${key}" мовою "${lang}" не знайдено.`);
  return key;
}

module.exports = {
  getTranslation,
};
