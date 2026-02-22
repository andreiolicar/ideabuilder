"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("email_queue", {
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
      to_email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      event_type: {
        type: Sequelize.ENUM(
          "REGISTER",
          "LOGIN",
          "PROJECT_CREATED",
          "CREDITS_CHANGED"
        ),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM("PENDING", "PROCESSING", "SENT", "FAILED"),
        allowNull: false,
        defaultValue: "PENDING"
      },
      attempt_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3
      },
      next_attempt_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()")
      },
      last_error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sent_at: {
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

    await queryInterface.addIndex("email_queue", ["status", "next_attempt_at"], {
      name: "email_queue_status_next_attempt_idx"
    });

    await queryInterface.addIndex("email_queue", ["user_id", "created_at"], {
      name: "email_queue_user_created_idx"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("email_queue", "email_queue_status_next_attempt_idx");
    await queryInterface.removeIndex("email_queue", "email_queue_user_created_idx");
    await queryInterface.dropTable("email_queue");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_email_queue_event_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_email_queue_status";');
  }
};
