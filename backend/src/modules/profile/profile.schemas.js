const { z } = require("zod");

const codeSchema = z.string().trim().regex(/^\d{6}$/);

const updateProfileSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(120)
  })
};

const requestEmailChangeCodeSchema = {
  body: z.object({
    newEmail: z.string().trim().email().max(255)
  })
};

const confirmEmailChangeSchema = {
  body: z.object({
    newEmail: z.string().trim().email().max(255),
    code: codeSchema
  })
};

const requestPasswordChangeCodeSchema = {
  body: z.object({}).optional()
};

const confirmPasswordChangeSchema = {
  body: z.object({
    code: codeSchema,
    newPassword: z.string().min(8).max(128)
  })
};

module.exports = {
  updateProfileSchema,
  requestEmailChangeCodeSchema,
  confirmEmailChangeSchema,
  requestPasswordChangeCodeSchema,
  confirmPasswordChangeSchema
};
