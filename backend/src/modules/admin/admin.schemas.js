const { z } = require("zod");

const listUsersSchema = {
  query: z.object({
    search: z.string().trim().min(1).max(255).optional(),
    page: z.coerce.number().int().min(1).optional().default(1)
  })
};

const adjustCreditsSchema = {
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    delta: z.coerce.number().int().refine((value) => value !== 0, {
      message: "delta must be non-zero"
    })
  })
};

const listLedgerSchema = {
  query: z.object({
    userId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).optional().default(1)
  })
};

module.exports = {
  listUsersSchema,
  adjustCreditsSchema,
  listLedgerSchema
};
