const messages = {
  uk: {
    start: (name) =>
      `Привіт, ${name}! 👋 Ласкаво просимо до нашого сервісу запису на прийом.`,
    mainMenu: "Обери дію:",
    selectService: "Будь ласка, оберіть послугу:",
    selectDate: "Оберіть бажану дату:",
    selectTime: "Оберіть доступний час:",
    confirmAppointment: (service, date, time) =>
      `Ви збираєтеся записатись на "${service}" на ${date} о ${time}. Підтверджуєте?`,
    appointmentConfirmed: "Ваш запис успішно підтверджено! ✅",
    appointmentCanceled: "Ваш запис скасовано. ❌",
    noAppointments: "У вас немає майбутніх записів.",
    yourAppointments: "Ваші майбутні записи:",
    portfolioDescription: "Наше портфоліо:",
    adminPanel: "Адмін-панель:",
    accessDenied: "Доступ заборонено.",
    recordCanceledAdmin: (id) => `Запис з ID ${id} скасовано.`,
    blockDatePrompt: "Введіть дату для блокування (формат РРРР-ММ-ДД):",
    dateBlocked: (date) => `Дата ${date} успішно заблокована.`,
    invalidDate: "Невірний формат дати. Використовуйте РРРР-ММ-ДД.",
    error: "Виникла помилка. Спробуйте ще раз.",
    appointmentReminder24h: (service, date, time) =>
      `Нагадування: Ваш запис на "${service}" відбудеться завтра, ${date}, о ${time}.`,
    appointmentReminder2h: (service, date, time) =>
      `Нагадування: Ваш запис на "${service}" відбудеться через 2 години, ${date}, о ${time}.`,
    alreadyBooked: "На жаль, цей час вже зайнятий. Будь ласка, оберіть інший.",
    selectLanguage: "Будь ласка, оберіть мову:", // Нове повідомлення
    languageSet: "Мову встановлено на українську. 🇺🇦", // Нове повідомлення
    bookAppointment: "Записатись на прийом 📅", // Додано для клавіатури
    viewMyAppointments: "Мої записи 📋", // Додано для клавіатури
    portfolio: "Портфоліо 📸", // Додано для клавіатури
    changeLanguage: "Змінити мову 🌐", // Додано для клавіатури
    confirm: "Підтвердити ✅", // Додано для клавіатури
    cancel: "Скасувати ❌", // Додано для клавіатури
    viewAllAppointments: "Переглянути всі записи 📊", // Додано для клавіатури
    blockDateTime: "Заблокувати дату/час 🚫", // Додано для клавіатури
    addPortfolioPhoto: "Додати фото до портфоліо 🖼️", // Додано для клавіатури
    backToMainMenu: "Повернутись в головне меню ↩️", // Додано для клавіатури
    selectLanguage: "Будь ласка, оберіть мову:",
    languageSet: "Мову встановлено на українську. 🇺🇦",
    enterName: "Будь ласка, введіть ваше ім'я та прізвище:",
    enterPhone:
      'Будь ласка, введіть ваш номер телефону (або натисніть "Пропустити"):',
    skipPhone: "Пропустити",
    sendMyContact: "Надіслати мій контакт",
    bookAppointment: "Записатись на прийом 📅",
    viewMyAppointments: "Мої записи 📋",
    portfolio: "Портфоліо 📸",
    cancelAppointmentButton: "Скасувати запис ❌",
  },
  pl: {
    start: (name) =>
      `Cześć, ${name}! 👋 Witamy w naszym serwisie rezerwacji wizyt.`,
    mainMenu: "Wybierz akcję:",
    selectService: "Proszę wybrać usługę:",
    selectDate: "Wybierz preferowaną datę:",
    selectTime: "Wybierz dostępny czas:",
    confirmAppointment: (service, date, time) =>
      `Chcesz umówić się na "${service}" w dniu ${date} o ${time}. Potwierdzasz?`,
    appointmentConfirmed: "Twoja rezerwacja została pomyślnie potwierdzona! ✅",
    appointmentCanceled: "Twoja rezerwacja została anulowana. ❌",
    noAppointments: "Nie masz nadchodzących rezerwacji.",
    yourAppointments: "Twoje nadchodzące rezerwacje:",
    portfolioDescription: "Nasze portfolio:",
    adminPanel: "Panel administratora:",
    accessDenied: "Dostęp zabroniony.",
    recordCanceledAdmin: (id) => `Rezerwacja o ID ${id} została anulowana.`,
    blockDatePrompt: "Wprowadź datę do zablokowania (format RRRR-MM-DD):",
    dateBlocked: (date) => `Data ${date} została pomyślnie zablokowana.`,
    invalidDate: "Nieprawidłowy format daty. Użyj RRRR-MM-DD.",
    error: "Wystąpił błąd. Spróbuj ponownie.",
    appointmentReminder24h: (service, date, time) =>
      `Przypomnienie: Twoja wizyta na "${service}" odbędzie się jutro, ${date}, o ${time}.`,
    appointmentReminder2h: (service, date, time) =>
      `Przypomnienie: Twoja wizyta na "${service}" odbędzie się za 2 godziny, ${date}, o ${time}.`,
    alreadyBooked: "Niestety, ten termin jest już zajęty. Proszę wybrać inny.",
    selectLanguage: "Proszę wybrać język:", // Nowa wiadomość
    languageSet: "Język ustawiony na polski. 🇵🇱", // Nowa wiadomość
    bookAppointment: "Umów wizytę 📅", // Dodano dla klawiatury
    viewMyAppointments: "Moje wizyty 📋", // Dodano dla klawiatury
    portfolio: "Portfolio 📸", // Dodano dla klawiatury
    changeLanguage: "Zmień język 🌐", // Dodano dla klawiatury
    confirm: "Potwierdź ✅", // Dodano dla klawiatury
    cancel: "Anuluj ❌", // Dodano dla klawiatury
    viewAllAppointments: "Wyświetl wszystkie rezerwacje 📊", // Dodano dla klawiatury
    blockDateTime: "Zablokuj datę/godzinę 🚫", // Dodano dla klawiatury
    addPortfolioPhoto: "Dodaj zdjęcie do portfolio 🖼️", // Dodano dla klawiatury
    backToMainMenu: "Powrót do menu głównego ↩️", // Dodano dla klawiatury
    selectLanguage: "Proszę wybrać język:",
    languageSet: "Język ustawiony na polski. 🇵🇱",
    enterName: "Proszę podać swoje imię i nazwisko:",
    enterPhone: 'Proszę podać swój numer telefonu (lub naciśnij "Pomiń"):',
    skipPhone: "Pomiń",
    sendMyContact: "Wyślij mój kontakt",
    bookAppointment: "Umów wizytę 📅",
    viewMyAppointments: "Moje wizyty 📋",
    portfolio: "Portfolio 📸",
    cancelAppointmentButton: "Anuluj rezerwację ❌",
  },
};

module.exports = messages;
