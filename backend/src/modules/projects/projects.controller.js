const projectsService = require("./projects.service");

const listProjects = async (req, res, next) => {
  try {
    const result = await projectsService.listProjects(req.user.id, req.query);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectsService.getProjectById(req.user.id, req.params.id);
    return res.status(200).json({ project });
  } catch (error) {
    return next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectsService.updateProject(req.user.id, req.params.id, req.body);
    return res.status(200).json({ project });
  } catch (error) {
    return next(error);
  }
};

const generateProject = async (req, res, next) => {
  try {
    const idempotencyKey = req.get("Idempotency-Key");
    const result = await projectsService.generateProject(
      req.user.id,
      req.body,
      idempotencyKey
    );
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listProjects,
  getProjectById,
  updateProject,
  generateProject
};
