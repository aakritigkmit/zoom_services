"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("transactions", "amount", {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("transactions", "amount");
  },
};
