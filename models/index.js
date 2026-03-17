const { DataTypes } = require("sequelize");

let models = null;

function initModels(sequelize) {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        allowNull: false,
        defaultValue: "USER",
      },
    },
    { tableName: "users", underscored: true }
  );

  const FloodData = sequelize.define(
    "FloodData",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      location: { type: DataTypes.STRING, allowNull: false },
      rainfall: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      riskLevel: { type: DataTypes.STRING, allowNull: false, defaultValue: "LOW" },
      riskScore: { type: DataTypes.FLOAT, allowNull: true },
      timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: "flood_data", underscored: true }
  );

  const Drainage = sequelize.define(
    "Drainage",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      location: { type: DataTypes.STRING, allowNull: false },
      flowRate: { type: DataTypes.FLOAT, allowNull: true },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "OK" },
    },
    { tableName: "drainage", underscored: true }
  );

  const Report = sequelize.define(
    "Report",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      image: { type: DataTypes.TEXT, allowNull: true }, // base64 or URL
      location: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "NEW" },
    },
    { tableName: "reports", underscored: true }
  );

  const Alert = sequelize.define(
    "Alert",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      message: { type: DataTypes.TEXT, allowNull: false },
      area: { type: DataTypes.STRING, allowNull: false },
      riskLevel: { type: DataTypes.STRING, allowNull: false, defaultValue: "LOW" },
      timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: "alerts", underscored: true }
  );

  User.hasMany(Report, { foreignKey: "userId" });
  Report.belongsTo(User, { foreignKey: "userId" });

  models = { User, FloodData, Drainage, Report, Alert };
  return models;
}

function getModels() {
  if (!models) {
    throw new Error("Models not initialized. Did you call initDb()?");
  }
  return models;
}

module.exports = { initModels, getModels };

