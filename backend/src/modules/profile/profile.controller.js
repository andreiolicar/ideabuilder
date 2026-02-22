const profileService = require("./profile.service");

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    return res.status(200).json({ profile });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ profile });
  } catch (error) {
    return next(error);
  }
};

const requestEmailChangeCode = async (req, res, next) => {
  try {
    await profileService.requestEmailChangeCode(req.user.id, req.body.newEmail);
    return res.status(200).json({
      message: "Codigo enviado para o novo e-mail"
    });
  } catch (error) {
    return next(error);
  }
};

const confirmEmailChange = async (req, res, next) => {
  try {
    await profileService.confirmEmailChange(req.user.id, req.body.newEmail, req.body.code);
    return res.status(200).json({
      message: "E-mail atualizado com sucesso",
      requiresReauth: true
    });
  } catch (error) {
    return next(error);
  }
};

const requestPasswordChangeCode = async (req, res, next) => {
  try {
    await profileService.requestPasswordChangeCode(req.user.id);
    return res.status(200).json({
      message: "Codigo enviado para seu e-mail atual"
    });
  } catch (error) {
    return next(error);
  }
};

const confirmPasswordChange = async (req, res, next) => {
  try {
    await profileService.confirmPasswordChange(
      req.user.id,
      req.body.code,
      req.body.newPassword
    );
    return res.status(200).json({
      message: "Senha atualizada com sucesso",
      requiresReauth: true
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  requestEmailChangeCode,
  confirmEmailChange,
  requestPasswordChangeCode,
  confirmPasswordChange
};
