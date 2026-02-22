const env = require("../../config/env");
const { EmailQueue, UserSetting } = require("../../models");
const { buildTemplate } = require("./email.templates");

const shouldSendEmailForUser = async (userId, options = {}) => {
  if (!userId) {
    return true;
  }

  const settings = await UserSetting.findOne({
    where: { userId },
    transaction: options.transaction
  });

  if (!settings) {
    return true;
  }

  return settings.emailNotifications !== false;
};

const enqueueEmail = async (
  eventType,
  { userId = null, toEmail, payload = {} },
  options = {}
) => {
  if (!env.emailEnabled) {
    return null;
  }

  if (!toEmail) {
    return null;
  }

  const allowed = await shouldSendEmailForUser(userId, options);
  if (!allowed) {
    return null;
  }

  const template = buildTemplate(eventType, payload);

  const job = await EmailQueue.create(
    {
      userId,
      toEmail,
      eventType,
      subject: template.subject,
      payload: {
        ...payload,
        _template: {
          html: template.html,
          text: template.text
        }
      },
      status: "PENDING",
      maxAttempts: env.emailRetryMax,
      nextAttemptAt: new Date()
    },
    { transaction: options.transaction }
  );

  console.log(
    `[email] enqueued event=${eventType} userId=${userId || "none"} jobId=${job.id}`
  );
  return job;
};

module.exports = {
  enqueueEmail
};
