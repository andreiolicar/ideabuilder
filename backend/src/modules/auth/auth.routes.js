const express = require("express");
const validate = require("../../middlewares/validate");
const {
  authRateLimit,
  forgotPasswordRequestRateLimit,
  forgotPasswordConfirmRateLimit
} = require("../../middlewares/rateLimit");
const auth = require("../../middlewares/auth");
const authController = require("./auth.controller");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  revokeAllSessionsSchema,
  forgotPasswordRequestSchema,
  forgotPasswordConfirmSchema
} = require("./auth.schemas");

const router = express.Router();

router.post("/register", authRateLimit, validate(registerSchema), authController.register);
router.post("/login", authRateLimit, validate(loginSchema), authController.login);
router.post("/refresh", authRateLimit, validate(refreshSchema), authController.refresh);
router.post("/logout", authRateLimit, validate(refreshSchema), authController.logout);
router.post(
  "/forgot-password/request-code",
  forgotPasswordRequestRateLimit,
  validate(forgotPasswordRequestSchema),
  authController.forgotPasswordRequestCode
);
router.post(
  "/forgot-password/confirm",
  forgotPasswordConfirmRateLimit,
  validate(forgotPasswordConfirmSchema),
  authController.forgotPasswordConfirm
);
router.post(
  "/sessions/revoke-all",
  auth,
  validate(revokeAllSessionsSchema),
  authController.revokeAllSessions
);

module.exports = router;
