module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "password_hash"
      },
      role: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        allowNull: false,
        defaultValue: "USER"
      }
    },
    {
      tableName: "users",
      underscored: true
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Project, { foreignKey: "user_id", as: "projects" });
    User.hasMany(models.RefreshToken, {
      foreignKey: "user_id",
      as: "refreshTokens"
    });
    User.hasMany(models.CreditLedger, { foreignKey: "user_id", as: "ledger" });
    User.hasMany(models.EmailQueue, { foreignKey: "user_id", as: "emails" });
    User.hasMany(models.AuthVerificationCode, {
      foreignKey: "user_id",
      as: "verificationCodes"
    });
    User.hasOne(models.UserSetting, { foreignKey: "user_id", as: "settings" });
  };

  return User;
};
