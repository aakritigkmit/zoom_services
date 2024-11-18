const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/../../.env` });

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: `${process.env.DB_PASSWORD}`,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USERNAME,
    password: `${process.env.DB_PASSWORD}`,
    database: process.env.TEST_DATABASE,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
};
