"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_settings", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()")
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      locale: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pt-BR"
      },
      email_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      dashboard_default_sort: {
        type: Sequelize.ENUM("recent", "az"),
        allowNull: false,
        defaultValue: "recent"
      },
      compact_tables: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      require_danger_confirm: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      items_per_page: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_settings");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_user_settings_dashboard_default_sort";'
    );
  }
};
