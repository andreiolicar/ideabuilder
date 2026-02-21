const express = require("express");
const validate = require("../../middlewares/validate");
const { authRateLimit } = require("../../middlewares/rateLimit");
const authController = require("./auth.controller");
const { registerSchema, loginSchema, refreshSchema } = require("./auth.schemas");

const router = express.Router();

router.post("/register", authRateLimit, validate(registerSchema), authController.register);
router.post("/login", authRateLimit, validate(loginSchema), authController.login);
router.post("/refresh", authRateLimit, validate(refreshSchema), authController.refresh);
router.post("/logout", authRateLimit, validate(refreshSchema), authController.logout);

module.exports = router;
