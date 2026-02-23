const express = require("express");
const validate = require("../../middlewares/validate");
const { generationRateLimit } = require("../../middlewares/rateLimit");
const projectsController = require("./projects.controller");
const {
  listProjectsSchema,
  projectIdSchema,
  updateProjectSchema,
  generateProjectSchema,
  exportProjectPdfSchema,
  exportProjectsBatchPdfSchema
} = require("./projects.schemas");

const router = express.Router();

router.get("/", validate(listProjectsSchema), projectsController.listProjects);
router.post(
  "/generate",
  generationRateLimit,
  validate(generateProjectSchema),
  projectsController.generateProject
);
router.post(
  "/export/pdf",
  validate(exportProjectsBatchPdfSchema),
  projectsController.exportProjectsBatchPdf
);
router.get(
  "/:id/export/pdf",
  validate(exportProjectPdfSchema),
  projectsController.exportProjectPdf
);
router.get("/:id", validate(projectIdSchema), projectsController.getProjectById);
router.patch("/:id", validate(updateProjectSchema), projectsController.updateProject);
router.delete("/:id", validate(projectIdSchema), projectsController.deleteProject);

module.exports = router;
