const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

const storage = process.env.DB_STORAGE || "./data/dev.sqlite";
const resolvedStorage = path.isAbsolute(storage)
  ? storage
  : path.resolve(process.cwd(), storage);

fs.mkdirSync(path.dirname(resolvedStorage), { recursive: true });

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: resolvedStorage,
  logging: false,
});

async function initDb() {
  const { initModels } = require("../models");
  initModels(sequelize);
  await sequelize.authenticate();
  await sequelize.sync();
}

module.exports = { sequelize, initDb };

