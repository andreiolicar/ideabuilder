module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id"
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      promptPayload: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: "prompt_payload"
      },
      status: {
        type: DataTypes.ENUM("READY", "GENERATING", "FAILED"),
        allowNull: false,
        defaultValue: "GENERATING"
      }
    },
    {
      tableName: "projects",
      underscored: true
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    Project.hasMany(models.Document, { foreignKey: "project_id", as: "documents" });
  };

  return Project;
};
