class PortfolioItem {
  constructor(id, fileId, description = "") {
    this.id = id;
    this.fileId = fileId; // Telegram File ID фото
    this.description = description;
    this.addedAt = new Date().toISOString();
  }
}

module.exports = PortfolioItem;
