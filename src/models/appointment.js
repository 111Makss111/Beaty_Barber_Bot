class Appointment {
  constructor(
    id,
    userId,
    userName,
    userPhone,
    service,
    date,
    time,
    status = "active"
  ) {
    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.userPhone = userPhone;
    this.service = service;
    this.date = date; // Формат 'YYYY-MM-DD'
    this.time = time; // Формат 'HH:MM'
    this.status = status; // 'active', 'canceled', 'completed'
    this.createdAt = new Date().toISOString();
  }
}

module.exports = Appointment;
