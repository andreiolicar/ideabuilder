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
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const revokeAllSessions = async (req, res, next) => {
  try {
    await authService.revokeAllSessions(req.user.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const forgotPasswordRequestCode = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordRequestCode(req.body.email);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const forgotPasswordConfirm = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordConfirm(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  revokeAllSessions,
  forgotPasswordRequestCode,
  forgotPasswordConfirm
};
