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

const deleteProject = async (req, res, next) => {
  try {
    await projectsService.deleteProject(req.user.id, req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const exportProjectPdf = async (req, res, next) => {
  try {
    const result = await projectsService.exportProjectPdf({
      userId: req.user.id,
      projectId: req.params.id,
      scope: req.query.scope,
      type: req.query.type
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.buffer);
  } catch (error) {
    return next(error);
  }
};

const exportProjectsBatchPdf = async (req, res, next) => {
  try {
    const result = await projectsService.exportProjectsBatchPdf({
      userId: req.user.id,
      projectIds: req.body.projectIds
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.buffer);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listProjects,
  getProjectById,
  updateProject,
  generateProject,
  deleteProject,
  exportProjectPdf,
  exportProjectsBatchPdf
};
