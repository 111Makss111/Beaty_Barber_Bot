const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "users.json"); // Шлях до твого файлу

// Функція для завантаження даних
const loadData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Якщо файл не існує, створюємо його з базовою структурою
      // Включаємо "_schedule" з порожнім об'єктом
      const initialData = {
        _schedule: {}, // Ініціалізуємо розклад
        // Сюди можуть додаватися інші глобальні налаштування, якщо потрібно
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    const parsedData = JSON.parse(data);

    // Перевіряємо, чи існує _schedule, якщо ні - ініціалізуємо
    if (!parsedData._schedule) {
      parsedData._schedule = {};
      saveData(parsedData); // Зберігаємо оновлену структуру
    }
    return parsedData;
  } catch (error) {
    console.error("Помилка завантаження даних:", error);
    // Якщо файл пошкоджений або помилка парсингу, повертаємо базову структуру
    const initialData = { _schedule: {} };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }
};

// Функція для збереження даних
const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Помилка збереження даних:", error);
  }
};

let usersData = loadData();

const findUser = (userId) => {
  // Перевіряємо, чи існує користувач, інакше повертаємо null або порожній об'єкт
  return usersData[userId.toString()] || null;
};

const saveUser = (user) => {
  if (user && user.id) {
    usersData[user.id.toString()] = user;
    saveData(usersData);
  }
};

// Додамо функції для доступу та оновлення _schedule
const getSchedule = () => {
  return usersData._schedule;
};

const updateSchedule = (newSchedule) => {
  usersData._schedule = newSchedule;
  saveData(usersData);
};

module.exports = {
  findUser,
  saveUser,
  getSchedule, // Експортуємо
  updateSchedule, // Експортуємо
};
