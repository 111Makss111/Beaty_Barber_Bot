const { readData, writeData } = require("./jsonStorage");
const PortfolioItem = require("../models/portfolioItem");

const PORTFOLIO_FILE = "portfolio.json";

async function getAllPortfolioItems() {
  return readData(PORTFOLIO_FILE);
}

async function addPortfolioItem(fileId, description = "") {
  const items = await readData(PORTFOLIO_FILE);
  const newItem = new PortfolioItem(Date.now().toString(), fileId, description);
  items.push(newItem);
  await writeData(PORTFOLIO_FILE, items);
  return newItem;
}

async function deletePortfolioItem(itemId) {
  let items = await readData(PORTFOLIO_FILE);
  const initialLength = items.length;
  items = items.filter((item) => item.id !== itemId);
  if (items.length < initialLength) {
    await writeData(PORTFOLIO_FILE, items);
    return true;
  }
  return false;
}

module.exports = {
  getAllPortfolioItems,
  addPortfolioItem,
  deletePortfolioItem,
};
