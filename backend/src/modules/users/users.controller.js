const usersService = require("./users.service");

const getSettings = async (req, res, next) => {
  try {
    const settings = await usersService.getSettings(req.user.id);
    return res.status(200).json({ settings });
  } catch (error) {
    return next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await usersService.updateSettings({
      userId: req.user.id,
      role: req.user.role,
      payload: req.body
    });

    return res.status(200).json({ settings });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
