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
    selectLanguage: "Будь ласка, оберіть мову:",
    languageSet: "Мову встановлено. ✅",
    pleaseSelectLanguageFromButtons:
      "Будь ласка, оберіть мову, натиснувши на одну з кнопок.",
    enterName: "Будь ласка, введіть ваше ім'я та прізвище:",
    enterPhone:
      'Будь ласка, введіть ваш номер телефону (або натисніть "Пропустити"):',
    skipPhone: "Пропустити",
    sendMyContact: "Надіслати мій контакт",
    bookAppointmentButton: "Записатись 📅",
    cancelAppointmentButton: "Скасувати запис ❌",
    myCabinetButton: "Мій кабінет 👤",
    portfolioButton: "Портфоліо 📸",
    changeLanguage: "Змінити мову 🌐",
    confirm: "Підтвердити ✅",
    cancel: "Скасувати ❌",
    viewAllAppointments: "Переглянути всі записи 📊",
    blockDateTime: "Заблокувати дату/час 🚫",
    addPortfolioPhoto: "Додати фото до портфоліо 🖼️",
    backToMainMenu: "Повернутись в головне меню ↩️",
    noFutureAppointments: "Немає майбутніх записів.",
    notSpecified: "Не вказано",
    clientProfile: "Профіль клієнта",
    service: "Послуга",
    location: "Локація",
    scheduled: "Заплановано",
    time: "Час",
    manicureService: "Манікюр",
    pedicureService: "Педікюр",
    removalService: "Зняття",
    strengtheningService: "Укріплення",

    // Додаємо назви місяців та днів тижня
    monthNames: [
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
    dayNames: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    invalidPastDate:
      "Ця дата вже в минулому. Будь ласка, оберіть майбутню дату. 📅",
    ancelAppointmentButton: "Скасувати запис ❌",
    myCabinetButton: "Мій кабінет 👤", // Якщо ще не додано
    noFutureAppointments: "У вас немає майбутніх записів.",
    yourAppointments: "Ваші майбутні записи:",
    selectAppointmentToCancel: "Оберіть запис для скасування:",
    confirmCancelAppointment: (service, date, time) =>
      `Ви впевнені, що хочете скасувати запис на "${service}" ${date} о ${time}?`,
    appointmentCanceled: "Ваш запис успішно скасовано! ✅",
    appointmentCancelFailed: "Не вдалося скасувати запис. Спробуйте ще раз.",
    appointmentCanceledByClientAdmin: (
      userName,
      userId,
      service,
      date,
      time,
      appointmentId
    ) => `
❌ *ЗАПИС СКАСОВАНО КЛІЄНТОМ!*
━━━━━━━━━━━━━━━
👤 *Клієнт:* ${userName} (ID: \`${userId}\`)
🔧 *Послуга:* ${service}
📆 *Дата:* ${date}
⏰ *Час:* ${time}
ID Запису: \`${appointmentId}\`
━━━━━━━━━━━━━━━
`,
    back: "Назад ↩️",
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
    selectLanguage: "Proszę wybrać język:",
    languageSet: "Język został ustawiony. ✅",
    pleaseSelectLanguageFromButtons:
      "Proszę wybrać język, naciskając jeden z przycisków.",
    enterName: "Proszę podać swoje imię i nazwisko:",
    enterPhone: 'Proszę podać swój numer telefonu (lub naciśnij "Pomiń"):',
    skipPhone: "Pomiń",
    sendMyContact: "Wyślij mój kontakt",
    bookAppointmentButton: "Umów wizytę 📅",
    cancelAppointmentButton: "Anuluj rezerwację ❌",
    myCabinetButton: "Mój gabinet 👤",
    portfolioButton: "Portfolio 📸",
    changeLanguage: "Zmień język 🌐",
    confirm: "Potwierdź ✅",
    cancel: "Anuluj ❌",
    viewAllAppointments: "Wyświetl wszystkie rezerwacje 📊",
    blockDateTime: "Zablokuj datę/godzinę 🚫",
    addPortfolioPhoto: "Dodaj zdjęcie do portfolio 🖼️",
    backToMainMenu: "Powrót do menu głównego ↩️",
    noFutureAppointments: "Brak przyszłych rezerwacji.",
    notSpecified: "Nie podano",
    clientProfile: "Profil klienta",
    service: "Usługa",
    location: "Lokalizacja",
    scheduled: "Zaplanowano",
    time: "Godzina",
    manicureService: "Manicure",
    pedicureService: "Pedicure",
    removalService: "Usunięcie",
    strengtheningService: "Wzmocnienie",

    // Додаємо назви місяців та днів тижня
    monthNames: [
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
    dayNames: ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"],
    invalidPastDate:
      "Ta data jest już przeszłością. Proszę wybrać przyszłą datę. 📅",
    cancelAppointmentButton: "Anuluj rezerwację ❌",
    myCabinetButton: "Mój gabinet 👤", // Якщо ще не додано
    noFutureAppointments: "Nie masz nadchodzących rezerwacji.",
    yourAppointments: "Twoje nadchodzące rezerwacje:",
    selectAppointmentToCancel: "Wybierz rezerwację do anulowania:",
    confirmCancelAppointment: (service, date, time) =>
      `Czy na pewno chcesz anulować rezerwację na "${service}" w dniu ${date} o ${time}?`,
    appointmentCanceled: "Twoja rezerwacja została pomyślnie anulowana! ✅",
    appointmentCancelFailed:
      "Nie udało się anulować rezerwacji. Spróbuj ponownie.",
    appointmentCanceledByClientAdmin: (
      userName,
      userId,
      service,
      date,
      time,
      appointmentId
    ) => `
❌ *REZERWACJA ANULOWANA PRZEZ KLIENTA!*
━━━━━━━━━━━━━━━
👤 *Klient:* ${userName} (ID: \`${userId}\`)
🔧 *Usługa:* ${service}
📆 *Data:* ${date}
⏰ *Czas:* ${time}
ID Rezerwacji: \`${appointmentId}\`
━━━━━━━━━━━━━━━
`,
    back: "Wstecz ↩️",
  },
};

module.exports = messages;
