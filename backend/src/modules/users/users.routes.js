const express = require("express");
const validate = require("../../middlewares/validate");
const usersController = require("./users.controller");
const { updateSettingsSchema } = require("./users.schemas");

const router = express.Router();

router.get("/settings", usersController.getSettings);
router.patch(
  "/settings",
  validate(updateSettingsSchema),
  usersController.updateSettings
);

module.exports = router;
