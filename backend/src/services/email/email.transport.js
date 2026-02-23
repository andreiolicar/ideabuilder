const { Resend } = require("resend");
const env = require("../../config/env");

let resendClient = null;

const hasEmailProviderConfig = () =>
  Boolean(env.resendApiKey && env.smtpFromEmail);

const getResendClient = () => {
  if (resendClient) {
    return resendClient;
  }

  resendClient = new Resend(process.env.RESEND_API_KEY);

  return resendClient;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: `${env.smtpFromName} <${env.smtpFromEmail}>`,
    to,
    subject,
    html,
    text
  });

  if (error) {
    const transportError = new Error(error.message || "Resend API error");
    transportError.code = error.name || error.statusCode || "RESEND_ERROR";
    transportError.command = "resend.emails.send";
    transportError.details = error;
    throw transportError;
  }

  return data;
};

module.exports = {
  hasEmailProviderConfig,
  sendEmail
};
