module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define(
    "Document",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "project_id"
      },
      type: {
        type: DataTypes.ENUM("GENERAL", "TECH_SPECS", "ROADMAP"),
        allowNull: false
      },
      contentMd: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "content_md"
      }
    },
    {
      tableName: "documents",
      underscored: true
    }
  );

  Document.associate = (models) => {
    Document.belongsTo(models.Project, { foreignKey: "project_id", as: "project" });
  };

  return Document;
};
