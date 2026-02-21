const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "tcc-idea-builder-api",
    requestId: uuidv4()
  });
});

module.exports = router;
