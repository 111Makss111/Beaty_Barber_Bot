# Beaty_Barber_Bot

├── src/
│ ├── bot/
│ │ ├── index.js # Основний файл бота (ініціалізація, обробка команд)
│ │ ├── scenes/ # Сцени для WizardScene (якщо потрібні багатоетапні сценарії)
│ │ │ ├── bookingScene.js # Сцена для процесу запису
│ │ │ └── adminScene.js # Сцена для адмін-панелі
│ │ └── handlers/ # Обробники команд та колбеків
│ │ ├── startHandler.js
│ │ ├── menuHandler.js
│ │ ├── bookHandler.js
│ │ ├── myAppointmentsHandler.js
│ │ ├── portfolioHandler.js
│ │ └── adminHandler.js
│ ├── services/
│ │ ├── appointmentService.js # Логіка для роботи з записами (збереження, видалення, перевірка)
│ │ ├── portfolioService.js # Логіка для роботи з портфоліо
│ │ ├── userService.js # Можливо, для зберігання користувачів (якщо потрібно)
│ │ └── jsonStorage.js # Універсальний модуль для читання/запису JSON
│ ├── utils/
│ │ ├── constants.js # Константи (наприклад, ID адміна, фіксовані години)
│ │ ├── messages.js # Тексти повідомлень (українська/польська)
│ │ ├── keyboards.js # Клавіатури (inline/reply)
│ │ └── i18n.js # Логіка для багатомовності
│ ├── config/
│ │ └── index.js # Завантаження змінних оточення (.env)
│ └── models/
│ ├── appointment.js # Модель для об'єкта запису
│ ├── user.js # Модель для об'єкта користувача (якщо потрібна)
│ └── service.js # Модель для об'єкта послуги
├── data/
│ ├── appointments.json # JSON-файл для збереження записів
│ ├── portfolio.json # JSON-файл для збереження даних портфоліо
│ └── users.json # JSON-файл для користувачів (якщо потрібно)
├── .env # Файл для змінних оточення (токен бота, ID адміна)
├── .gitignore # Файл для ігнорування файлів при роботі з Git
├── package.json # Метаінформація проєкту та залежності
└── README.md # Опис проєкту
