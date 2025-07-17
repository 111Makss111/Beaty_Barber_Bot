// utils/cleanup.js

const { getSchedule, updateSchedule } = require("../data/data");

/**
 * Генерує всі можливі часові слоти для одного дня (з 9:00 до 18:00 з інтервалом 30 хв).
 * Ця функція використовується для визначення, чи весь день заблоковано.
 * @returns {string[]} Масив часових слотів у форматі "HH:MM".
 */
const generateAllTimeSlots = () => {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) continue; // Виключаємо 18:30 і далі
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
};

/**
 * Очищає з _schedule записи про повністю заблоковані адміном дати, які вже минули.
 */
const cleanupBlockedDates = () => {
  const schedule = getSchedule();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Обнуляємо час для коректного порівняння дат

  const allPossibleSlots = generateAllTimeSlots();
  let changesMade = false;

  for (const dateString in schedule) {
    if (schedule.hasOwnProperty(dateString)) {
      const date = new Date(dateString);
      date.setHours(0, 0, 0, 0);

      // Перевіряємо, чи дата минула
      if (date < today) {
        const daySchedule = schedule[dateString];
        let isFullDayBlockedByAdmin = true;

        if (
          Object.keys(daySchedule).length === 0 &&
          allPossibleSlots.length > 0
        ) {
          // Якщо daySchedule порожній, але є можливі слоти, це не "повністю заблоковано"
          isFullDayBlockedByAdmin = false;
        } else {
          for (const slot of allPossibleSlots) {
            const slotInfo = daySchedule[slot];
            if (!slotInfo || slotInfo.status !== "blocked_admin") {
              isFullDayBlockedByAdmin = false;
              break;
            }
          }
        }

        // Якщо день минув І він був повністю заблокований адміном, видаляємо його
        if (isFullDayBlockedByAdmin && allPossibleSlots.length > 0) {
          delete schedule[dateString];
          changesMade = true;
          console.log(
            `Cleanup: Видалено минулу заблоковану дату: ${dateString}`
          );
        }
      }
    }
  }

  if (changesMade) {
    updateSchedule(schedule);
    console.log("Cleanup: Очищення заблокованих дат завершено.");
  } else {
    console.log("Cleanup: Немає минулих заблокованих дат для очищення.");
  }
};

/**
 * Очищає з _schedule старі записи клієнтів, час яких вже минув.
 */
const cleanupPastBookings = () => {
  const schedule = getSchedule();
  const now = new Date();
  let changesMade = false;

  for (const dateString in schedule) {
    if (schedule.hasOwnProperty(dateString)) {
      const daySchedule = schedule[dateString];
      const date = new Date(dateString);

      for (const timeSlot in daySchedule) {
        if (daySchedule.hasOwnProperty(timeSlot)) {
          const booking = daySchedule[timeSlot];

          if (booking.status === "booked") {
            const [hours, minutes] = timeSlot.split(":").map(Number);
            const bookingDateTime = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              hours,
              minutes
            );

            // Перевіряємо, чи час запису вже минув
            if (bookingDateTime < now) {
              delete daySchedule[timeSlot];
              changesMade = true;
              console.log(
                `Cleanup: Видалено минулий запис клієнта: ${dateString} ${timeSlot}`
              );
            }
          }
        }
      }
      // Якщо після видалення записів день стає порожнім, видаляємо і його
      if (Object.keys(daySchedule).length === 0) {
        delete schedule[dateString];
        changesMade = true;
        console.log(
          `Cleanup: Видалено порожню дату після очищення записів: ${dateString}`
        );
      }
    }
  }

  if (changesMade) {
    updateSchedule(schedule);
    console.log("Cleanup: Очищення минулих записів клієнтів завершено.");
  } else {
    console.log("Cleanup: Немає минулих записів клієнтів для очищення.");
  }
};

module.exports = {
  cleanupBlockedDates,
  cleanupPastBookings,
};
