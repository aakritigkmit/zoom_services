"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("cars", "chassis_number", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE cars 
      SET chassis_number = CONCAT('CH-', id)
      WHERE chassis_number IS NULL
    `);

    await queryInterface.changeColumn("cars", "chassis_number", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("cars", "chassis_number");
  },
};
