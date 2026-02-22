const express = require("express");
const validate = require("../../middlewares/validate");
const { generationRateLimit } = require("../../middlewares/rateLimit");
const projectsController = require("./projects.controller");
const {
  listProjectsSchema,
  projectIdSchema,
  updateProjectSchema,
  generateProjectSchema
} = require("./projects.schemas");

const router = express.Router();

router.get("/", validate(listProjectsSchema), projectsController.listProjects);
router.post(
  "/generate",
  generationRateLimit,
  validate(generateProjectSchema),
  projectsController.generateProject
);
router.get("/:id", validate(projectIdSchema), projectsController.getProjectById);
router.patch("/:id", validate(updateProjectSchema), projectsController.updateProject);
router.delete("/:id", validate(projectIdSchema), projectsController.deleteProject);

module.exports = router;
