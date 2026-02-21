const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: "postgres",
  logging: env.nodeEnv === "development" ? console.log : false
});

module.exports = sequelize;
