const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");
const userService = require("./userService"); // Потрібно для отримання даних користувача
const APPOINTMENTS_FILE = path.join(__dirname, "../../data/appointments.json");

async function readAppointments() {
  try {
    const data = await fs.readFile(APPOINTMENTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("Помилка читання файлу записів:", error);
    return [];
  }
}

async function writeAppointments(appointments) {
  try {
    await fs.writeFile(
      APPOINTMENTS_FILE,
      JSON.stringify(appointments, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Помилка запису файлу записів:", error);
  }
}

async function getAllAppointments() {
  return await readAppointments();
}

/**
 * Отримує майбутні записи за ідентифікатором користувача.
 * @param {number} userId - ID користувача.
 * @returns {Promise<Array>} Масив майбутніх записів для вказаного користувача.
 */
async function getFutureAppointmentsByUserId(userId) {
  const appointments = await readAppointments();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Сьогоднішня дата без часу

  return appointments
    .filter((app) => {
      if (app.userId !== userId) {
        return false;
      }
      const appointmentDate = new Date(app.date); // Дата запису
      const [appHour, appMinute] = app.time.split(":").map(Number);
      const appointmentDateTime = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate(),
        appHour,
        appMinute
      );

      // Перевіряємо, чи запис у майбутньому
      return appointmentDateTime > now;
    })
    .sort(
      (a, b) =>
        new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
    ); // Сортуємо за датою і часом
}

async function getBookedTimesForDate(date) {
  const appointments = await readAppointments();
  return appointments.filter((app) => app.date === date).map((app) => app.time);
}

async function createAppointment(appointmentData) {
  const appointments = await readAppointments();
  const isDuplicate = appointments.some(
    (app) =>
      app.userId === appointmentData.userId &&
      app.service === appointmentData.service &&
      app.date === appointmentData.date &&
      app.time === appointmentData.time
  );

  if (isDuplicate) {
    console.warn(
      `Спроба створити дублікат запису для користувача ${appointmentData.userId} на ${appointmentData.date} о ${appointmentData.time}`
    );
    return appointments.find(
      (app) =>
        app.userId === appointmentData.userId &&
        app.service === appointmentData.service &&
        app.date === appointmentData.date &&
        app.time === appointmentData.time
    );
  }

  const newAppointment = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...appointmentData,
  };
  appointments.push(newAppointment);
  await writeAppointments(appointments);
  return newAppointment;
}

/**
 * Скасовує запис за ID.
 * @param {string} appointmentId - ID запису для скасування.
 * @returns {Promise<object|null>} Скасований запис, якщо знайдено, інакше null.
 */
async function cancelAppointment(appointmentId) {
  let appointments = await readAppointments();
  const index = appointments.findIndex((app) => app.id === appointmentId);

  if (index !== -1) {
    const canceledAppointment = appointments[index];
    appointments.splice(index, 1); // Видаляємо запис
    await writeAppointments(appointments);
    return canceledAppointment; // Повертаємо скасований запис
  }
  return null;
}

// Перевірка, чи існує директорія 'data', якщо ні - створити
(async () => {
  const dataDir = path.dirname(APPOINTMENTS_FILE);
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
  getAllAppointments,
  getFutureAppointmentsByUserId, // Оновлено
  getBookedTimesForDate,
  createAppointment,
  cancelAppointment, // Додано
  getUser: userService.getUser, // Експортуємо функцію отримання користувача, якщо вона потрібна безпосередньо тут
};
