"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("credit_ledger", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()")
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      type: {
        type: Sequelize.ENUM("DEBIT", "CREDIT"),
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reason: {
        type: Sequelize.ENUM("GENERATION", "ADMIN_ADJUST", "REFUND", "BONUS"),
        allowNull: false
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "projects",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      performed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      idempotency_key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()")
      }
    });

    await queryInterface.addIndex("credit_ledger", ["user_id", "idempotency_key"], {
      unique: true,
      name: "credit_ledger_user_idempotency_key_unique"
    });

    await queryInterface.addIndex("credit_ledger", ["user_id", "created_at"], {
      name: "credit_ledger_user_created_at_idx"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "credit_ledger",
      "credit_ledger_user_idempotency_key_unique"
    );
    await queryInterface.removeIndex("credit_ledger", "credit_ledger_user_created_at_idx");
    await queryInterface.dropTable("credit_ledger");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_credit_ledger_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_credit_ledger_reason";'
    );
  }
};
