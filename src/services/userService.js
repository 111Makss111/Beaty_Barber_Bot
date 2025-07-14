const { readData, writeData } = require("./jsonStorage");
const User = require("../models/user");

const USERS_FILE = "users.json";

async function getUser(userId) {
  const users = await readData(USERS_FILE);
  return users.find((user) => user.id === userId);
}

async function createUser(userId, firstName, lastName = "", phone = "") {
  const users = await readData(USERS_FILE);
  const newUser = new User(userId, firstName, lastName, phone);
  users.push(newUser);
  await writeData(USERS_FILE, users);
  return newUser;
}

async function updateUserData(userId, newData) {
  const users = await readData(USERS_FILE);
  const index = users.findIndex((user) => user.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...newData };
    await writeData(USERS_FILE, users);
    return users[index];
  }
  return null;
}

async function getAllUsers() {
  return readData(USERS_FILE);
}

module.exports = {
  getUser,
  createUser,
  updateUserData,
  getAllUsers,
};
