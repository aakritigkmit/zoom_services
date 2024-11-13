("use strict");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: `${__dirname}/../../.env` });
module.exports = {
  up: async (queryInterface) => {
    // Insert roles
    const roles = [
      {
        name: "Customer",
      },
      {
        name: "Admin",
      },
      {
        name: "Car Owner",
      },
    ];
    await queryInterface.bulkInsert("roles", roles, {});
    // Create the admin user
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "12345678",
      10,
    );
    const adminUser = {
      name: "Aakriti",
      email: "aakriti@gkmit.co",
      phone_number: "7827634288",
      password: hashedPassword,
      city: "Delhi",
    };
    await queryInterface.bulkInsert("users", [adminUser], {});
    // Get the 'Admin' role ID from the database
    const adminRole = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'Admin';`,
    );
    if (adminRole[0] && adminRole[0][0]) {
      const adminRoleId = adminRole[0][0].id;
      const user = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email = 'aakriti@gkmit.co';`,
      );
      if (user[0] && user[0][0]) {
        const userId = user[0][0].id;
        const userRoleAssociation = {
          user_id: userId,
          role_id: adminRoleId,
        };
        await queryInterface.bulkInsert(
          "users_roles",
          [userRoleAssociation],
          {},
        );
      }
    }
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("users_roles", null, {});
    await queryInterface.bulkDelete("users", { email: "aakriti@gkmit.co" }, {});
    await queryInterface.bulkDelete("roles", null, {});
  },
};
