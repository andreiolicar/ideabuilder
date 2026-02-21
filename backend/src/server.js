const app = require("./app");
const env = require("./config/env");
const sequelize = require("./config/db");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
  }

  app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
};

startServer();
