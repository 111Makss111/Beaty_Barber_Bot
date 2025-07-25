// data/data.js

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

const defaultData = {
  users: [],
  schedule: {},
  blockedDates: [],
  portfolioPhotos: [],
};

let data = null;

const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE, "utf8");

      if (rawData.trim() === "") {
        console.log(
          "data.json існує, але порожній. Ініціалізую дефолтні дані."
        );
        data = { ...defaultData };
        saveData();
      } else {
        const parsedData = JSON.parse(rawData);
        data = { ...defaultData, ...parsedData };

        if (!Array.isArray(data.users)) {
          console.warn(
            "Попередження: data.users не є масивом після завантаження. Виправляю..."
          );
          data.users = [];
          saveData();
        }
        console.log("Дані успішно завантажено з data.json");
        console.log("Кількість користувачів:", data.users.length);
      }
    } else {
      console.log(
        "data.json не знайдено. Створюю новий файл з дефолтними даними."
      );
      data = { ...defaultData };
      saveData();
    }
  } catch (error) {
    console.error(
      "Критична помилка при завантаженні/парсингу data.json:",
      error
    );
    console.log("Відновлення: Ініціалізую дефолтні дані.");
    data = { ...defaultData };
    saveData();
  }
};

const saveData = () => {
  // Ця функція є, але не експортована
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Помилка при збереженні data.json:", error);
  }
};

loadData();

const findUser = (id) => {
  if (!data || !Array.isArray(data.users)) {
    console.error("data або data.users не ініціалізовано коректно в findUser.");
    return undefined;
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

const getAllUsers = () => {
  if (!data || !Array.isArray(data.users)) {
    console.error(
      "data або data.users не ініціалізовано коректно в getAllUsers."
    );
    return [];
  }
  return data.users;
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
  getAllUsers,
  getSchedule,
  setSchedule,
  getBlockedDates,
  setBlockedDates,
  getPortfolioPhotos,
  addPortfolioPhoto,
  deletePortfolioPhoto,
  saveData, // <--- ДОДАЙТЕ ЦЕЙ РЯДОК
};
