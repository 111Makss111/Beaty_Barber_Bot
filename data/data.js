const fs = require("fs");
const path = require("path");

const USERS_FILE_PATH = path.join(__dirname, "users.json");

// Функція для читання даних користувачів з файлу
const readUsersData = () => {
  try {
    const data = fs.readFileSync(USERS_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // Якщо файл не існує або порожній, повертаємо порожній об'єкт
    if (error.code === "ENOENT" || error instanceof SyntaxError) {
      return {};
    }
    console.error("Помилка читання даних користувачів:", error);
    return {};
  }
};

// Функція для запису даних користувачів у файл
const writeUsersData = (data) => {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Помилка запису даних користувачів:", error);
  }
};

// Функція для пошуку користувача за ID
const findUser = (userId) => {
  const users = readUsersData();
  return users[userId];
};

// Функція для збереження (додавання/оновлення) даних користувача
const saveUser = (user) => {
  const users = readUsersData();
  users[user.id] = user; // Зберігаємо користувача за його ID як ключем
  writeUsersData(users);
};

module.exports = {
  readUsersData,
  writeUsersData,
  findUser,
  saveUser,
};
