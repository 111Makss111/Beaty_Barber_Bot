const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json"); // Шлях до файлу даних

// Дефолтна структура даних. Важливо, щоб `users` був масивом.
const defaultData = {
  users: [],
  schedule: {},
  blockedDates: [],
  portfolioPhotos: [],
};

let data = null; // Починаємо з null, щоб чітко контролювати ініціалізацію

// Функція для завантаження даних з файлу
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE, "utf8");

      if (rawData.trim() === "") {
        // Якщо файл існує, але порожній або містить тільки пробіли
        console.log(
          "data.json існує, але порожній. Ініціалізую дефолтні дані."
        );
        data = { ...defaultData };
        saveData(); // Зберігаємо дефолтні дані, щоб файл був валідним JSON
      } else {
        const parsedData = JSON.parse(rawData);
        // Об'єднуємо завантажені дані з дефолтною структурою.
        // Це гарантує, що всі дефолтні поля (включаючи users як масив) будуть присутні.
        data = { ...defaultData, ...parsedData };

        // Додаткова перевірка: якщо `users` не є масивом після парсингу, виправляємо
        if (!Array.isArray(data.users)) {
          console.warn(
            "Попередження: data.users не є масивом після завантаження. Виправляю..."
          );
          data.users = [];
          saveData(); // Зберігаємо виправлені дані
        }
        console.log("Дані успішно завантажено з data.json");
      }
    } else {
      // Якщо файл не існує
      console.log(
        "data.json не знайдено. Створюю новий файл з дефолтними даними."
      );
      data = { ...defaultData }; // Ініціалізуємо дефолтні дані
      saveData(); // Зберігаємо дефолтні дані, щоб створити файл
    }
  } catch (error) {
    // Ловимо помилки читання файлу або парсингу JSON
    console.error(
      "Критична помилка при завантаженні/парсингу data.json:",
      error
    );
    console.log("Відновлення: Ініціалізую дефолтні дані.");
    data = { ...defaultData }; // У випадку будь-якої помилки, ініціалізуємо дефолтні дані
    saveData(); // Спроба зберегти, щоб виправити можливий пошкоджений файл
  }
};

// Функція для збереження даних у файл
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Помилка при збереженні data.json:", error);
  }
};

// Завантажуємо дані при старті модуля.
// Це має відбутися один раз при запуску програми.
loadData();

// --- Функції для користувачів та розкладу ---
const findUser = (id) => {
  // Додаткова перевірка перед використанням, щоб уникнути помилок,
  // хоча loadData має вже гарантувати, що users - це масив.
  if (!data || !Array.isArray(data.users)) {
    console.error("data або data.users не ініціалізовано коректно в findUser.");
    return undefined; // Повертаємо undefined, якщо users не є масивом
  }
  return data.users.find((user) => user.id === id);
};

const saveUser = (user) => {
  if (!data || !Array.isArray(data.users)) {
    console.error(
      "data або data.users не ініціалізовано коректно в saveUser. Неможливо зберегти користувача."
    );
    return;
  }
  const index = data.users.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    data.users[index] = user;
  } else {
    data.users.push(user);
  }
  saveData();
};
const getSchedule = () => data.schedule;
const setSchedule = (newSchedule) => {
  data.schedule = newSchedule;
  saveData();
};
const getBlockedDates = () => data.blockedDates;
const setBlockedDates = (newBlockedDates) => {
  data.blockedDates = newBlockedDates;
  saveData();
};

// --- Функції для ПОРТФОЛІО ---

const getPortfolioPhotos = () => {
  return data.portfolioPhotos;
};

const addPortfolioPhoto = (fileId) => {
  data.portfolioPhotos.push({
    fileId: fileId,
    timestamp: new Date().toISOString(),
  });
  saveData();
};

const deletePortfolioPhoto = (index) => {
  if (index >= 0 && index < data.portfolioPhotos.length) {
    data.portfolioPhotos.splice(index, 1);
    saveData();
    return true;
  }
  return false;
};

module.exports = {
  findUser,
  saveUser,
  getSchedule,
  setSchedule,
  getBlockedDates,
  setBlockedDates,
  getPortfolioPhotos,
  addPortfolioPhoto,
  deletePortfolioPhoto,
};
