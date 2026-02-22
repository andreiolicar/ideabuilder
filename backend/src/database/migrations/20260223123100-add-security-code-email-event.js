"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_email_queue_event_type\" ADD VALUE IF NOT EXISTS 'SECURITY_CODE';"
    );
  },

  async down() {
    // Postgres does not support removing enum values safely in-place.
  }
};
