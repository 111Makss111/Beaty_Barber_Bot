require("dotenv").config();

const config = {
  botToken: process.env.BOT_TOKEN,
  adminId: process.env.ADMIN_ID,
};

module.exports = config;
