const { z } = require("zod");

const settingsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  locale: z.string().trim().min(2).max(20),
  emailNotifications: z.boolean(),
  dashboardDefaultSort: z.enum(["recent", "az"]),
  compactTables: z.boolean(),
  requireDangerConfirm: z.boolean(),
  itemsPerPage: z.number().int().min(5).max(100)
});

const updateSettingsSchema = {
  body: z
    .object({
      locale: z.string().trim().min(2).max(20).optional(),
      emailNotifications: z.boolean().optional(),
      dashboardDefaultSort: z.enum(["recent", "az"]).optional(),
      compactTables: z.boolean().optional(),
      requireDangerConfirm: z.boolean().optional(),
      itemsPerPage: z.coerce.number().int().min(5).max(100).optional()
    })
    .refine(
      (body) =>
        body.locale !== undefined ||
        body.emailNotifications !== undefined ||
        body.dashboardDefaultSort !== undefined ||
        body.compactTables !== undefined ||
        body.requireDangerConfirm !== undefined ||
        body.itemsPerPage !== undefined,
      { message: "At least one field must be provided" }
    )
};

module.exports = {
  settingsSchema,
  updateSettingsSchema
};
