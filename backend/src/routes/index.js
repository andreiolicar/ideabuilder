const express = require("express");
const { v4: uuidv4 } = require("uuid");
const env = require("../config/env");
const authRoutes = require("../modules/auth/auth.routes");
const adminRoutes = require("../modules/admin/admin.routes");
const projectsRoutes = require("../modules/projects/projects.routes");
const usersRoutes = require("../modules/users/users.routes");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "tcc-idea-builder-api",
    requestId: uuidv4(),
    emailEnabled: env.emailEnabled
  });
});

router.use("/auth", authRoutes);
router.use("/projects", auth, projectsRoutes);
router.use("/users", auth, usersRoutes);
router.use("/admin", auth, requireRole("ADMIN"), adminRoutes);

module.exports = router;
