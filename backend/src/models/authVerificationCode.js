module.exports = (sequelize, DataTypes) => {
  const AuthVerificationCode = sequelize.define(
    "AuthVerificationCode",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "user_id"
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      purpose: {
        type: DataTypes.ENUM("EMAIL_CHANGE", "PASSWORD_CHANGE", "PASSWORD_RESET"),
        allowNull: false
      },
      codeHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "code_hash"
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expires_at"
      },
      attemptCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "attempt_count"
      },
      maxAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        field: "max_attempts"
      },
      resendCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: "resend_count"
      },
      windowStartsAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "window_starts_at"
      },
      lastSentAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "last_sent_at"
      },
      consumedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "consumed_at"
      }
    },
    {
      tableName: "auth_verification_codes",
      underscored: true,
      indexes: [
        {
          name: "auth_verification_codes_email_purpose_created_idx",
          fields: ["email", "purpose", "created_at"]
        },
        {
          name: "auth_verification_codes_user_purpose_created_idx",
          fields: ["user_id", "purpose", "created_at"]
        },
        {
          name: "auth_verification_codes_purpose_expires_idx",
          fields: ["purpose", "expires_at"]
        }
      ]
    }
  );

  AuthVerificationCode.associate = (models) => {
    AuthVerificationCode.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return AuthVerificationCode;
};
