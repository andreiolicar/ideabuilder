module.exports = (sequelize, DataTypes) => {
  const CreditLedger = sequelize.define(
    "CreditLedger",
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
      type: {
        type: DataTypes.ENUM("DEBIT", "CREDIT"),
        allowNull: false
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      reason: {
        type: DataTypes.ENUM("GENERATION", "ADMIN_ADJUST", "REFUND", "BONUS"),
        allowNull: false
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "project_id"
      },
      performedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "performed_by"
      },
      idempotencyKey: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "idempotency_key"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at"
      }
    },
    {
      tableName: "credit_ledger",
      underscored: true,
      updatedAt: false,
      indexes: [
        {
          name: "credit_ledger_user_idempotency_key_unique",
          unique: true,
          fields: ["user_id", "idempotency_key"]
        },
        {
          name: "credit_ledger_user_created_at_idx",
          fields: ["user_id", "created_at"]
        }
      ]
    }
  );

  CreditLedger.associate = (models) => {
    CreditLedger.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    CreditLedger.belongsTo(models.Project, { foreignKey: "project_id", as: "project" });
    CreditLedger.belongsTo(models.User, {
      foreignKey: "performed_by",
      as: "performedByUser"
    });
  };

  return CreditLedger;
};
