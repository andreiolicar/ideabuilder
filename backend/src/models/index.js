const fs = require("fs");
const path = require("path");
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};
const basename = path.basename(__filename);

for (const file of fs.readdirSync(__dirname)) {
  if (!file.endsWith(".js") || file === basename) {
    continue;
  }

  const defineModel = require(path.join(__dirname, file));
  const model = defineModel(sequelize, DataTypes);
  db[model.name] = model;
}

for (const model of Object.values(db)) {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
}

db.sequelize = sequelize;

module.exports = db;
