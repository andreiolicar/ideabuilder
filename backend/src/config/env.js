const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/tcc_idea_builder",
  databaseUrlTest:
    process.env.DATABASE_URL_TEST ||
    "postgres://postgres:postgres@localhost:5432/tcc_idea_builder_test",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  resendApiKey: process.env.RESEND_API_KEY || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFromName: process.env.SMTP_FROM_NAME || "TCC Idea Builder",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || "",
  emailEnabled: String(process.env.EMAIL_ENABLED || "false").toLowerCase() === "true",
  emailRetryMax: Number(process.env.EMAIL_RETRY_MAX) || 3,
  emailRetryBaseMs: Number(process.env.EMAIL_RETRY_BASE_MS) || 30000
};

module.exports = env;
