const nodemailer = require("nodemailer");
const env = require("../../config/env");

let transporter = null;

const hasSmtpConfig = () =>
  Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.smtpFromEmail);

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: 10000,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const client = getTransporter();
  return client.sendMail({
    from: `${env.smtpFromName} <${env.smtpFromEmail}>`,
    to,
    subject,
    html,
    text
  });
};

module.exports = {
  hasSmtpConfig,
  sendEmail
};
