const express = require("express");
const { v4: uuidv4 } = require("uuid");
const authRoutes = require("../modules/auth/auth.routes");
const adminRoutes = require("../modules/admin/admin.routes");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "tcc-idea-builder-api",
    requestId: uuidv4()
  });
});

router.use("/auth", authRoutes);
router.use("/admin", auth, requireRole("ADMIN"), adminRoutes);

module.exports = router;
