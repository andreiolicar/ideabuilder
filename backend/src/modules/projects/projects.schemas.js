const { z } = require("zod");

const listProjectsSchema = {
  query: z.object({
    search: z.string().trim().min(1).max(255).optional(),
    tag: z.string().trim().min(1).max(100).optional(),
    category: z.string().trim().min(1).max(120).optional(),
    sort: z.enum(["recent", "az"]).optional().default("recent"),
    page: z.coerce.number().int().min(1).optional().default(1)
  })
};

const projectIdSchema = {
  params: z.object({
    id: z.string().uuid()
  })
};

const updateProjectSchema = {
  params: z.object({
    id: z.string().uuid()
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(255).optional(),
      category: z.union([z.string().trim().min(1).max(120), z.null()]).optional(),
      tags: z.array(z.string().trim().min(1).max(100)).max(30).optional()
    })
    .refine(
      (body) =>
        body.title !== undefined ||
        body.category !== undefined ||
        body.tags !== undefined,
      {
        message: "At least one field must be provided"
      }
    )
};

const generateProjectSchema = {
  body: z.object({
    title: z.string().trim().max(255).optional(),
    category: z.string().trim().min(1).max(120).optional(),
    tags: z.array(z.string().trim().min(1).max(100)).max(30),
    description: z.string().trim().min(10).max(10000),
    maxCost: z.coerce.number().min(0),
    preferences: z.string().trim().max(5000).optional(),
    constraints: z.string().trim().max(5000).optional()
  })
};

const exportProjectPdfSchema = {
  params: z.object({
    id: z.string().uuid()
  }),
  query: z
    .object({
      scope: z.enum(["document", "project"]),
      type: z.enum(["GENERAL", "TECH_SPECS", "ROADMAP"]).optional()
    })
    .superRefine((value, ctx) => {
      if (value.scope === "document" && !value.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["type"],
          message: "type is required when scope=document"
        });
      }
    })
};

const exportProjectsBatchPdfSchema = {
  body: z.object({
    projectIds: z.array(z.string().uuid()).min(1).max(50)
  })
};

module.exports = {
  listProjectsSchema,
  projectIdSchema,
  updateProjectSchema,
  generateProjectSchema,
  exportProjectPdfSchema,
  exportProjectsBatchPdfSchema
};
