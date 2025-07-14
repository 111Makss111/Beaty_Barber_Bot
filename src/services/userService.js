const fs = require("fs").promises;
const path = require("path");

const USERS_FILE = path.join(__dirname, "../../data/users.json");

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("Помилка читання файлу користувачів:", error);
    return [];
  }
}

async function writeUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.error("Помилка запису файлу користувачів:", error);
  }
}

async function getUser(userId) {
  const users = await readUsers();
  return users.find((user) => user.id === userId);
}

async function createUser(id, firstName, lastName, phone, language = "uk") {
  const users = await readUsers();
  const newUser = {
    id,
    firstName,
    lastName,
    phone,
    language,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await writeUsers(users);
  return newUser;
}

async function updateUserData(userId, newData) {
  let users = await readUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...newData };
    await writeUsers(users);
    return users[index];
  }
  return null;
}

(async () => {
  const dataDir = path.dirname(USERS_FILE);
  try {
    await fs.access(dataDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(dataDir, { recursive: true });
      console.log(`Директорія ${dataDir} створена.`);
    } else {
      console.error("Помилка перевірки/створення директорії:", error);
    }
  }
})();

module.exports = {
  getUser,
  createUser,
  updateUserData,
  readUsers, // Можливо знадобиться для адмінки
  writeUsers, // Можливо знадобиться для адмінки
};
