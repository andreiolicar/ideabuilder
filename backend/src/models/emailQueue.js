module.exports = (sequelize, DataTypes) => {
  const EmailQueue = sequelize.define(
    "EmailQueue",
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
      toEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "to_email"
      },
      eventType: {
        type: DataTypes.ENUM(
          "REGISTER",
          "LOGIN",
          "PROJECT_CREATED",
          "CREDITS_CHANGED",
          "SECURITY_CODE"
        ),
        allowNull: false,
        field: "event_type"
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      status: {
        type: DataTypes.ENUM("PENDING", "PROCESSING", "SENT", "FAILED"),
        allowNull: false,
        defaultValue: "PENDING"
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
        defaultValue: 3,
        field: "max_attempts"
      },
      nextAttemptAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "next_attempt_at"
      },
      lastError: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "last_error"
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "sent_at"
      }
    },
    {
      tableName: "email_queue",
      underscored: true,
      indexes: [
        {
          name: "email_queue_status_next_attempt_idx",
          fields: ["status", "next_attempt_at"]
        },
        {
          name: "email_queue_user_created_idx",
          fields: ["user_id", "created_at"]
        }
      ]
    }
  );

  EmailQueue.associate = (models) => {
    EmailQueue.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return EmailQueue;
};
