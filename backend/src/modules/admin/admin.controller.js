const adminService = require("./admin.service");

const listUsers = async (req, res, next) => {
  try {
    const result = await adminService.listUsers(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const adjustCredits = async (req, res, next) => {
  try {
    const result = await adminService.adjustCredits({
      userId: req.params.id,
      delta: req.body.delta,
      adminId: req.user.id
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const listLedger = async (req, res, next) => {
  try {
    const result = await adminService.listLedger(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listUsers,
  adjustCredits,
  listLedger
};
