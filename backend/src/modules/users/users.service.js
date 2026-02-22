const { UserSetting } = require("../../models");
const { httpError } = require("../../utils/httpError");

const COMMON_KEYS = ["locale", "emailNotifications", "dashboardDefaultSort"];
const ADMIN_KEYS = ["compactTables", "requireDangerConfirm", "itemsPerPage"];

const SETTINGS_DEFAULTS = {
  locale: "pt-BR",
  emailNotifications: true,
  dashboardDefaultSort: "recent",
  compactTables: false,
  requireDangerConfirm: true,
  itemsPerPage: 20
};

const getOrCreateSettings = async (userId) => {
  const [settings] = await UserSetting.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      ...SETTINGS_DEFAULTS
    }
  });

  return settings;
};

const getSettings = async (userId) => {
  return getOrCreateSettings(userId);
};

const updateSettings = async ({ userId, role, payload }) => {
  const hasAdminField = ADMIN_KEYS.some(
    (key) =>
      Object.prototype.hasOwnProperty.call(payload, key) &&
      payload[key] !== undefined
  );

  if (hasAdminField && role !== "ADMIN") {
    throw httpError(
      403,
      "You do not have permission to update admin settings",
      null,
      "FORBIDDEN_ADMIN_SETTINGS"
    );
  }

  const allowedKeys = role === "ADMIN" ? [...COMMON_KEYS, ...ADMIN_KEYS] : COMMON_KEYS;
  const nextValues = {};

  for (const key of allowedKeys) {
    if (
      Object.prototype.hasOwnProperty.call(payload, key) &&
      payload[key] !== undefined
    ) {
      nextValues[key] = payload[key];
    }
  }

  const settings = await getOrCreateSettings(userId);
  await settings.update(nextValues);
  return settings;
};

module.exports = {
  getSettings,
  updateSettings
};
