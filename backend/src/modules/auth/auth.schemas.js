const { z } = require("zod");

const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128)
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128)
  })
};

const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1)
  })
};

const revokeAllSessionsSchema = {
  body: z.object({}).optional()
};

const forgotPasswordRequestSchema = {
  body: z.object({
    email: z.string().trim().email().max(255)
  })
};

const forgotPasswordConfirmSchema = {
  body: z.object({
    email: z.string().trim().email().max(255),
    code: z.string().trim().regex(/^\d{6}$/),
    newPassword: z.string().min(8).max(128)
  })
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  revokeAllSessionsSchema,
  forgotPasswordRequestSchema,
  forgotPasswordConfirmSchema
};
