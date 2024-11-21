"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("cars", "chassis_number", {
      type: Sequelize.STRING,
      allowNull: false, // Temporarily allow NULL values
      unique: true,
    });

    // Step 2: Populate the column with unique values, e.g., based on the car's id
    await queryInterface.sequelize.query(`
      UPDATE cars 
      SET chassis_number = CONCAT('CH-', id)
      WHERE chassis_number IS NULL
    `);

    // Step 3: Update the column to NOT NULL after all rows have valid values
    await queryInterface.changeColumn("cars", "chassis_number", {
      type: Sequelize.STRING,
      allowNull: false, // Now enforce NOT NULL constraint
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("movies", "category");
  },
};
