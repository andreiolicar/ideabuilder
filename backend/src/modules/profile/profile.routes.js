const express = require("express");
const validate = require("../../middlewares/validate");
const {
  profileSecurityRateLimit
} = require("../../middlewares/rateLimit");
const profileController = require("./profile.controller");
const {
  updateProfileSchema,
  requestEmailChangeCodeSchema,
  confirmEmailChangeSchema,
  requestPasswordChangeCodeSchema,
  confirmPasswordChangeSchema
} = require("./profile.schemas");

const router = express.Router();

router.get("/", profileController.getProfile);
router.patch("/", validate(updateProfileSchema), profileController.updateProfile);

router.post(
  "/email/request-code",
  profileSecurityRateLimit,
  validate(requestEmailChangeCodeSchema),
  profileController.requestEmailChangeCode
);
router.post(
  "/email/confirm",
  profileSecurityRateLimit,
  validate(confirmEmailChangeSchema),
  profileController.confirmEmailChange
);
router.post(
  "/password/request-code",
  profileSecurityRateLimit,
  validate(requestPasswordChangeCodeSchema),
  profileController.requestPasswordChangeCode
);
router.post(
  "/password/confirm",
  profileSecurityRateLimit,
  validate(confirmPasswordChangeSchema),
  profileController.confirmPasswordChange
);

module.exports = router;
