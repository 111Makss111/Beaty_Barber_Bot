class User {
  constructor(id, firstName, lastName, phone, language = "uk") {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.language = language;
    this.registeredAt = new Date().toISOString();
  }
}

module.exports = User;
