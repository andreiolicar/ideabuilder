const app = require("./app");
const env = require("./config/env");
const sequelize = require("./config/db");
const { startEmailWorker, stopEmailWorker } = require("./services/email/email.queue");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
  }

  const server = app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });

  startEmailWorker();

  const shutdown = () => {
    stopEmailWorker();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer();
