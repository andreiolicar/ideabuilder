const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const routes = require("./routes");
const {
  notFoundHandler,
  errorHandler
} = require("./middlewares/errorHandler");

const app = express();
app.set("trust proxy", 1);
const corsOrigins = env.corsOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin:
      corsOrigins.length === 0 || corsOrigins.includes("*") ? true : corsOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
