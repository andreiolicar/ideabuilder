module.exports = (sequelize, DataTypes) => {
  const UserSetting = sequelize.define(
    "UserSetting",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: "user_id"
      },
      locale: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pt-BR"
      },
      emailNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "email_notifications"
      },
      dashboardDefaultSort: {
        type: DataTypes.ENUM("recent", "az"),
        allowNull: false,
        defaultValue: "recent",
        field: "dashboard_default_sort"
      },
      compactTables: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "compact_tables"
      },
      requireDangerConfirm: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "require_danger_confirm"
      },
      itemsPerPage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
        field: "items_per_page"
      }
    },
    {
      tableName: "user_settings",
      underscored: true
    }
  );

  UserSetting.associate = (models) => {
    UserSetting.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return UserSetting;
};
