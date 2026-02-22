"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("auth_verification_codes", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()")
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      purpose: {
        type: Sequelize.ENUM("EMAIL_CHANGE", "PASSWORD_CHANGE", "PASSWORD_RESET"),
        allowNull: false
      },
      code_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      attempt_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      resend_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      window_starts_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()")
      },
      last_sent_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()")
      },
      consumed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()")
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()")
      }
    });

    await queryInterface.addIndex(
      "auth_verification_codes",
      ["email", "purpose", "created_at"],
      { name: "auth_verification_codes_email_purpose_created_idx" }
    );
    await queryInterface.addIndex(
      "auth_verification_codes",
      ["user_id", "purpose", "created_at"],
      { name: "auth_verification_codes_user_purpose_created_idx" }
    );
    await queryInterface.addIndex(
      "auth_verification_codes",
      ["purpose", "expires_at"],
      { name: "auth_verification_codes_purpose_expires_idx" }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "auth_verification_codes",
      "auth_verification_codes_email_purpose_created_idx"
    );
    await queryInterface.removeIndex(
      "auth_verification_codes",
      "auth_verification_codes_user_purpose_created_idx"
    );
    await queryInterface.removeIndex(
      "auth_verification_codes",
      "auth_verification_codes_purpose_expires_idx"
    );
    await queryInterface.dropTable("auth_verification_codes");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_auth_verification_codes_purpose";'
    );
  }
};
