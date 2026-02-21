const express = require("express");
const validate = require("../../middlewares/validate");
const adminController = require("./admin.controller");
const {
  listUsersSchema,
  adjustCreditsSchema,
  listLedgerSchema
} = require("./admin.schemas");

const router = express.Router();

router.get("/users", validate(listUsersSchema), adminController.listUsers);
router.patch(
  "/users/:id/credits",
  validate(adjustCreditsSchema),
  adminController.adjustCredits
);
router.get("/credits/ledger", validate(listLedgerSchema), adminController.listLedger);

module.exports = router;
