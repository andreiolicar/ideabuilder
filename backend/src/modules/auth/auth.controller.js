const authService = require("./auth.service");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refreshSession(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout
};
