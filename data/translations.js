const translations = {
  ua: {
    // Загальні повідомлення
    admin_welcome: "👩‍💻 Ви увійшли як адміністратор. Ось ваше головне меню.",
    welcome_message:
      "✨ Вітаємо! Я твій помічник для запису на б’юті-послуги. Обери зручну мову:",
    image_load_error:
      "❌ На жаль, не вдалося завантажити зображення. Будь ласка, спробуйте пізніше або зверніться до підтримки.",
    error_try_again: "⚠️ Сталася помилка, спробуйте почати знову (/start).",
    error_unknown_command:
      "🤔 Невідома команда або неправильний стан. Спробуйте ще раз.",
    access_denied:
      "🚫 Відмовлено в доступі. Ця функція лише для адміністраторів.",
    admin_not_implemented: "🛠️ Ця функція адміністратора ще в розробці.",

    // Адмін-повідомлення та дії
    admin_choose_date_to_block:
      "🗓️ Оберіть дату, яку бажаєте заблокувати/розблокувати:",
    admin_date_blocked: "✅ Дата **{date}** повністю заблокована для запису.",
    admin_date_unblocked: "✅ Дата **{date}** успішно розблокована.",

    // НОВІ ПЕРЕКЛАДИ ДЛЯ БЛОКУВАННЯ ГОДИН
    admin_choose_date_for_hours_block:
      "🗓️ Оберіть дату, на якій бажаєте заблокувати/розблокувати години:",
    admin_block_hours_instructions:
      "⏰ Натискайте на години, щоб заблокувати або розблокувати їх. Кожна натиснута година буде позначена ❌. Натисніть 'Готово', коли закінчите.",
    admin_hour_blocked: "✅ Година **{time}** на **{date}** заблокована.",
    admin_hour_unblocked: "✅ Година **{time}** на **{date}** розблокована.",
    button_finish_blocking_hours: "✅ Готово",
    slot_not_available:
      "Цей час вже зайнятий або недоступний. Будь ласка, оберіть інший слот.",
    slot_taken_while_confirming:
      "На жаль, обраний вами час щойно був зайнятий. Будь ласка, оберіть інший.",

    // Меню адміністратора (з емоджі для кнопок)
    admin_menu_view_records: "🗓️ Переглянути всі записи",
    admin_menu_block_date: "🚫 Заблокувати дату",
    admin_menu_block_hours: "⏰ Заблокувати години",
    admin_menu_add_portfolio: "📸 Додати до портфоліо",
    admin_menu_block_client: "🚫 Клієнт",

    // Загальні запити (для реєстрації)
    request_name:
      "📝 Дякуємо! Будь ласка, введіть ваше Ім'я та Прізвище (наприклад: Іван Петренко):",
    request_phone:
      "📞 Впишіть свій номер телефону (без +38) або скористайтесь кнопками знизу:",
    phone_button_telegram: "📲 Мій номер з Telegram",
    phone_button_skip: "➡️ Пропустити",
    data_saved: "✅ Дякую, {first_name}! Ваші дані збережено.",
    info_saved_thank_you: "🎉 Дякуємо за надану інформацію!",

    // Меню клієнта
    client_menu_appointment: "✍️ Запис",
    client_menu_cancel: "❌ Скасувати запис",
    client_menu_profile: "👤 Мій профіль",
    client_menu_portfolio: "🖼️ Портфоліо",
    choose_action: "✨ Оберіть дію:",

    // Послуги (Ключі для callback_data - без префікса "service_")
    choose_service: "💅 Будь ласка, оберіть послугу:",
    service_manicure: "💅 Манікюр",
    service_pedicure: "👣 Педикюр",
    service_removal: "✂️ Зняття",
    service_strengthening: "💪 Укріплення",
    service_haircut: "💇‍♂️ Стрижка",
    service_shave: "💈 Гоління",
    service_beard_trim: "🧔 Стрижка бороди",

    // Календар
    month_names: [
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
    weekday_short: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    button_prev_month: "◀️ Попередній місяць",
    button_next_month: "Наступний місяць ▶️",
    button_back_to_services: "↩️ Повернутись до послуг",
    button_back_to_admin_menu: "↩️ Назад до адмін-меню",
    choose_date: "🗓️ Оберіть дату:",
    choose_time_slot: "⏰ Оберіть зручний час на **{date}**:",
    button_back_to_calendar: "↩️ Повернутись до календаря",
    no_available_slots:
      "На жаль, на дату **{date}** немає вільних слотів. Будь ласка, оберіть іншу дату.",
    you_selected_time: "Ви обрали час **{time}**.",
    confirm_booking_prompt: "Підтвердити запис?",

    // Підтвердження запису
    confirmation_message:
      "Будь ласка, перевірте деталі запису:\n\nПослуга: **{service}**\nДата: **{date}**\nЧас: **{time}**\n\nПідтвердити запис?",
    button_confirm: "✅ Підтвердити",
    button_cancel_booking: "❌ Скасувати",
    booking_confirmed:
      "🎉 Дякуємо! Ваш запис успішно підтверджено. Ми зв'яжемося з вами найближчим часом. Чекаємо на вас!",
    booking_cancelled_by_user:
      "ℹ️ Запис скасовано. Ви завжди можете створити новий запис.",
    booking_display_format: "{date} о {time} ({service})",

    // Сповіщення адміністратора
    admin_new_booking_notification:
      "🔔 **НОВИЙ ЗАПИС!** 🔔\n\nКлієнт: **{user_name}** (ID: `{user_id}`)\nТелефон: `{user_phone}`\n\nПослуга: **{service}**\nДата: **{date}**\nЧас: **{time}**",
    no_upcoming_bookings:
      'У вас немає активних записів. Ви можете створити новий, натиснувши "✍️ Запис".',
    choose_booking_to_cancel:
      "Будь ласка, оберіть запис, який хочете скасувати:",
    cancel_confirmation:
      "Ви впевнені, що хочете скасувати запис на **{service}**\nДата: **{date}**\nЧас: **{time}**?",
    button_yes_cancel: "✅ Так, скасувати",
    button_no_keep: "❌ Ні, залишити",
    booking_successfully_cancelled: "✅ Ваш запис успішно скасовано.",
    admin_booking_cancelled_notification:
      "🔔 **ЗАПИС СКАСОВАНО!** 🔔\n\nКлієнт: **{user_name}** (ID: `{user_id}`)\n\nПослуга: **{service}**\nДата: **{date}**\nЧас: **{time}**",
    booking_not_found:
      "На жаль, не вдалося знайти або скасувати запис. Можливо, його вже скасовано або час вже минув.",

    // Переклади для профілю
    profile_client_header: "📋 *Профіль клієнта*",
    profile_your_info: "👨‍💼 Ім’я: **{first_name} {last_name}**",
    profile_phone: "📲 Телефон: **{phone}**",
    profile_no_phone_provided: "📲 Телефон: Не надано",
    profile_your_bookings: "*🗓️ Ваші майбутні записи:*",
    profile_no_bookings: "У вас немає майбутніх записів.",
    profile_service: "🔧 Послуга: *{service}*",
    profile_date: "📆 Дата: *{date}*",
    profile_time: "⏰ Час: *{time}*",
    profile_booking_separator: "━━━━━━━━━━━━━━━",
    button_back_to_cancel_menu: "↩️ Назад до списку записів",
    button_back_to_main_menu: "↩️ Назад до головного меню",

    // НОВІ ПЕРЕКЛАДИ ДЛЯ АДМІН-ЗАПИСІВ
    admin_all_records_header: "📅 *Всі активні записи*",
    admin_record_client_name: "👨‍💼 Клієнт: **{client_name}**",
    admin_record_client_phone: "📲 Телефон: **{client_phone}**",
    admin_no_active_records: "Наразі немає активних записів.",
    button_back_to_admin_menu_from_records: "↩️ Назад до адмін-меню",
    admin_portfolio_no_photos:
      "🖼️ Ваше портфоліо поки що порожнє. Натисніть 'Додати фото', щоб розпочати.",
    admin_portfolio_add_photo_button: "➕ Додати фото",
    admin_portfolio_delete_photo_button: "🗑️ Видалити фото",
    admin_portfolio_send_photo_instruction:
      "🖼️ Надішліть мені фотографію, яку ви хочете додати до портфоліо.",
    admin_portfolio_photo_added: "✅ Фото успішно додано до портфоліо!",
    admin_portfolio_photo_deleted: "✅ Фото успішно видалено з портфоліо!",
    admin_portfolio_no_photo_received:
      "❌ Будь ласка, надішліть саме фотографію.",
    admin_portfolio_photo_caption: "Фото {current} з {total}",
  },
  pl: {
    // Загальні повідомлення
    admin_welcome:
      "👩‍💻 Zalogowałeś się jako administrator. Oto Twoje główne menu.",
    welcome_message:
      "✨ Witaj! Jestem Twoim asystentem do umawiania wizyt na usługi beauty. Wybierz dogodny język:",
    image_load_error:
      "❌ Niestety, nie udało się załadować obrazu. Spróbuj ponownie później lub skontaktuj się z pomocą techniczną.",
    error_try_again: "⚠️ Wystąpił błąd, spróbuj zacząć od nowa (/start).",
    error_unknown_command:
      "🤔 Nieznane polecenie lub nieprawidłowy stan. Spróbuj ponownie.",
    access_denied:
      "🚫 Odmowa dostępu. Ta funkcja jest tylko dla administratorów.",
    admin_not_implemented:
      "🛠️ Ta funkcja administratora jest jeszcze w fazie rozwoju.",

    // Адмін-повідомлення та дії
    admin_choose_date_to_block:
      "🗓️ Wybierz datę, którą chcesz zablokować/odblokować:",
    admin_date_blocked:
      "✅ Data **{date}** została całkowicie zablokowana dla rezerwacji.",
    admin_date_unblocked: "✅ Data **{date}** została pomyślnie odblokowana.",

    // НОВІ ПЕРЕКЛАДИ ДЛЯ БЛОКУВАННЯ ГОДИН
    admin_choose_date_for_hours_block:
      "🗓️ Wybierz datę, na której chcesz zablokować/odblokować godziny:",
    admin_block_hours_instructions:
      "⏰ Klikaj na godziny, aby je zablokować lub odblokować. Każda kliknięta godzina zostanie oznaczona ❌. Naciśnij 'Gotowe', gdy skończysz.",
    admin_hour_blocked:
      "✅ Godzina **{time}** w dniu **{date}** została zablokowana.",
    admin_hour_unblocked:
      "✅ Godzina **{time}** w dniu **{date}** została rozblokowana.",
    button_finish_blocking_hours: "✅ Gotowe",
    slot_not_available:
      "Ten termin jest już zajęty lub niedostępny. Proszę wybierz inny slot.",
    slot_taken_while_confirming:
      "Niestety, wybrana przez Ciebie godzina została właśnie zajęta. Proszę wybierz inną.",

    // Меню адміністратора (з емоджі для кнопок)
    admin_menu_view_records: "🗓️ Zobacz wszystkie rezerwacje",
    admin_menu_block_date: "🚫 Zablokuj datę",
    admin_menu_block_hours: "⏰ Zablokuj godziny",
    admin_menu_add_portfolio: "📸 Dodaj do portfolio",
    admin_menu_block_client: "🚫 Klient",

    // Загальні запити (для реєстрації)
    request_name: "📝 Proszę podaj swoje Imię i Nazwisko (np. Jan Kowalski):",
    request_phone:
      "📞 Wprowadź swój numer telefonu (bez +48) lub skorzystaj z przycisków poniżej:",
    phone_button_telegram: "📲 Mój numer z Telegrama",
    phone_button_skip: "➡️ Pomiń",
    data_saved: "✅ Dziękuję, {first_name}! Twoje dane zostały zapisane.",
    info_saved_thank_you: "🎉 Dziękuję za podane informacje!",

    // Меню клієнта
    client_menu_appointment: "✍️ Rezerwacja",
    client_menu_cancel: "❌ Anuluj rezerwację",
    client_menu_profile: "👤 Mój profil",
    client_menu_portfolio: "🖼️ Portfolio",
    choose_action: "✨ Wybierz działanie:",

    // Послуги (Ключі для callback_data - без префікса "service_")
    choose_service: "💅 Proszę wybierz usługę:",
    service_manicure: "💅 Manicure",
    service_pedicure: "👣 Pedicure",
    service_removal: "✂️ Usunięcie",
    service_strengthening: "💪 Wzmocnienie",
    service_haircut: "💇‍♂️ Strzyżenie",
    service_shave: "💈 Golenie",
    service_beard_trim: "🧔 Przycinanie brody",

    // Календар
    month_names: [
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
    weekday_short: ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"],
    button_prev_month: "◀️ Poprzedni miesiąc",
    button_next_month: "Następny miesiąc ▶️",
    button_back_to_services: "↩️ Powrót do usług",
    button_back_to_admin_menu: "↩️ Powrót do menu administratora",
    choose_date: "🗓️ Wybierz datę:",
    choose_time_slot: "⏰ Wybierz dogodną godzinę na **{date}**:",
    button_back_to_calendar: "↩️ Powrót do kalendarza",
    no_available_slots:
      "Niestety, na datę **{date}** brak wolnych terminów. Proszę wybierz inną datę.",
    you_selected_time: "Wybrałeś godzinę **{time}**.",
    confirm_booking_prompt: "Potwierdzić rezerwację?",

    // Підтвердження запису
    confirmation_message:
      "Proszę sprawdzić szczegóły rezerwacji:\n\nUsługa: **{service}**\nData: **{date}**\nGodzina: **{time}**\n\nPotwierdzić rezerwację?",
    button_confirm: "✅ Potwierdź",
    button_cancel_booking: "❌ Anuluj",
    booking_confirmed:
      "🎉 Dziękuję! Twoja rezerwacja została pomyślnie potwierdzona. Skontaktujemy się z Tobą wkrótce. Czekamy na Ciebie!",
    booking_cancelled_by_user:
      "ℹ️ Rezerwacja anulowana. Zawsze możesz utworzyć nową rezerwację.",
    booking_display_format: "{date} o {time} ({service})",

    // Сповіщення адміністратора
    admin_new_booking_notification:
      "🔔 **NOWA REZERWACJA!** 🔔\n\nKlient: **{user_name}** (ID: `{user_id}`)\nTelefon: `{user_phone}`\n\nUsługa: **{service}**\nData: **{date}**\nGodzina: **{time}**",
    no_upcoming_bookings:
      'Nie masz aktywnych rezerwacji. Możesz utworzyć nową, klikając "✍️ Rezerwacja".',
    choose_booking_to_cancel:
      "Proszę wybierz rezerwację, którą chcesz anulować:",
    cancel_confirmation:
      "Czy na pewno chcesz anulować rezerwację na **{service}**\nData: **{date}**\nGodzina: **{time}**?",
    button_yes_cancel: "✅ Tak, anuluj",
    button_no_keep: "❌ Nie, zostaw",
    booking_successfully_cancelled:
      "✅ Twoja rezerwacja została pomyślnie anulowana.",
    admin_booking_cancelled_notification:
      "🔔 **REZERWACJA ANULOWANA!** 🔔\n\nKlient: **{user_name}** (ID: `{user_id}`)\n\nUsługa: **{service}**\nData: **{date}**\nGodzina: **{time}**",
    booking_not_found:
      "Niestety, nie udało się znaleźć ani anulować rezerwacji. Być może została już anulowana lub minął jej termin.",

    // Переклади для профілю
    profile_client_header: "📋 *Profil klienta*",
    profile_your_info: "👨‍💼 Imię: **{first_name} {last_name}**",
    profile_phone: "📲 Telefon: **{phone}**",
    profile_no_phone_provided: "📲 Telefon: Nie podano",
    profile_your_bookings: "*🗓️ Twoje nadchodzące rezerwacje:*",
    profile_no_bookings: "Nie masz nadchodzących rezerwacji.",
    profile_service: "🔧 Usługa: *{service}*",
    profile_date: "📆 Data: *{date}*",
    profile_time: "⏰ Godzina: *{time}*",
    profile_booking_separator: "━━━━━━━━━━━━━━━",
    button_back_to_cancel_menu: "↩️ Powrót do listy rezerwacji",
    button_back_to_main_menu: "↩️ Powrót do menu głównego",

    // НОВІ ПЕРЕКЛАДИ ДЛЯ АДМІН-ЗАПИСІВ
    admin_all_records_header: "📅 *Wszystkie aktywne rezerwacje*",
    admin_record_client_name: "👨‍💼 Klient: **{client_name}**",
    admin_record_client_phone: "📲 Telefon: **{client_phone}**",
    admin_no_active_records: "Obecnie brak aktywnych rezerwacji.",
    button_back_to_admin_menu_from_records: "↩️ Powrót do menu administratora",
    admin_portfolio_no_photos:
      "🖼️ Twoje portfolio jest puste. Kliknij 'Dodaj zdjęcie', aby rozpocząć.",
    admin_portfolio_add_photo_button: "➕ Dodaj zdjęcie",
    admin_portfolio_delete_photo_button: "🗑️ Usuń zdjęcie",
    admin_portfolio_send_photo_instruction:
      "🖼️ Wyślij mi zdjęcie, które chcesz dodać do portfolio.",
    admin_portfolio_photo_added:
      "✅ Zdjęcie zostało pomyślnie dodane do portfolio!",
    admin_portfolio_photo_deleted:
      "✅ Zdjęcie zostało pomyślnie usunięte z portfolio!",
    admin_portfolio_no_photo_received: "❌ Proszę wysłać tylko zdjęcie.",
    admin_portfolio_photo_caption: "Zdjęcie {current} z {total}",
  },
};

const getTranslation = (key, lang, placeholders = {}) => {
  // Перевіряємо, чи існує переклад для даного ключа і мови
  if (
    translations.hasOwnProperty(lang) &&
    translations[lang].hasOwnProperty(key)
  ) {
    let text = translations[lang][key];

    // Замінюємо плейсхолдери
    if (typeof text === "string") {
      for (const placeholder in placeholders) {
        text = text.replace(
          new RegExp(`{${placeholder}}`, "g"),
          placeholders[placeholder]
        );
      }
    }
    return text;
  } else {
    // Якщо переклад не знайдено, спробуємо українську або повернемо відсутній ключ
    if (
      translations.hasOwnProperty("ua") &&
      translations.ua.hasOwnProperty(key)
    ) {
      let text = translations.ua[key];
      if (typeof text === "string") {
        for (const placeholder in placeholders) {
          text = text.replace(
            new RegExp(`{${placeholder}}`, "g"),
            placeholders[placeholder]
          );
        }
      }
      return text;
    }
    return `[Translation missing for ${key} in ${lang}]`;
  }
};

module.exports = {
  getTranslation,
};
