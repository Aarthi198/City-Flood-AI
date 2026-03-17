require("dotenv").config();

const { sequelize } = require("../config/db");
const { initModels } = require("../models");

(async () => {
  initModels(sequelize);
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  // eslint-disable-next-line no-console
  console.log("DB synced");
  process.exit(0);
})().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

