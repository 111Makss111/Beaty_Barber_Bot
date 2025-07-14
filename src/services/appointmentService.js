const { readData, writeData } = require("./jsonStorage");
const Appointment = require("../models/appointment");

const APPOINTMENTS_FILE = "appointments.json";
const BLOCKED_SLOTS_FILE = "blocked_slots.json"; // Новий файл для заблокованих слотів

async function getAllAppointments() {
  return readData(APPOINTMENTS_FILE);
}

async function getAppointmentsByUserId(userId) {
  const appointments = await readData(APPOINTMENTS_FILE);
  return appointments.filter(
    (a) => a.userId === userId && a.status === "active"
  );
}

async function addAppointment(appointmentData) {
  const appointments = await readData(APPOINTMENTS_FILE);
  const newAppointment = new Appointment(
    Date.now().toString(), // Простий унікальний ID
    appointmentData.userId,
    appointmentData.userName,
    appointmentData.userPhone,
    appointmentData.service,
    appointmentData.date,
    appointmentData.time
  );
  appointments.push(newAppointment);
  await writeData(APPOINTMENTS_FILE, appointments);
  return newAppointment;
}

async function cancelAppointment(appointmentId) {
  const appointments = await readData(APPOINTMENTS_FILE);
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index !== -1) {
    appointments[index].status = "canceled";
    await writeData(APPOINTMENTS_FILE, appointments);
    return true;
  }
  return false;
}

async function isSlotBooked(date, time) {
  const appointments = await readData(APPOINTMENTS_FILE);
  const booked = appointments.some(
    (a) => a.date === date && a.time === time && a.status === "active"
  );
  if (booked) return true;

  const blockedSlots = await readData(BLOCKED_SLOTS_FILE);
  const blocked = blockedSlots.some((s) => s.date === date && s.time === time);
  return blocked;
}

async function getAvailableTimes(date, allAvailableTimes) {
  const bookedAndBlocked = await readData(APPOINTMENTS_FILE);
  const blockedSlots = await readData(BLOCKED_SLOTS_FILE);

  const unavailable = new Set();
  bookedAndBlocked.forEach((a) => {
    if (a.date === date && a.status === "active") {
      unavailable.add(a.time);
    }
  });
  blockedSlots.forEach((s) => {
    if (s.date === date) {
      unavailable.add(s.time);
    }
  });

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  return allAvailableTimes.filter((time) => {
    const isPastSlot = date === today && time <= currentTime;
    return !unavailable.has(time) && !isPastSlot;
  });
}

async function blockSlot(date, time) {
  const blockedSlots = await readData(BLOCKED_SLOTS_FILE);
  if (!blockedSlots.some((s) => s.date === date && s.time === time)) {
    blockedSlots.push({ date, time, blockedAt: new Date().toISOString() });
    await writeData(BLOCKED_SLOTS_FILE, blockedSlots);
    return true;
  }
  return false;
}

async function markAppointmentAsCompleted(appointmentId) {
  const appointments = await readData(APPOINTMENTS_FILE);
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index !== -1) {
    appointments[index].status = "completed";
    await writeData(APPOINTMENTS_FILE, appointments);
    return true;
  }
  return false;
}

module.exports = {
  getAllAppointments,
  getAppointmentsByUserId,
  addAppointment,
  cancelAppointment,
  isSlotBooked,
  getAvailableTimes,
  blockSlot,
  markAppointmentAsCompleted,
};
