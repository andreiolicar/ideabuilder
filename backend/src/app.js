const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const routes = require("./routes");
const { globalRateLimit } = require("./middlewares/rateLimit");
const {
  notFoundHandler,
  errorHandler
} = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(globalRateLimit);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
